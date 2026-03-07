import express from "express";
import protect from "../middleware/authMiddleware.js";
import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import Payment from "../models/Payment.js";

const router = express.Router();


router.get("/dashboard", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const events = await Event.find().sort({ date: 1 });

    const dashboard = await Promise.all(
      events.map(async (event) => {
        const totalRegistrations = await EventRegistration.countDocuments({
          event: event._id,
        });

        const paidUsers = await EventRegistration.countDocuments({
          event: event._id,
          status: "paid",
        });

        const checkedIn = await EventRegistration.countDocuments({
          event: event._id,
          status: "checked_in",
        });

        const revenueAgg = await Payment.aggregate([
          { $match: { event: event._id, status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const revenue = revenueAgg[0]?.total || 0;

        return {
          eventId: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          registrations: totalRegistrations,
          paidUsers,
          checkedIn,
          revenue,
        };
      })
    );

    res.json(dashboard);
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});


router.get("/event/:eventId/registrations", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const registrations = await EventRegistration.find({
      event: req.params.eventId,
    })
      .populate("user", "name email phone rollNo")
      .populate("payment", "amount razorpayPaymentId")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Failed to load registrations" });
  }
});

export default router;
