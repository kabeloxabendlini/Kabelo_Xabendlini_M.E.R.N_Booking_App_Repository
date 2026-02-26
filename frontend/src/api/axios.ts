import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://booking-app-backend-8uwr.onrender.com",
  withCredentials: true,
});