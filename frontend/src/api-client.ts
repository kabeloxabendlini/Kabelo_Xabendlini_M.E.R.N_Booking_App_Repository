import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  HotelSearchResponse,
  HotelType,
  PaymentIntentResponse,
  UserType,
} from "../../backend/src/shared/types";
import { BookingFormData } from "./forms/BookingForm/BookingForm";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error fetching user");
  }
  return response.json();
};

export const register = async (formData: RegisterFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.message);
  }
};

export const signIn = async (formData: SignInFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message);
  }
  return body;
};

export const validateToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Token invalid");
  }

  return response.json();
};

export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    credentials: "include",
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Error during sign out");
  }
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    method: "POST",
    credentials: "include",
    body: hotelFormData,
  });

  if (!response.ok) {
    throw new Error("Failed to add hotel");
  }

  return response.json();
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/my-hotels/${hotelFormData.get("hotelId")}`,
    {
      method: "PUT",
      body: hotelFormData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update Hotel");
  }

  return response.json();
};

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append("destination", searchParams.destination || "");
  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");

  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) =>
    queryParams.append("facilities", facility)
  );

  searchParams.types?.forEach((type) => queryParams.append("types", type));
  searchParams.stars?.forEach((star) => queryParams.append("stars", star));

  const response = await fetch(
    `${API_BASE_URL}/api/hotels/search?${queryParams}`
  );

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels`);
  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }
  return response.json();
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`);
  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const createPaymentIntent = async (
  hotelId: string,
  numberOfNights: string
): Promise<PaymentIntentResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelId}/bookings/payment-intent`,
    {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ numberOfNights }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching payment intent");
  }

  return response.json();
};

export const createRoomBooking = async (formData: BookingFormData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${formData.hotelId}/bookings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    }
  );

  if (!response.ok) {
    throw new Error("Error booking room");
  }
};

