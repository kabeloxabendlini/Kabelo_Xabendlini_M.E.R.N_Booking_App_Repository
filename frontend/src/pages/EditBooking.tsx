import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import * as apiClient from "../api/MyBookingsApi";

const EditBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const hotels = await apiClient.fetchMyBookings();
        let foundBooking;
        for (const hotel of hotels) {
          foundBooking = hotel.bookings.find((b) => b._id === bookingId);
          if (foundBooking) break;
        }

        if (!foundBooking) {
          alert("Booking not found");
          navigate("/my-bookings");
          return;
        }

        setCheckIn(foundBooking.checkIn.slice(0, 10));
        setCheckOut(foundBooking.checkOut.slice(0, 10));
        setAdultCount(foundBooking.adultCount);
        setChildCount(foundBooking.childCount);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch booking");
        navigate("/my-bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    try {
      await apiClient.updateBooking(bookingId, {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adultCount,
        childCount,
      });

      // Optimistically update cache
      queryClient.setQueryData<apiClient.Hotel[]>("fetchMyBookings", (hotels) =>
        hotels?.map((hotel) => ({
          ...hotel,
          bookings: hotel.bookings.map((b) =>
            b._id === bookingId
              ? { ...b, checkIn, checkOut, adultCount, childCount }
              : b
          ),
        })) || []
      );

      alert("Booking updated successfully");
      navigate("/my-bookings");
    } catch (err) {
      console.error(err);
      alert("Failed to update booking");
      queryClient.invalidateQueries("fetchMyBookings");
    }
  };

  if (loading) return <span>Loading...</span>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Booking</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-semibold mb-1">Check-In:</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Check-Out:</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Adults:</label>
          <input
            type="number"
            min={1}
            value={adultCount}
            onChange={(e) => setAdultCount(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Children:</label>
          <input
            type="number"
            min={0}
            value={childCount}
            onChange={(e) => setChildCount(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Update Booking
          </button>
          <button
            type="button"
            onClick={() => navigate("/my-bookings")}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBooking;