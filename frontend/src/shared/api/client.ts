// shared/api/client.ts
import axios from "axios";
import { getToken } from "./token";

export const apiClient = axios.create({
  baseURL: "http://11.27.18.87:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