export const fetchMyBookings = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-bookings`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch bookings");
  }

  return response.json();
};

export const cancelBooking = async (bookingId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/my-bookings/${bookingId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to cancel booking");
  }
};

// src/api-client.ts
// import { RegisterFormData } from "./pages/Register";
// import { SignInFormData } from "./pages/SignIn";
// import {
//   HotelSearchResponse,
//   HotelType,
//   PaymentIntentResponse,
//   UserType,
// } from "../../backend/src/shared/types";
// import { BookingFormData } from "./forms/BookingForm/BookingForm";

// // --- Make sure this matches your .env ---
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// if (!API_BASE_URL) {
//   throw new Error("VITE_API_BASE_URL is not defined in your .env file");
// }

// // -------------------------------
// // User & Auth
// // -------------------------------
// export const fetchCurrentUser = async (): Promise<UserType> => {
//   const res = await fetch(`${API_BASE_URL}/users/me`, { credentials: "include" });
//   if (!res.ok) throw new Error(`Error fetching user: ${res.status}`);
//   return res.json();
// };

// export const register = async (formData: RegisterFormData) => {
//   const res = await fetch(`${API_BASE_URL}/users/register`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(formData),
//   });

//   const body = await res.json().catch(() => ({}));

//   if (!res.ok) throw new Error(body.message || `Register failed: ${res.status}`);
//   return body;
// };

// export const signIn = async (formData: SignInFormData) => {
//   const res = await fetch(`${API_BASE_URL}/auth/login`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(formData),
//   });

//   const body = await res.json().catch(() => ({}));

//   if (!res.ok) throw new Error(body.message || `Login failed: ${res.status}`);
//   return body;
// };

// export const signOut = async () => {
//   const res = await fetch(`${API_BASE_URL}/auth/logout`, {
//     method: "POST",
//     credentials: "include",
//   });

//   if (!res.ok) throw new Error(`Sign out failed: ${res.status}`);
// };

// // -------------------------------
// // Hotels
// // -------------------------------
// export const fetchHotels = async (): Promise<HotelType[]> => {
//   const res = await fetch(`${API_BASE_URL}/hotels`);
//   if (!res.ok) throw new Error(`Error fetching hotels: ${res.status}`);
//   return res.json();
// };

// export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
//   const res = await fetch(`${API_BASE_URL}/hotels/${hotelId}`);
//   if (!res.ok) throw new Error(`Error fetching hotel: ${res.status}`);
//   return res.json();
// };

// export type SearchParams = {
//   destination?: string;
//   checkIn?: string;
//   checkOut?: string;
//   adultCount?: string;
//   childCount?: string;
//   page?: string;
//   facilities?: string[];
//   types?: string[];
//   stars?: string[];
//   maxPrice?: string;
//   sortOption?: string;
// };

// export const searchHotels = async (params: SearchParams): Promise<HotelSearchResponse> => {
//   const query = new URLSearchParams();
//   Object.entries(params).forEach(([key, value]) => {
//     if (Array.isArray(value)) {
//       value.forEach((v) => query.append(key, v));
//     } else if (value !== undefined) {
//       query.append(key, value);
//     }
//   });

//   const res = await fetch(`${API_BASE_URL}/hotels/search?${query.toString()}`);
//   if (!res.ok) throw new Error(`Error searching hotels: ${res.status}`);
//   return res.json();
// };

// // -------------------------------
// // My Hotels (for owner/admin)
// // -------------------------------
// export const fetchMyHotels = async (): Promise<HotelType[]> => {
//   const res = await fetch(`${API_BASE_URL}/my-hotels`, { credentials: "include" });
//   if (!res.ok) throw new Error(`Error fetching my hotels: ${res.status}`);
//   return res.json();
// };

// export const addMyHotel = async (formData: FormData) => {
//   const res = await fetch(`${API_BASE_URL}/my-hotels`, {
//     method: "POST",
//     body: formData,
//     credentials: "include",
//   });
//   if (!res.ok) throw new Error(`Failed to add hotel: ${res.status}`);
//   return res.json();
// };

// export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
//   const res = await fetch(`${API_BASE_URL}/my-hotels/${hotelId}`, { credentials: "include" });
//   if (!res.ok) throw new Error(`Error fetching hotel: ${res.status}`);
//   return res.json();
// };

// export const updateMyHotelById = async (formData: FormData) => {
//   const hotelId = formData.get("hotelId")?.toString();
//   if (!hotelId) throw new Error("Hotel ID is missing in formData");

//   const res = await fetch(`${API_BASE_URL}/my-hotels/${hotelId}`, {
//     method: "PUT",
//     body: formData,
//     credentials: "include",
//   });

//   if (!res.ok) throw new Error(`Failed to update hotel: ${res.status}`);
//   return res.json();
// };

// // -------------------------------
// // Bookings & Payments
// // -------------------------------
// export const createPaymentIntent = async (
//   hotelId: string,
//   numberOfNights: string
// ): Promise<PaymentIntentResponse> => {
//   const res = await fetch(`${API_BASE_URL}/hotels/${hotelId}/bookings/payment-intent`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ numberOfNights }),
//   });

//   if (!res.ok) throw new Error(`Error creating payment intent: ${res.status}`);
//   return res.json();
// };

// export const createRoomBooking = async (formData: BookingFormData) => {
//   const res = await fetch(`${API_BASE_URL}/hotels/${formData.hotelId}/bookings`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify(formData),
//   });

//   if (!res.ok) throw new Error(`Error booking room: ${res.status}`);
// };

// export const fetchMyBookings = async (): Promise<HotelType[]> => {
//   const res = await fetch(`${API_BASE_URL}/my-bookings`, { credentials: "include" });
//   if (!res.ok) throw new Error(`Error fetching my bookings: ${res.status}`);
//   return res.json();
// };
// export const fetchMyBookingById = async (hotelId: string): Promise<HotelType> => {
//   const res = await fetch(`${API_BASE_URL}/my-bookings/${hotelId}`, { credentials: "include" });
//   if (!res.ok) throw new Error(`Error fetching booking: ${res.status}`);
//   return res.json();
// };  
// // -------------------------------
// // End of File
// // -------------------------------
  