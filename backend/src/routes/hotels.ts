import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/verifyToken";
import { ParsedQs } from "qs"; 

const router = express.Router(); // <--- declare first

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: "2023-10-16",
});

// Helper function
function getQueryString(value: string | ParsedQs | (string | ParsedQs)[] | undefined): string {
  if (!value) return "1"; // default
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : "1";
  if (typeof value === "string") return value;
  return "1";
}

/* ---------------- SEARCH HOTELS ---------------- */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions: Record<string, 1 | -1> = {};
    const sortOption = Array.isArray(req.query.sortOption)
      ? req.query.sortOption[0]
      : typeof req.query.sortOption === "string"
      ? req.query.sortOption
      : undefined;

    switch (sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageParam = getQueryString(req.query.page);
    const pageNumber = parseInt(pageParam, 10) || 1;
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query).sort(sortOptions).skip(skip).limit(pageSize);
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

/* ---------------- GET ALL HOTELS ---------------- */
router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

/* ---------------- GET SINGLE HOTEL ---------------- */
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

/* ---------------- PAYMENT INTENT ---------------- */
router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    const numberOfNights =
      typeof req.body.numberOfNights === "string"
        ? parseInt(req.body.numberOfNights, 10)
        : req.body.numberOfNights;

    const hotelId = Array.isArray(req.params.hotelId)
      ? req.params.hotelId[0]
      : req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(400).json({ message: "Hotel not found" });

    const totalCost = hotel.pricePerNight * numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "gbp",
      metadata: { hotelId, userId: req.userId! },
    });

    if (!paymentIntent.client_secret)
      return res.status(500).json({ message: "Error creating payment intent" });

    res.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    });
  }
);

/* ---------------- CREATE BOOKING ---------------- */
router.post("/:hotelId/bookings", verifyToken, async (req: Request, res: Response) => {
  try {
    const paymentIntentId = req.body.paymentIntentId as string;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) return res.status(400).json({ message: "Payment intent not found" });

    const hotelId = Array.isArray(req.params.hotelId) ? req.params.hotelId[0] : req.params.hotelId;

    if (paymentIntent.metadata.hotelId !== hotelId || paymentIntent.metadata.userId !== req.userId)
      return res.status(400).json({ message: "Payment intent mismatch" });

    if (paymentIntent.status !== "succeeded")
      return res.status(400).json({ message: `Payment intent not succeeded. Status: ${paymentIntent.status}` });

    const newBooking: BookingType = { ...req.body, userId: req.userId! };

    const hotel = await Hotel.findOneAndUpdate({ _id: hotelId }, { $push: { bookings: newBooking } });

    if (!hotel) return res.status(400).json({ message: "Hotel not found" });

    await hotel.save();
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* ---------------- CONSTRUCT SEARCH QUERY ---------------- */
const constructSearchQuery = (queryParams: any) => {
  const q: any = {};

  const getSingle = (value: any): string | undefined =>
    Array.isArray(value) ? value[0] : typeof value === "string" ? value : undefined;

  if (queryParams.destination) {
    const dest = getSingle(queryParams.destination);
    if (dest)
      q.$or = [{ city: new RegExp(dest, "i") }, { country: new RegExp(dest, "i") }];
  }

  if (queryParams.adultCount) q.adultCount = { $gte: parseInt(getSingle(queryParams.adultCount) || "0", 10) };
  if (queryParams.childCount) q.childCount = { $gte: parseInt(getSingle(queryParams.childCount) || "0", 10) };
  if (queryParams.facilities)
    q.facilities = { $all: Array.isArray(queryParams.facilities) ? queryParams.facilities : [queryParams.facilities] };
  if (queryParams.types)
    q.type = { $in: Array.isArray(queryParams.types) ? queryParams.types : [queryParams.types] };
  if (queryParams.stars) {
    const stars = Array.isArray(queryParams.stars) ? queryParams.stars.map((s: string) => parseInt(s, 10)) : [parseInt(queryParams.stars, 10)];
    q.starRating = { $in: stars };
  }
  if (queryParams.maxPrice) {
    const maxPrice = getSingle(queryParams.maxPrice);
    if (maxPrice) q.pricePerNight = { $lte: parseInt(maxPrice, 10) };
  }

  return q;
};

export default router;