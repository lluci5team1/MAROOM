// features/auth/api.ts
import { apiClient } from "../../shared/api/client";
import { getToken, getProfileCache } from "../../shared/api/token";

const RAILWAY_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://maroom-production.up.railway.app";

export interface AuthResponse {
  token: string;
  userId: string;
  hasCompletedOnboarding: boolean;
  email?: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/login", body);
  return res.data;
}

export async function signup(body: SignupRequest): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/signup", body);
  return res.data;
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/google", { idToken });
  return res.data;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profilePictureUrl?: string;
}

export async function fetchUser(userId: string): Promise<UserProfile> {
  const token = await getToken();
  const res = await fetch(`${RAILWAY_URL}/users/${userId}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`fetchUser failed: ${res.status}`);

  const contentLength = Number(res.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) {
    const cached = await getProfileCache();
    return {
      id: userId,
      email: cached?.email ?? "",
      displayName: cached?.displayName ?? "",
    };
  }

  const user = (await res.json()) as UserProfile;
  if (user.profilePictureUrl?.startsWith("data:")) {
    user.profilePictureUrl = undefined;
  }
  return user;
}

export async function updateUserProfile(
  userId: string,
  data: { displayName?: string; profilePictureUrl?: string }
): Promise<UserProfile> {
  const res = await apiClient.patch(`/users/${userId}`, data);
  return res.data;
}
