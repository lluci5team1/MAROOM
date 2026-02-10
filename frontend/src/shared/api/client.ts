import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://YOUR_LOCAL_IP:3000/api", // or ENV
  timeout: 10000,
});
