import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import verifyToken from "../middleware/verifyToken";
import { stripe } from "../config/stripe";
import { ParsedQs } from "qs";

const router = express.Router();

/* ---------------- SEARCH HOTELS ---------------- */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    const pageSize = 5;
    const pageNumber = parseInt((req.query.page as string) || "1", 10);
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query).skip(skip).limit(pageSize);
    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* ---------------- GET HOTEL ---------------- */
router.get(
  "/:id",
  [param("id").notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const hotel = await Hotel.findById(req.params.id);
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

/* ---------------- PAYMENT INTENT ---------------- */
router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const hotelId = Array.isArray(req.params.hotelId)
        ? req.params.hotelId[0]
        : req.params.hotelId;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) return res.status(400).json({ message: "Hotel not found" });

      const numberOfNights = Number(req.body.numberOfNights);
      const totalCost = hotel.pricePerNight * numberOfNights;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCost * 100,
        currency: "gbp",
        metadata: {
          hotelId: hotelId,
          userId: req.userId!,
        },
      });

      res.json({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        totalCost,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Payment Intent failed" });
    }
  }
);

/* ---------------- CREATE BOOKING ---------------- */
router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        req.body.paymentIntentId
      );

      if (
        paymentIntent.status !== "succeeded" ||
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        return res.status(400).json({ message: "Payment validation failed" });
      }

      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId!,
      };

      const hotel = await Hotel.findById(req.params.hotelId);
      if (!hotel) return res.status(400).json({ message: "Hotel not found" });

      hotel.bookings.push(newBooking);
      await hotel.save();

      res.status(200).json({ message: "Booking created" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Booking failed" });
    }
  }
);

const constructSearchQuery = (queryParams: any) => {
  const q: any = {};

  if (queryParams.destination) {
    q.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  return q;
};

export default router;