import 'dotenv/config'; // Load .env variables
import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Routes
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";
import bookingRoutes from "./routes/my-bookings";

// -----------------------------
// Check JWT Secret
// -----------------------------
if (!process.env.JWT_SECRET_KEY) {
  console.error("Error: JWT_SECRET_KEY is not defined in .env!");
  process.exit(1);
}

// -----------------------------
// Cloudinary Configuration
// -----------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -----------------------------
// MongoDB Connection
// -----------------------------
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env!");
  process.exit(1);
}

console.log("Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// -----------------------------
// Express App Setup
// -----------------------------
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Serve frontend build
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", bookingRoutes);

// Frontend catch-all route
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

// -----------------------------
// Start Server
// -----------------------------
const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
