import { SwipeCardStack } from "./ui";
import { useSwipeStack } from "./model";

export function FurnitureSwipe() {
  const { visibleProducts, swipeLeft, swipeRight } = useSwipeStack();
  return (
    <SwipeCardStack
      visibleProducts={visibleProducts}
      onSwipeLeft={swipeLeft}
      onSwipeRight={swipeRight}
    />
  );
}
