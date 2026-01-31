import { apiClient } from "../../shared/api/client";
import { Product } from "./type";

export async function fetchProducts(): Promise<Product[]> {
  const res = await apiClient.get("/products");
  return res.data;
}

export async function likeProduct(productId: string) {
  return apiClient.post(`/products/${productId}/like`);
}

export async function dislikeProduct(productId: string) {
  return apiClient.post(`/products/${productId}/dislike`);
}
