// src/api/apiClient.ts
import axios from "axios";

// Use your Render deployed backend URL here
const API_BASE_URL = "https://kabelo-xabendlini-m-e-r-n-booking-app.onrender.com";

// Create an Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // important!
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------
// Auth API
// ----------------------
export const login = async (email: string, password: string) => {
  return apiClient.post("/api/auth/login", { email, password });
};

export const validateToken = async () => {
  return apiClient.get("/api/auth/validate-token");
};

// ----------------------
// Bookings API
// ----------------------
export type Booking = {
  _id: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount: number;
};

export type Hotel = {
  _id: string;
  name: string;
  city: string;
  country: string;
  imageUrls: string[];
  bookings: Booking[];
};

export const fetchMyBookings = async (): Promise<Hotel[]> => {
  const response = await apiClient.get<Hotel[]>("/api/my-bookings");
  return response.data;
};

export const deleteBooking = async (bookingId: string) => {
  await apiClient.delete(`/api/my-bookings/${bookingId}`);
};

export const updateBooking = async (
  bookingId: string,
  data: {
    checkIn: string; // use ISO strings for dates
    checkOut: string;
    adultCount: number;
    childCount: number;
  }
) => {
  await apiClient.put(`/api/my-bookings/${bookingId}`, data);
};