import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import * as apiClient from "../api/MyBookingsApi";

type Booking = {
  _id: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount: number;
};

type Hotel = {
  _id: string;
  name: string;
  city: string;
  country: string;
  imageUrls: string[];
  bookings: Booking[];
};

const MyBookings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all bookings
  const { data: hotels, isLoading } = useQuery<Hotel[]>(
    "fetchMyBookings",
    apiClient.fetchMyBookings,
    {
      retry: false,
      onError: (err: any) => {
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/login");
        }
      },
    }
  );

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (!hotels || hotels.length === 0)
    return <div className="text-center mt-10">No bookings found</div>;

  // -----------------------------
  // Optimistic delete
  // -----------------------------
  const handleDelete = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setDeletingId(bookingId);
    const previousData = queryClient.getQueryData<Hotel[]>("fetchMyBookings");

    // Optimistic UI update
    queryClient.setQueryData<Hotel[]>("fetchMyBookings", (old) =>
      old?.map((hotel) => ({
        ...hotel,
        bookings: hotel.bookings.filter((b) => b._id !== bookingId),
      })) || []
    );

    try {
      await apiClient.deleteBooking(bookingId);
      alert("Booking cancelled successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking, rolling back");
      queryClient.setQueryData("fetchMyBookings", previousData);
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------
  // Navigate to edit booking
  // -----------------------------
  const handleEdit = (bookingId: string) => {
    navigate(`/edit-booking/${bookingId}`);
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">My Bookings</h1>

      {hotels.map((hotel) => (
        <div
          key={hotel._id}
          className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] border border-slate-300 rounded-lg gap-5 p-5"
        >
          {/* Hotel image */}
          <div className="lg:h-[250px] w-full">
            <img
              src={hotel.imageUrls[0] || "/fallback-hotel.jpg"}
              alt={hotel.name}
              className="w-full h-full object-cover object-center rounded-lg"
            />
          </div>

          {/* Bookings list */}
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-bold">
              {hotel.name}
              <div className="text-xs font-normal">
                {hotel.city}, {hotel.country}
              </div>
            </div>

            {hotel.bookings.length === 0 && (
              <div className="text-sm text-gray-500">No bookings for this hotel</div>
            )}

            {hotel.bookings.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col border border-slate-200 rounded-lg p-4"
              >
                {/* Booking info */}
                <div className="mb-3">
                  <div>
                    <span className="font-semibold mr-2">Dates:</span>
                    {new Date(booking.checkIn).toDateString()} -{" "}
                    {new Date(booking.checkOut).toDateString()}
                  </div>
                  <div>
                    <span className="font-semibold mr-2">Guests:</span>
                    {booking.adultCount} adults, {booking.childCount} children
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(booking._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(booking._id)}
                    disabled={deletingId === booking._id}
                    className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ${
                      deletingId === booking._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;