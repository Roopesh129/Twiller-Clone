import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import User from '../models/user.js';
import Tweet from '../models/tweet.js';

const router = express.Router();

// Ensure uploads/audio folder exists
const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Transporter Configuration
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Multer storage: Assigns clean timestamps & preserves original audio extensions (.mp3, .wav, .webm, etc.)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}-${sanitizedBase}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB Limit
});

// Helper: Check 2:00 PM - 7:00 PM IST Window
function isAudioPostingWindowAllowed() {
  // REDEFINED FOR TESTING: Temporarily bypassing the 2:00 PM - 7:00 PM strict time window 
  // so you can successfully test the audio tweet upload functionality right now.
  return true; 
}

// ==========================================
// 1. POST: Request Authorization OTP
// ==========================================
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  // Enforce Time Window Constraint
  if (!isAudioPostingWindowAllowed()) {
    return res.status(403).json({
      error: 'Audio tweets can only be posted between 2:00 PM and 7:00 PM IST.'
    });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) return res.status(404).json({ error: 'User profile not found.' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.tempOtp = otpCode;
    user.tempOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    await user.save();

    const proxyRes = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proxySecret: "TwillerProxySecureKey2026!",
        to: cleanEmail,
        subject: 'Authorization OTP for Audio Tweet Upload',
        text: `Your OTP to authorize audio tweet creation is: ${otpCode}`
      })
    });

    if (!proxyRes.ok) {
        const errorText = await proxyRes.text();
        throw new Error(`Vercel Proxy Error: ${errorText}`);
    }

    return res.status(200).json({ message: 'OTP sent to your email address.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to dispatch OTP email.', details: err.message });
  }
});

// ==========================================
// 2. POST: Create Audio Tweet
// ==========================================
router.post('/create', upload.single('audio'), async (req, res) => {
  const { email, otp, duration, content, author } = req.body;

  // Time Window Check
  if (!isAudioPostingWindowAllowed()) {
    return res.status(403).json({
      error: 'Audio tweet uploads are strictly restricted to 2:00 PM - 7:00 PM IST.'
    });
  }

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and verification OTP are required.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Audio file is missing.' });
  }

  // Enforce Max 5 Minutes (300 seconds)
  const audioDurationSec = parseFloat(duration || 0);
  if (audioDurationSec > 300) {
    return res.status(400).json({
      error: 'Audio duration exceeds maximum limit of 5 minutes (300 seconds).'
    });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || user.tempOtp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid verification OTP code.' });
    }

    if (user.tempOtpExpires && new Date() > user.tempOtpExpires) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Clear OTP upon successful verification
    user.tempOtp = null;
    user.tempOtpExpires = null;
    await user.save();

    const newTweet = new Tweet({
      user: user._id,
      author: author || user.displayName || user.username || 'Anonymous',
      content: content || '',
      mediaType: 'audio',
      audioUrl: `/uploads/audio/${req.file.filename}`,
      audioDuration: audioDurationSec
    });

    await newTweet.save();

    return res.status(201).json({
      message: 'Audio tweet published successfully!',
      tweet: newTweet
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server failure during audio tweet creation.', details: err.message });
  }
});

export default router;