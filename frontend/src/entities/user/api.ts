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
