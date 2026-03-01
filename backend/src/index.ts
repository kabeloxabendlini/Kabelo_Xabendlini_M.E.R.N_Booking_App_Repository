// -------------------------------------
// Load Environment Variables
// -------------------------------------
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("NODE_ENV:", process.env.NODE_ENV);

// -------------------------------------
// Imports
// -------------------------------------
import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import pathModule from "path";

// Routes
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";
import myBookingsRoutes from "./routes/my-bookings";

// -------------------------------------
// Validate Required Environment Variables
// -------------------------------------
const requiredEnvVars = [
  "JWT_SECRET_KEY",
  "MONGO_URI_PROD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "STRIPE_SECRET_KEY",
  "FRONTEND_URL",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const MONGO_URI = process.env.MONGO_URI_PROD as string;

// -------------------------------------
// Configure Cloudinary
// -------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------------------------
// Connect to MongoDB
// -------------------------------------
console.log("🔄 Connecting to MongoDB...");
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// -------------------------------------
// Initialize Express
// -------------------------------------
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// -------------------------------------
// API Routes
// -------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", myBookingsRoutes);

// -------------------------------------
// Serve Frontend in Production
// -------------------------------------
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(pathModule.join(__dirname, "../../frontend/dist"))
  );

  app.get("*", (req: Request, res: Response) => {

    // 🛑 Prevent API routes from being caught by React
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }

    res.sendFile(
      pathModule.join(__dirname, "../../frontend/dist/index.html")
    );
  });
}

// -------------------------------------
// Start Server
// -------------------------------------
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});