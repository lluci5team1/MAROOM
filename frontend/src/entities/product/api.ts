// features/furniture/api.ts
import { apiClient } from "../../shared/api/client";
import { Product } from "./type";
import { products } from "./product";

export async function fetchFurnitureItemsTEMP(): Promise<Product[]> {
  return products;
}

export async function searchProductTEMP(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => p.title.toLowerCase().includes(q));
}

export async function fetchFurnitureItems(): Promise<Product[]> {
  const res = await apiClient.get("/api/furniture-items");
  return res.data;
}

export async function fetchFurnitureItem(id: string): Promise<Product> {
  const res = await apiClient.get(`/api/furniture-items/${id}`);
  return res.data;
}

export async function createFurnitureItem(item: Product) {
  const res = await apiClient.post("/api/furniture-items", item);
  return res.data;
}
