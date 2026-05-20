import { apiClient } from "../../shared/api/client";

export interface SavePreferencesRequest {
  userId: string;
  homeType: string;
  roomSize: string;
  styles: string[];
  colorPalette: string[];
  minBudget: number;
  maxBudget: number;
}

export async function savePreferences(body: SavePreferencesRequest): Promise<void> {
  await apiClient.post("/preferences", body);
}
