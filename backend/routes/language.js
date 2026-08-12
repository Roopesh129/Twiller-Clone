import express from "express";
import nodemailer from "nodemailer";
import User from "../models/user.js";

const router = express.Router();

// In-memory OTP store for email verification with expiration
const otpStore = new Map();

// ==========================================
// 1. DISPATCH EMAIL OTP (For French)
// ==========================================
router.post("/send-otp", async (req, res) => {
  try {
    const { userId, targetLanguage, type, destination } = req.body;

    if (!destination) {
      return res.status(400).json({
        message: "No registered email address found for your account.",
      });
    }

    // Generate 6-digit numeric OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const storeKey = `${userId || "guest"}_${targetLanguage}`;

    // Store OTP in memory with a 5-minute expiration
    otpStore.set(storeKey, {
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    if (type === "email") {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({
          message: "Gmail credentials (EMAIL_USER / EMAIL_PASS) missing in .env file.",
        });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Security Team" <${process.env.EMAIL_USER}>`,
        to: destination,
        subject: "Security Verification Code - Language Switch",
        text: `Your security code to change your account language to French is: ${generatedOtp}. This code will expire in 5 minutes.`,
      });

      return res.json({
        success: true,
        message: "Email verification code dispatched successfully.",
      });
    }

    return res.status(400).json({ message: "Unsupported verification type." });
  } catch (error) {
    console.error("Email OTP Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to dispatch email verification code.",
    });
  }
});

// ==========================================
// 2. VERIFY EMAIL OTP & UPDATE MONGODB (French)
// ==========================================
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, targetLanguage, otp } = req.body;
    const storeKey = `${userId || "guest"}_${targetLanguage}`;

    const record = otpStore.get(storeKey);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "No active verification session found or code expired.",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(storeKey);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    if (record.otp === otp?.toString().trim()) {
      otpStore.delete(storeKey);

      // Save preference in MongoDB
      if (userId) {
        await User.findByIdAndUpdate(userId, { language: targetLanguage });
      }

      return res.json({
        success: true,
        message: "Email verified. Language preference saved to database.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid verification code. Please check and try again.",
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ message: "Server error during verification." });
  }
});

// ==========================================
// 3. UPDATE PREFERENCE (Post-Firebase SMS Auth)
// ==========================================
router.post("/update-preference", async (req, res) => {
  try {
    const { userId, targetLanguage } = req.body;

    if (!userId || !targetLanguage) {
      return res.status(400).json({ message: "userId and targetLanguage are required." });
    }

    await User.findByIdAndUpdate(userId, { language: targetLanguage });

    return res.json({
      success: true,
      message: "Language preference updated successfully in MongoDB.",
    });
  } catch (error) {
    console.error("Database Update Error:", error);
    return res.status(500).json({ message: "Failed to update preference in database." });
  }
});

export default router;