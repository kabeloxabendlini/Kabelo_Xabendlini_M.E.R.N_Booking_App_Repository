import { apiClient } from "./axios";

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await apiClient.post("/api/auth/login", data);
  return response.data;
};

export const validateToken = async () => {
  const response = await apiClient.get("/api/auth/validate-token");
  return response.data;
};

export const logout = async () => {
  await apiClient.post("/api/auth/logout");
};