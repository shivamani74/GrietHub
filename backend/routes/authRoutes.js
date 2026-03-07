import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import sendEmail from "../utils/sendEmail.js";
import upload from "../middleware/upload.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    let { name, email, rollNo, phone, password } = req.body;

    if (!name || !email || !rollNo || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    email = email.toLowerCase().trim();

    if (!email.endsWith("@grietcollege.com")) {
      return res.status(400).json({
        message: "Only @grietcollege.com email addresses are allowed",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { rollNo }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, otp, expiresAt });

await sendEmail({
  to: email,
  subject: "Your OTP for Registration",
  html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6fb; padding:30px;">
    
    <div style="max-width:500px; margin:auto; background:white; border-radius:10px; 
    overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

      <div style="background:#2563eb; color:white; padding:20px; text-align:center;">
        <h2 style="margin:0;">🔐 OTP Verification</h2>
      </div>

      <div style="padding:25px; text-align:center;">
        <p style="font-size:15px;">
          Use the following One-Time Password to complete your registration:
        </p>

        <div style="font-size:36px; font-weight:bold; letter-spacing:6px; 
        background:#f1f5f9; padding:15px; border-radius:8px; margin:20px 0; color:#111;">
          ${otp}
        </div>

        <p style="font-size:14px; color:#555;">
          This OTP is valid for <b>5 minutes</b>.
        </p>

        <div style="background:#fff3cd; border-left:5px solid #f59e0b; 
        padding:12px; margin-top:20px; border-radius:6px; text-align:left;">
          <p style="margin:0; font-size:13px;">
            ⚠ Do not share this OTP with anyone. Our team will never ask for your OTP.
          </p>
        </div>

        <p style="margin-top:25px; font-size:14px;">
          If you didn’t request this OTP, please ignore this email.
        </p>
      </div>

      <div style="background:#f1f5f9; text-align:center; padding:10px; 
      font-size:12px; color:#555;">
        This is an automated email. Please do not reply.
      </div>

    </div>

  </div>
  `,
});

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/verify-otp", async (req, res) => {
  try {
    let { name, email, rollNo, phone, password, otp } = req.body;

    email = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await User.create({
      name,
      email,
      rollNo,
      phone,
      password,
      role: "student",      
      isVerified: true,
    });

    await Otp.deleteMany({ email });

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    if (!rollNo || !password) {
      return res.status(400).json({
        message: "Roll number and password required",
      });
    }

    const user = await User.findOne({ rollNo });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          user.role === "admin"
            ? "Admin account pending verification"
            : "User not verified",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,    
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

  
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        role: user.role,    
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post(
  "/admin/signup",
  upload.single("proofDocument"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        rollNo,
        phone,
        password,
        clubName,
      } = req.body;

      if (!name || !email || !rollNo || !password || !req.file) {
        return res.status(400).json({
          message:
            "All required fields and verification document must be provided",
        });
      }

      const existing = await User.findOne({
        $or: [{ email }, { rollNo }],
      });

      if (existing) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      await User.create({
        name,
        email,
        rollNo,
        phone,
        password,
        role: "admin",           
        isVerified: false,       
        adminVerification: {
          proofDocument: req.file.path,
          clubName,
          submittedAt: new Date(),
        },
      });

      res.status(201).json({
        success: true,
        message: "Admin signup submitted for verification",
      });
    } catch (err) {
      console.error("ADMIN SIGNUP ERROR:", err);
      res.status(500).json({
        message: "Admin signup failed",
      });
    }
  }
);

export default router;
