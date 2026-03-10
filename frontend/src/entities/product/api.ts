// features/furniture/api.ts
import { apiClient } from "../../shared/api/client";
import { Product } from "./type";

export async function fetchFurnitureItemsTEMP(): Promise<Product[]> {
  return fetchFurnitureItems();
}

export async function searchProductTEMP(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  const items = await fetchFurnitureItems();
  if (!q) return items;
  return items.filter((p) => p.title.toLowerCase().includes(q));
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
