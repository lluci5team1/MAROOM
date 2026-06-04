// features/auth/api.ts
import { apiClient, API_BASE_URL } from "../../shared/api/client";
import { getToken } from "../../shared/api/token";

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
  localUri: string,
  mimeType?: string | null,
  fileName?: string | null
): Promise<{ profilePictureUrl: string }> {
  const type = mimeType?.toLowerCase() || "image/jpeg";
  const name = fileName || "profile.jpg";

  const form = new FormData();
  form.append(
    "file",
    {
      uri: localUri,
      name,
      type,
    } as unknown as Blob
  );

  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // fetch handles React Native multipart uploads reliably; axios often sends an empty file body.
  let response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!response.ok && response.status >= 500) {
    response = await fetch(`${LOCAL_URL}/users/${userId}/profile-picture`, {
      method: "POST",
      headers,
      body: form,
    });
  }

  const body = await response.text();
  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const parsed = JSON.parse(body) as { error?: string; message?: string };
      message = parsed.error ?? parsed.message ?? message;
    } catch {
      if (body) message = body;
    }
    throw new Error(message);
  }

  return JSON.parse(body) as { profilePictureUrl: string };
}
