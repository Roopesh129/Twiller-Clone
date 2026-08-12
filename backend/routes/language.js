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
      const proxyRes = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            proxySecret: "TwillerProxySecureKey2026!",
            to: destination,
            subject: 'Security Verification Code - Language Switch',
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eff3f4; border-radius: 16px; background-color: #ffffff; color: #0f1419;">
                    <h2 style="color: #1d9bf0; font-size: 22px; font-weight: 800; margin-bottom: 8px; text-align: center;">Twiller Language Switch</h2>
                    <hr style="border: 0; border-top: 1px solid #eff3f4; margin: 16px 0;"/>
                    <p style="font-size: 15px; line-height: 22px;">Your security code to change your account language to French is:</p>
                    <div style="background-color: #f7f9fa; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; border: 1px dashed #1d9bf0;">
                        <span style="font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #0f1419;">${generatedOtp}</span>
                    </div>
                    <p style="font-size: 13px; color: #536471;">This code will expire in 5 minutes.</p>
                </div>
            `
        })
      });

      if (!proxyRes.ok) {
        throw new Error(`Failed to send email via proxy. Did you set EMAIL credentials?`);
      }

      return res.json({
        success: true,
        message: "Email verification code dispatched successfully.",
      });
    }

    if (type === "sms") {
      if (!process.env.FAST2SMS_API_KEY) {
        return res.status(500).json({ message: "FAST2SMS_API_KEY missing in .env file." });
      }

      const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
            'authorization': process.env.FAST2SMS_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            route: "q",
            message: `Your Twiller security code to change language to ${targetLanguage} is: ${generatedOtp}`,
            language: "english",
            flash: 0,
            numbers: destination.replace(/\D/g, '') // strip non-digits
        })
      });

      const smsData = await smsRes.json();
      if (!smsRes.ok || smsData.return === false) {
        throw new Error(`Fast2SMS Error: ${smsData.message || 'Request rejected'}`);
      }

      return res.json({
        success: true,
        message: "SMS verification code dispatched successfully.",
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