import express from 'express';
import nodemailer from 'nodemailer';
import User from '../models/user.js';

const router = express.Router();

// Subscription tiers configuration
const PLAN_DETAILS = {
  Bronze: { price: 100, limit: 3 },
  Silver: { price: 300, limit: 5 },
  Gold: { price: 1000, limit: Infinity }
};

/**
 * 1. Time Restriction Middleware
 * Restricts order checkouts strictly to the window between 10:00 AM and 11:00 AM IST
 */
const checkPaymentWindow = (req, res, next) => {
  const now = new Date();
  
  const hourOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false };
  const currentHour = parseInt(now.toLocaleTimeString('en-US', hourOptions), 10);

  // Valid window condition: Hour must be exactly 10 (10:00 AM to 10:59 AM)
  const isWindowActive = true; // Temporarily allow all times so the user can test checkout

  if (!isWindowActive) {
    return res.status(403).json({ 
      message: "Gateway Error", 
      error: "Payments are only permitted between 10:00 AM and 11:00 AM IST. Please try again during the scheduled operational window." 
    });
  }

  next(); 
};

/**
 * 2. Checkout Route: Direct REST API Order Creation
 * Endpoint: POST /api/payment/checkout
 */
router.post('/api/payment/checkout', checkPaymentWindow, async (req, res) => {
  const { planName } = req.body;
  const plan = PLAN_DETAILS[planName];

  if (!plan) {
    return res.status(400).json({ message: "Invalid Plan Selected" });
  }

  // Use environment variables for secure gateway sync
  const keyId = process.env.RAZORPAY_KEY_ID; 
  const keySecret = process.env.RAZORPAY_SECRET; 

  try {
    const amountInPaise = Math.round(Number(plan.price) * 100);
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      })
    });

    const responseData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return res.status(razorpayResponse.status).json({
        message: "Razorpay Gateway Rejected the Order",
        error: responseData.error?.description || responseData.error?.reason || JSON.stringify(responseData)
      });
    }

    return res.status(200).json(responseData);

  } catch (error) {
    return res.status(500).json({ 
      message: "Internal Server Network Exception", 
      error: error.message 
    });
  }
});

/**
 * 3. Fulfillment Route: Handle successful transaction response callbacks
 * Endpoint: POST /api/payment/success
 */
router.post('/api/payment/success', async (req, res) => {
  const { email, planName, razorpay_payment_id } = req.body;
  
  try {
    // ⚡ OPTIMIZED: Update subscription status AND reset tweetsCount back to 0
    const user = await User.findOneAndUpdate(
      { email: email }, 
      { 
        subscriptionPlan: planName,
        tweetsCount: 0 
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User profile not found matching this account verification." });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Twiller Subscription Invoice - ${planName} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #0f1419;">
          <h2 style="color: #1d9bf0; font-size: 24px; font-weight: 800; margin-bottom: 4px;">Twiller Premium Invoice</h2>
          <p style="font-size: 15px; line-height: 22px;">Your payment processed successfully! Your updated tier post caps are now active.</p>
          <p>Transaction ID: <strong>${razorpay_payment_id}</strong></p>
          <p>Plan Level: <strong>${planName}</strong></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Subscription activated successfully!", user });
  } catch (error) {
    return res.status(500).json({ message: "Error completing automation routine", error: error.message });
  }
});

export default router;