// widgets/swipe-card-deck/ui/SwipeCardDeck.tsx
import { View } from "react-native";
import { useMemo, useRef, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { Product } from "../../entities/product/type";
import { ProductCard } from "../../shared/ui/ProductCard";
import { SwipeableCard } from "../../features/main-page/swipeable-card/swipeableCard";
import { ProductCardBack } from "../../shared/ui/ProductCardBack";
import { RoundButton } from "../../shared/ui/likeButton";
import { icons } from "../../shared/assets/icons";

type Props = {
  products: Product[];
};

type SwipeActions = {
  left?: () => void;
  right?: () => void;
};

export function SwipeCardDeck({ products }: Props) {
  const [data, setData] = useState([...products, ...products]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValues = useSharedValue(0);
  const swipeActions = useRef<SwipeActions>({});

  const MAX = 4;

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
              swipeActions.current = actions;
            }}
            onSwiped={() => {
              setCurrentIndex((i) => i + 1);
              setData((prev) => [...prev, prev[currentIndex]]);
            }}
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
          onPress={() => {
            swipeActions.current.left?.();
          }}
        />
        <RoundButton
          icon={icons.heart}
          variant="like"
          onPress={() => swipeActions.current.right?.()}
        />
      </View>
    </View>
  );
}
