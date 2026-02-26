import { apiClient } from "./axios";

// ----------------------
// Types
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

// ----------------------
// API functions
// ----------------------

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
    checkIn: Date;
    checkOut: Date;
    adultCount: number;
    childCount: number;
  }
) => {
  await apiClient.put(`/api/my-bookings/${bookingId}`, data);
};