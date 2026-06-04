import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "auth_user_id";
const ONBOARDING_KEY = "has_completed_onboarding";

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveUserId(userId: string): Promise<void> {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}

export async function getUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

export async function removeUserId(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}

export async function saveOnboardingFlag(value: boolean): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_KEY, value ? "1" : "0");
}

export async function getOnboardingFlag(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return val === "1";
}
