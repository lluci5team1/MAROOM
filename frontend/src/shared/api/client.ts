// shared/api/client.ts
import axios from "axios";
import { getToken } from "./token";

const RAILWAY_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://maroom-production.up.railway.app";
const LOCAL_URL = "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: RAILWAY_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(
    "[API REQUEST]",
    config.method?.toUpperCase(),
    (config.baseURL ?? "") + (config.url ?? ""),
    JSON.stringify(config.data),
  );
  return config;
});

function safeLogPayload(data: unknown): string {
  try {
    const raw = JSON.stringify(data, (_key, value) => {
      if (typeof value === "string" && value.length > 500) {
        return `${value.slice(0, 120)}…[truncated ${value.length} chars]`;
      }
      return value;
    });
    return raw.length > 4000 ? `${raw.slice(0, 4000)}…[truncated]` : raw;
  } catch {
    return "[unserializable]";
  }
}

apiClient.interceptors.response.use(
  (response) => {
    console.log("[API RESPONSE]", response.status, safeLogPayload(response.data));
    return response;
  },
  async (error) => {
    const config = error.config as any;
    // If Railway is unreachable (no response = network error) and we haven't tried local yet
    if (!error.response && !config._localFallback) {
      config._localFallback = true;
      config.baseURL = LOCAL_URL;
      console.log("[API FALLBACK] Railway unreachable — retrying on localhost:8080");
      return apiClient(config);
    }
    console.log(
      "[API ERROR]",
      error?.response?.status,
      JSON.stringify(error?.response?.data),
      error?.message,
    );
    return Promise.reject(error);
  },
);
