// shared/api/client.ts
import axios from "axios";
import { getToken } from "./token";

export const apiClient = axios.create({
  baseURL: "http://172.20.10.3:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("[API REQUEST]", config.method?.toUpperCase(), (config.baseURL ?? "") + (config.url ?? ""), JSON.stringify(config.data));
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("[API RESPONSE]", response.status, JSON.stringify(response.data));
    return response;
  },
  (error) => {
    console.log("[API ERROR]", error?.response?.status, JSON.stringify(error?.response?.data), error?.message);
    return Promise.reject(error);
  }
);
