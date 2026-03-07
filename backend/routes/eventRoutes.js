import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";

import {
  getMyEvents,
  getEventById,
  updateEvent,
} from "../controllers/eventController.js";

const router = express.Router();


router.get("/my-events", protect, getMyEvents);


router.post(
  "/",
  protect,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admins only" });
      }

      const {
        title,
        description,
        venue,
        date,
        registrationDeadline,
        price,
      } = req.body;

      if (!title || !description || !venue || !date || !registrationDeadline) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ message: "Upload at least one image" });
      }

      const imageUrls = req.files.map(
        (file) => `${req.protocol}://${req.get("host")}/${file.path}`
      );

      const event = await Event.create({
        title,
        description,
        venue,
        date,
        registrationDeadline,
        price: price || 0,
        images: imageUrls,
        createdBy: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      console.error("CREATE EVENT ERROR:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate("createdBy", "name role");

    res.status(200).json(events);
  } catch (error) {
    console.error("FETCH EVENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});


router.get("/:id", getEventById);


router.put("/:id", protect, updateEvent);

router.get("/:id/registrations", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const registrations = await EventRegistration.find({
      event: req.params.id,
    })
      .populate("user", "name rollNo email")
      .populate("payment", "amount razorpayPaymentId")
      .sort({ createdAt: -1 });

    res.json({
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your event" });
    }

    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;
