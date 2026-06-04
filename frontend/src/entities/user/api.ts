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
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
}

export function isSafeProfilePictureUrl(url?: string | null): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) && !trimmed.startsWith("data:");
}

export async function fetchUser(userId: string): Promise<UserProfile> {
  const res = await apiClient.get(`/users/${userId}`);
  return res.data;
}

export async function updateUserProfile(
  userId: string,
  data: { displayName?: string; phoneNumber?: string }
): Promise<UserProfile> {
  const res = await apiClient.patch(`/users/${userId}`, data);
  return res.data;
}

export async function uploadProfilePicture(
  userId: string,
  localUri: string
): Promise<{ profilePictureUrl: string }> {
  const filename = localUri.split("/").pop() ?? "profile.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = match?.[1]?.toLowerCase();
  const type =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  const form = new FormData();
  form.append(
    "file",
    {
      uri: localUri,
      name: filename.includes(".") ? filename : "profile.jpg",
      type,
    } as unknown as Blob
  );

  const res = await apiClient.post(`/users/${userId}/profile-picture`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
