// widgets/swipe-card-deck/ui/SwipeCardDeck.tsx
import { View } from "react-native";
import { useState } from "react";
import { useSharedValue, SharedValue } from "react-native-reanimated";
import { Product } from "../../entities/product/type";
import { ProductCard } from "../../shared/ui/ProductCard";
import { SwipeableCard } from "../../features/main-page/swipeable-card/swipeableCard";
import { ProductCardBack } from "../../shared/ui/ProductCardBack";
import { RoundButton } from "../../shared/ui/likeButton";
import { icons } from "../../shared/assets/icons";
import { swipeProduct } from "../../entities/product/api";

type Props = {
  products: Product[];
  userId: string | null;
};

type SwipeActions = {
  left?: () => void;
  right?: () => void;
  translateX: SharedValue<number>;
};

export function SwipeCardDeck({ products, userId }: Props) {
  const [data, setData] = useState([...products, ...products]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValues = useSharedValue(0);
  const [swipeActions, setSwipeActions] = useState<SwipeActions | null>(null);

  const MAX = 4;

  const handleSwiped = (direction: "LEFT" | "RIGHT", item: Product) => {
    setCurrentIndex((i) => i + 1);
    setData((prev) => [...prev, prev[currentIndex]]);
    if (userId) {
      swipeProduct(userId, item.id, direction).catch(() => {});
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {data.map((item, index) => {
        if (index < currentIndex || index > currentIndex + MAX) return null;

        return (
          <SwipeableCard
            key={index}
            index={index}
            currentIndex={currentIndex}
            animatedValues={animatedValues}
            maxVisibleItem={MAX}
            dataLength={data.length}
            registerActions={(actions) => {
              setSwipeActions(actions);
            }}
            onSwiped={(direction) => handleSwiped(direction, item)}
            front={<ProductCard product={item} />}
            back={<ProductCardBack product={item} />}
          />
        );
      })}

      {/* External buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 40,
          flexDirection: "row",
          gap: 60,
        }}
      >
        <RoundButton
          icon={icons.X}
          variant="dislike"
          translateX={swipeActions?.translateX}
          onPress={() => swipeActions?.left?.()}
        />

        <RoundButton
          icon={icons.heart}
          variant="like"
          translateX={swipeActions?.translateX}
          onPress={() => swipeActions?.right?.()}
        />
      </View>
    </View>
  );
}
