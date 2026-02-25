import axios from "axios";

// Types
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

// Base URL for backend
const API_BASE_URL = "http://localhost:7000"; // <- Make sure this matches your backend

// ----------------------
// API functions
// ----------------------
export const fetchMyBookings = async (): Promise<Hotel[]> => {
  const response = await axios.get<Hotel[]>(`${API_BASE_URL}/api/my-bookings`, {
    withCredentials: true,
  });

  return response.data;
};

export const deleteBooking = async (bookingId: string) => {
  await axios.delete(`${API_BASE_URL}/api/my-bookings/${bookingId}`, {
    withCredentials: true,
  });
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
  await axios.put(`${API_BASE_URL}/api/my-bookings/${bookingId}`, data, {
    withCredentials: true,
  });
};