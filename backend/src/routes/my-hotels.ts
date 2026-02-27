import express, { Request, Response } from "express";
import multer, { File as MulterFile } from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/verifyToken";
import { body, validationResult } from "express-validator";
import { HotelType } from "../shared/types";

const router = express.Router();

/* ---------------- MULTER CONFIG ---------------- */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ---------------- CREATE HOTEL ---------------- */
router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel type is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night must be a number"),
    body("facilities").isArray().withMessage("Facilities must be an array"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);
      console.log("VALIDATION ERRORS:", errors.array());
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const imageFiles = req.files as MulterFile[];
      const newHotel: HotelType = req.body;

      const imageUrls = await uploadImages(imageFiles);
      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId!;

      const hotel = new Hotel(newHotel);
      await hotel.save();

      res.status(201).json(hotel);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

/* ---------------- GET ALL HOTELS ---------------- */
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

/* ---------------- GET SINGLE HOTEL ---------------- */
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotel" });
  }
});

/* ---------------- UPDATE HOTEL ---------------- */
router.put(
  "/:hotelId",
  verifyToken,
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      const updatedHotel: HotelType = req.body;

      const hotel = await Hotel.findOne({
        _id: req.params.hotelId,
        userId: req.userId,
      });
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });

      // Update fields
      hotel.name = updatedHotel.name;
      hotel.city = updatedHotel.city;
      hotel.country = updatedHotel.country;
      hotel.description = updatedHotel.description;
      hotel.type = updatedHotel.type;
      hotel.pricePerNight = updatedHotel.pricePerNight;
      hotel.facilities = updatedHotel.facilities;
      hotel.adultCount = updatedHotel.adultCount;
      hotel.childCount = updatedHotel.childCount;
      hotel.starRating = updatedHotel.starRating;
      hotel.lastUpdated = new Date();

      // Handle new images
      const files = req.files as MulterFile[];
      if (files && files.length > 0) {
        const newImageUrls = await uploadImages(files);
        hotel.imageUrls = [...hotel.imageUrls, ...newImageUrls];
      }

      await hotel.save();
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Error updating hotel" });
    }
  }
);

/* ---------------- DELETE HOTEL ---------------- */
router.delete("/:hotelId", verifyToken, async (req: Request, res: Response) => {
  try {
    const deletedHotel = await Hotel.findOneAndDelete({
      _id: req.params.hotelId,
      userId: req.userId,
    });
    if (!deletedHotel)
      return res.status(404).json({ message: "Hotel not found" });

    res.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting hotel" });
  }
});

/* ---------------- CLOUDINARY UPLOAD HELPER ---------------- */
async function uploadImages(imageFiles: MulterFile[]) {
  if (!imageFiles || imageFiles.length === 0) return [];

  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${b64}`;
    const result = await cloudinary.v2.uploader.upload(dataURI);
    return result.secure_url;
  });

  return Promise.all(uploadPromises);
}

export default router;