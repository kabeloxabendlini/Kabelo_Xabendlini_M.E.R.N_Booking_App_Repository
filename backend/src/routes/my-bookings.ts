import express, { Request, Response } from "express";
import verifyToken from "../middleware/verifyToken";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";

const router = express.Router();

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hotels = await Hotel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    const results = hotels.map((hotel) => {
      const safeBookings = hotel.bookings || [];

      const userBookings = safeBookings.filter(
        (booking) => booking.userId === req.userId
      );

      return {
        ...hotel.toObject(),
        bookings: userBookings,
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

// DELETE /api/my-bookings/:bookingId
router.delete(
  "/:bookingId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;

      const hotel = await Hotel.findOne({
        bookings: { $elemMatch: { _id: bookingId, userId: req.userId } },
      });

      // ✅ Fix: Handle null properly
      if (!hotel) {
        return res.status(404).json({ message: "Booking not found" });
      }

      hotel.bookings = (hotel.bookings || []).filter(
        (booking) => booking._id.toString() !== bookingId
      );

      await hotel.save();

      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to delete booking" });
    }
  }
);

// PUT /api/my-bookings/:bookingId
router.put(
  "/:bookingId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;
      const { checkIn, checkOut, adultCount, childCount } = req.body;

      const hotel = await Hotel.findOne({
        bookings: { $elemMatch: { _id: bookingId, userId: req.userId } },
      });

      // ✅ Fix: null check FIRST
      if (!hotel) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const booking = hotel.bookings?.find(
        (b) => b._id.toString() === bookingId
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      booking.checkIn = checkIn;
      booking.checkOut = checkOut;
      booking.adultCount = Number(adultCount);
      booking.childCount = Number(childCount);

      await hotel.save();

      res.status(200).json({ message: "Booking updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update booking" });
    }
  }
);

export default router;
