import { View, StyleSheet } from "react-native";
import { SwipeableCard } from "../../features/swipe-logic/swipeableCard";
import { ProductCard } from "../../shared/ui/ProductCard";
import { Product } from "../../entities/product/type";

type SwipeCardStackProps = {
  visibleProducts?: Product[];
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

export function SwipeCardStack({
  visibleProducts = [],
  onSwipeLeft,
  onSwipeRight,
}: SwipeCardStackProps) {
  return (
    <View style={styles.container}>
      {visibleProducts.map((item: any, i: number) => {
        const isTop = i === 0;
        const card = <ProductCard product={item} />;
        return (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                position: "absolute",
                bottom: i * 30,
                zIndex: 10 - i,
                transform: [{ scale: 1 - i * 0.05 }],
              },
            ]}
          >
            {isTop ? (
              <SwipeableCard
                onSwipeLeft={onSwipeLeft}
                onSwipeRight={onSwipeRight}
              >
                {card}
              </SwipeableCard>
            ) : (
              card
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 450, // match your card height
    alignItems: "center",
    justifyContent: "center",
  },
  card: {},
});
