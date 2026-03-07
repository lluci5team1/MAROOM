// shared/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://11.27.18.87:8080",
  headers: {
    "Content-Type": "application/json",
  },
});
