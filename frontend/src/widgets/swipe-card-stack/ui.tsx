// widgets/swipe-card-deck/ui/SwipeCardDeck.tsx
import { View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
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
  const [activePress, setActivePress] = useState<"like" | "dislike" | null>(null);
  const ACTIVE_PRESS_MS = 420;
  const SWIPE_TRIGGER_DELAY_MS = 130;

  const MAX = 4;

  useEffect(() => {
    setData([...products, ...products]);
    setCurrentIndex(0);
  }, [products]);

  const handleSwiped = (direction: "LEFT" | "RIGHT", item: Product) => {
    setCurrentIndex((i) => i + 1);
    setData((prev) => [...prev, prev[currentIndex]]);
    if (userId) {
      swipeProduct(userId, item.id, direction).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
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
      <View style={styles.actions}>
        <RoundButton
          icon={icons.X}
          variant="dislike"
          isActive={activePress === "dislike"}
          translateX={swipeActions?.translateX}
          onPress={() => {
            setActivePress("dislike");
            setTimeout(() => {
              swipeActions?.left?.();
            }, SWIPE_TRIGGER_DELAY_MS);
            setTimeout(() => setActivePress(null), ACTIVE_PRESS_MS);
          }}
        />

        <RoundButton
          icon={icons.heart}
          variant="like"
          isActive={activePress === "like"}
          translateX={swipeActions?.translateX}
          onPress={() => {
            setActivePress("like");
            setTimeout(() => {
              swipeActions?.right?.();
            }, SWIPE_TRIGGER_DELAY_MS);
            setTimeout(() => setActivePress(null), ACTIVE_PRESS_MS);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    position: "absolute",
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
    zIndex: 999,
  },
});
