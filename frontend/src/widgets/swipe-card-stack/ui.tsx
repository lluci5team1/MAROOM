// widgets/swipe-card-deck/ui/SwipeCardDeck.tsx
import { View } from "react-native";
import { useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { Product } from "../../entities/product/type";
import { ProductCard } from "../../shared/ui/ProductCard";
import { SwipeableCard } from "../../features/swipe-logic/swipeableCard";
import { ProductCardBack } from "../../shared/ui/ProductCardBack";

type Props = {
  products: Product[];
};

export function SwipeCardDeck({ products }: Props) {
  const [data, setData] = useState([...products, ...products]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValues = useSharedValue(0);

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
            onSwiped={() => {
              setCurrentIndex((i) => i + 1);
              setData((prev) => [...prev, prev[currentIndex]]);
            }}
            front={<ProductCard product={item} />}
            back={<ProductCardBack product={item} />}
          ></SwipeableCard>
        );
      })}
    </View>
  );
}
