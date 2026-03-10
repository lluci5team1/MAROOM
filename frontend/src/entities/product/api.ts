// features/furniture/api.ts
import { apiClient } from "../../shared/api/client";
import { Product } from "./type";

export async function fetchFurnitureItems(): Promise<Product[]> {
  const res = await apiClient.get("/api/furniture-items");
  return res.data;
}

type FurnitureSearchParams = {
  q?: string;
  brand?: string;
  category?: string[];
  roomType?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
};

export async function searchFurnitureItems(
  params: FurnitureSearchParams,
): Promise<Product[]> {
  const query = new URLSearchParams();

  if (params.q?.trim()) query.append("q", params.q.trim());
  if (params.brand?.trim()) query.append("brand", params.brand.trim());
  params.category?.forEach((value) => query.append("category", value));
  params.roomType?.forEach((value) => query.append("roomType", value));
  params.color?.forEach((value) => query.append("color", value));
  if (params.minPrice != null) query.append("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.append("maxPrice", String(params.maxPrice));
  if (params.sortBy?.trim()) query.append("sortBy", params.sortBy.trim());

  const queryString = query.toString();
  const requestUrl = `/api/furniture-items/search?${queryString}`;
  console.log("[ExploreFilter] request params:", params);
  console.log("[ExploreFilter] request url:", requestUrl);

  const res = await apiClient.get(requestUrl);
  console.log("[ExploreFilter] response count:", Array.isArray(res.data) ? res.data.length : -1);
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

export async function swipeProduct(
  userId: string,
  furnitureId: string,
  direction: "LEFT" | "RIGHT",
): Promise<void> {
  await apiClient.post("/swipe", { userId, furnitureId, direction });
}

export async function fetchSavedProducts(userId: string): Promise<Product[]> {
  const res = await apiClient.get(`/saved/${userId}`);
  return res.data.map((item: any) => ({
    id: item.furnitureId,
    title: item.title,
    category: item.category,
    brand: item.brand,
    style: item.style,
    color: item.color,
    price: item.price,
    roomType: item.roomType,
    imageUrl: item.imageUrl,
    productUrl: item.productUrl,
  }));
}

type SavedListDto = {
  id: string;
  userId: string;
  name: string;
};

async function getOrCreateLikedListId(userId: string): Promise<string> {
  const listRes = await apiClient.get(`/saved/lists/${userId}`);
  const likedList = (listRes.data as SavedListDto[]).find((list) => list.name === "Liked");
  if (likedList) return likedList.id;

  const created = await apiClient.post("/saved/lists", {
    userId,
    name: "Liked",
  });
  return created.data.id;
}

export async function saveProductForUser(userId: string, furnitureId: string): Promise<void> {
  const likedListId = await getOrCreateLikedListId(userId);
  await apiClient.post("/saved/items", {
    savedListId: likedListId,
    furnitureId,
  });
}

export async function unsaveProductForUser(userId: string, furnitureId: string): Promise<void> {
  await apiClient.delete(`/saved/${userId}/${furnitureId}`);
}
