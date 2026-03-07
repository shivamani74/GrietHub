import express from "express";
import crypto from "crypto";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

import protect from "../middleware/authMiddleware.js";
import razorpay from "../config/razorpay.js";
import Event from "../models/Event.js";
import Payment from "../models/Payment.js";
import EventRegistration from "../models/EventRegistration.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.post("/create-order/:eventId", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate("createdBy");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const now = new Date();
    const deadline = new Date(event.registrationDeadline);

    if (now > deadline) {
      return res.status(400).json({
        message: "Registrations are closed for this event",
      });
    }

    const alreadyPaid = await EventRegistration.findOne({
      user: userId,
      event: eventId,
      status: { $in: ["paid", "checked_in"] },
    });

    if (alreadyPaid) {
      return res.status(400).json({
        message: "You have already registered and paid for this event",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(event.price * 100),
      currency: "INR",
      receipt: `r_${Math.floor(Date.now() / 1000)}`,
    });

    const payment = await Payment.create({
      user: userId,
      event: eventId,
      admin: event.createdBy._id,
      amount: event.price,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: event.price,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      message: "Failed to create payment order",
    });
  }
});

router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !paymentId
    ) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const payment = await Payment.findById(paymentId)
      .populate("user")
      .populate("event");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      return res.status(400).json({ message: "Payment already verified" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    let registration = await EventRegistration.findOne({
      user: payment.user._id,
      event: payment.event._id,
    });

    if (!registration) {
      registration = await EventRegistration.create({
        user: payment.user._id,
        event: payment.event._id,
        payment: payment._id,
        status: "paid",
      });
    }

    const qrToken = jwt.sign(
      { registrationId: registration._id.toString() },
      process.env.QR_SECRET_KEY,
      { expiresIn: "2d" }
    );

    registration.qrToken = qrToken;
    await registration.save();

    const qrBuffer = await QRCode.toBuffer(qrToken, {
      width: 800,
      margin: 4,
      errorCorrectionLevel: "H",
    });

    await sendEmail({
      to: payment.user.email,
      subject: "🎟 Event Ticket QR",
      html: `
        <h2>Payment Successful ✅</h2>
        <p>Hello ${payment.user.name},</p>
        <p>Your QR ticket is below. Please show it at entry.</p>
        <p><b>Do not share. One-time entry only.</b></p>
        <img src="cid:eventqr" style="width:250px;height:250px;" />
      `,
      attachments: [
        {
          filename: "event-ticket.png",
          content: qrBuffer,
          contentType: "image/png",
          cid: "eventqr"
        },
      ],
    });

    return res.json({
      success: true,
      message: "Payment verified & QR generated",
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ message: "Verification failed" });
  }
});

export default router;