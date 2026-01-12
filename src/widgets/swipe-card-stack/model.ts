import { useState } from "react";
import { products } from "../../entities/product/product";

export function useSwipeStack() {
  const [index, setIndex] = useState(0);
  const visibleProducts = products.slice(index, index + 4);

  const swipeLeft = () => {
    setIndex((i) => i + 1);
  };

  const swipeRight = () => {
    setIndex((i) => i + 1);
  };

  return {
    visibleProducts,
    swipeLeft,
    swipeRight,
  };
}
