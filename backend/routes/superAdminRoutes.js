import express from "express";
import protect from "../middleware/authMiddleware.js";
import superAdminOnly from "../middleware/superAdminOnly.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();


router.get(
  "/dashboard",
  protect,
  superAdminOnly,
  async (req, res) => {
    try {
      const pendingAdminCount = await User.countDocuments({
        role: "admin",
        "adminVerification.status": "pending",
      });

      const events = await Event.find()
        .populate("createdBy", "name email adminVerification.clubName")
        .sort({ date: 1 });

      const dashboardEvents = await Promise.all(
        events.map(async (event) => {
          const registrations = await EventRegistration.find({
            event: event._id,
          }).populate("payment", "amount");

          const revenue = registrations.reduce(
            (sum, r) => sum + (r.payment?.amount || 0),
            0
          );

          return {
            _id: event._id,
            title: event.title,
            date: event.date,
            clubName:
              event.createdBy?.adminVerification?.clubName || "—",
            createdBy: {
              name: event.createdBy?.name,
              email: event.createdBy?.email,
            },
            registrationCount: registrations.length,
            revenue,
          };
        })
      );

      res.json({
        pendingAdminCount,
        events: dashboardEvents,
      });
    } catch (error) {
      console.error("SUPERADMIN DASHBOARD ERROR:", error);
      res.status(500).json({
        message: "Failed to load dashboard",
      });
    }
  }
);


router.get(
  "/pending-admins",
  protect,
  superAdminOnly,
  async (req, res) => {
    try {
      const admins = await User.find({
        role: "admin",
        "adminVerification.status": "pending",
      }).select(
        "name email phone adminVerification createdAt"
      );

      res.json(admins);
    } catch {
      res.status(500).json({
        message: "Failed to fetch admin requests",
      });
    }
  }
);

router.post(
  "/approve-admin/:id",
  protect,
  superAdminOnly,
  async (req, res) => {
    try {
      const admin = await User.findById(req.params.id);

      if (!admin || admin.role !== "admin") {
        return res.status(404).json({ message: "Admin not found" });
      }

      admin.adminVerification.status = "approved";
      admin.adminVerification.verifiedAt = new Date();
      admin.adminVerification.verifiedBy = req.user._id;
      admin.isVerified = true;

      await admin.save();

      await sendEmail({
        to: admin.email,
        subject: "🎉 Admin Account Approved - GRIEThub",
        html: `
          <h2>Hello ${admin.name},</h2>
          <p>Your admin account has been <b>approved</b>.</p>
          <p><b>Club:</b> ${admin.adminVerification.clubName}</p>
          <p>You can now log in and manage events.</p>
          <br/>
          <p>Regards,<br/>GRIEThub SuperAdmin</p>
        `,
      });

      res.json({ message: "Admin approved successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to approve admin" });
    }
  }
);


router.post(
  "/reject-admin/:id",
  protect,
  superAdminOnly,
  async (req, res) => {
    try {
      const admin = await User.findById(req.params.id);

      if (!admin || admin.role !== "admin") {
        return res.status(404).json({ message: "Admin not found" });
      }

      admin.adminVerification.status = "rejected";
      admin.adminVerification.rejectionReason =
        req.body.reason || "Verification failed";
      admin.adminVerification.verifiedAt = null;
      admin.adminVerification.verifiedBy = null;
      admin.isVerified = false;

      await admin.save();

      await sendEmail({
        to: admin.email,
        subject: "❌ Admin Request Rejected - GRIEThub",
        html: `
          <h2>Hello ${admin.name},</h2>
          <p>Your admin request has been <b>rejected</b>.</p>
          <p><b>Reason:</b> ${
            admin.adminVerification.rejectionReason
          }</p>
          <p>You may update your documents and reapply.</p>
          <br/>
          <p>Regards,<br/>GRIEThub SuperAdmin</p>
        `,
      });

      res.json({ message: "Admin request rejected" });
    } catch {
      res.status(500).json({ message: "Failed to reject admin" });
    }
  }
);


router.get(
  "/events/:eventId/registrations",
  protect,
  superAdminOnly,
  async (req, res) => {
    try {
      const registrations = await EventRegistration.find({
        event: req.params.eventId,
      })
        .populate("user", "name rollNo email phone")
        .populate("payment", "amount");

      res.json(registrations);
    } catch {
      res.status(500).json({
        message: "Failed to load registrations",
      });
    }
  }
);

router.get(
  "/admins",
  protect,
  superAdminOnly,
  async (req, res) => {
    try {
      const admins = await User.find({
        role: "admin",
        isVerified: true,
      }).select(
        "name email phone adminVerification.clubName createdAt"
      );

      res.json(admins);
    } catch {
      res.status(500).json({
        message: "Failed to fetch admins",
      });
    }
  }
);

router.post(
  "/revoke-admin/:id",
  protect,
  superAdminOnly,
  async (req, res) => {
    try {
      const admin = await User.findById(req.params.id);

      if (!admin || admin.role !== "admin") {
        return res.status(404).json({
          message: "Admin not found",
        });
      }

      admin.role = "student";
      admin.isVerified = false;
      admin.adminVerification.status = "revoked";
      admin.adminVerification.verifiedAt = null;
      admin.adminVerification.verifiedBy = null;

      await admin.save();

      res.json({
        message: "Admin role revoked successfully",
      });
    } catch {
      res.status(500).json({
        message: "Failed to revoke admin",
      });
    }
  }
);

export default router;
