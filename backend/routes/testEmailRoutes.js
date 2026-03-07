import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "shivvvm036@gmail.com", 
      subject: "Test Email",
      text: "If you received this, Nodemailer is working 🎉",
    });

    res.json({ success: true, message: "Test email sent" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
