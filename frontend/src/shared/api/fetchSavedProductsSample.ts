import { MOCK_PRODUCTS } from "../../entities/product/mockData";
import { Product } from "../../entities/product/type";

export async function fetchSavedProductsSample(category?: string) {
  return new Promise<Product[]>((resolve) => {
     // 0.5초 지연 -> API 호출 느낌
    setTimeout(() => {resolve(MOCK_PRODUCTS);}, 500);
  });
}
