// features/auth/api.ts
import { apiClient } from "../../shared/api/client";

export interface AuthResponse {
  token: string;
  userId: string;
  hasCompletedOnboarding: boolean;
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
  const res = await apiClient.get(`/users/${userId}`);
  const user = res.data as UserProfile;
  // Never keep inline base64 in JS heap — it crashes Hermes + native Image on Profile tab.
  if (user.profilePictureUrl?.startsWith("data:")) {
    return { ...user, profilePictureUrl: undefined };
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
