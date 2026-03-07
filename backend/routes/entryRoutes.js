import express from "express";
import jwt from "jsonwebtoken";
import protect from "../middleware/authMiddleware.js";
import EventRegistration from "../models/EventRegistration.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.post("/scan", protect, async (req, res) => {
  try {
 
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { qrToken } = req.body;
    if (!qrToken) {
      return res.status(400).json({ message: "QR token missing" });
    }

  
    let decoded;
    try {
      decoded = jwt.verify(qrToken, process.env.QR_SECRET_KEY);
    } catch {
      return res.status(400).json({ message: "Invalid or expired QR" });
    }

    const registration = await EventRegistration.findById(
      decoded.registrationId
    )
      .populate("user", "name phone email")
      .populate("event", "title");

    if (!registration) {
      return res.status(404).json({ message: "Invalid ticket" });
    }

    if (registration.status === "checked_in") {
      return res.status(400).json({ message: "Ticket already used" });
    }

    if (registration.status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    registration.status = "checked_in";
    registration.checkedInAt = new Date();
    await registration.save();
   await sendEmail({
  to: registration.user.email,
  subject: "🎉 Entry Confirmed",
  html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6fb; padding:30px;">
    
    <div style="max-width:550px; margin:auto; background:white; border-radius:10px; 
    overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

      <div style="background:#16a34a; color:white; padding:20px; text-align:center;">
        <h2 style="margin:0;">✅ Entry Confirmed</h2>
      </div>

      <div style="padding:25px;">
        <p style="font-size:16px;">Hello <b>${registration.user.name}</b>,</p>

        <p style="font-size:15px; line-height:1.6;">
          Your ticket has been successfully scanned and your entry has been confirmed.
        </p>

        <div style="background:#f1f5f9; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:5px 0;"><b>Event:</b> ${registration.event.title}</p>
          <p style="margin:5px 0;"><b>Status:</b> Checked In</p>
          <p style="margin:5px 0;"><b>Entry Time:</b> ${new Date().toLocaleString()}</p>
        </div>

        <p style="font-size:15px;">
          We hope you enjoy the event. Thank you for being a part of it!
        </p>

        <p style="margin-top:25px; font-size:14px;">
          Best regards,<br/>
          <b>Event Management Team</b>
        </p>
      </div>

      <div style="background:#f1f5f9; text-align:center; padding:12px; font-size:12px; color:#555;">
        This is an automated email. Please do not reply.
      </div>

    </div>

  </div>
  `,
});

    res.json({
      success: true,
      student: {
        name: registration.user.name,
        phone: registration.user.phone,
      },
      event: registration.event.title,
    });
  } catch (err) {
    console.error("SCAN ERROR:", err);
    res.status(500).json({ message: "Scan failed" });
  }
});

export default router;
