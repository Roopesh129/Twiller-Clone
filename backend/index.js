import dotenv from 'dotenv';
dotenv.config(); // 1. Load the environment first!
import path from "path";

// 1. Core runtime environment configuration initializes first
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import razorpayPackage from "razorpay";
import nodemailer from "nodemailer";
import useragent from "express-useragent";
import multer from "multer";
import fs from "fs";
import audioTweetRoutes from './routes/audioTweet.js';
import userRouter from './routes/user.js';
import languageRoutes from "./routes/language.js";

// 2. Mongoose Models Imported Early
import User from "./models/user.js";
import Tweet from "./models/tweet.js";

// 3. Local module routes
import authRoutes from "./routes/auth.js";

const app = express();

// Initialize Razorpay
const razorpay = new razorpayPackage({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_SECRET || 'placeholder_secret',
});

// backend/index.js
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", process.env.CLIENT_URL].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "user-agent",
      "x-client-device"
    ],
  })
);
app.use(express.json());
app.use(useragent.express());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
// Serve uploaded audio static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/user', userRouter);

// Mount the Audio Tweet Routes
app.use('/api/audio-tweet', audioTweetRoutes);
app.use("/api/language", languageRoutes);

// Image Upload Configuration
const imageUploadDir = path.join(process.cwd(), 'uploads', 'images');
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}-${sanitizedBase}${ext}`);
  }
});
const uploadImage = multer({ storage: imageStorage });

app.post('/api/upload-image', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  const imageUrl = `${serverUrl}/uploads/images/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
});

// System configurations
const PLAN_LIMITS = {
  'Free': 1,
  'Bronze': 3,
  'Silver': 5,
  'Gold': Infinity
};

const PLAN_DETAILS = {
  Bronze: { price: 100 },
  Silver: { price: 300 },
  Gold: { price: 1000 }
};

/**
 * Time Restriction Middleware
 * Restricts order checkouts strictly to the window between 10:00 AM and 11:00 AM IST
 */
const checkPaymentWindow = (req, res, next) => {
  const now = new Date();

  const hourOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false };
  const currentHour = parseInt(now.toLocaleTimeString('en-US', hourOptions), 10);

  const isWindowActive = (currentHour === 10);

  if (!isWindowActive) {
    return res.status(403).json({
      message: "Gateway Error",
      error: "Payments are only permitted between 10:00 AM and 11:00 AM IST. Please try again during the scheduled operational window."
    });
  }

  next();
};

// Base Heartbeat
app.get("/", (req, res) => {
  res.send("Twiller backend is running successfully");
});

const port = process.env.PORT || 5000;
const url = process.env.MONGODB_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

/* ==========================================
   1. AUTHENTICATION & USER PROFILE ROUTES
   ========================================== */

// Register
app.post("/register", async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).send({ error: "Email parameter is required." });
    }

    const cleanEmail = req.body.email.trim().toLowerCase();

    const existinguser = await User.findOne({ email: cleanEmail });
    if (existinguser) {
      return res.status(200).send(existinguser);
    }

    const userData = {
      ...req.body,
      email: cleanEmail
    };

    const newUser = new User(userData);
    await newUser.save();
    return res.status(201).send(newUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

// Loggedinuser
app.get("/loggedinuser", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send({ error: "Email required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

// Update Profile
app.patch("/userupdate/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const cleanEmail = email.trim().toLowerCase();
    const updated = await User.findOneAndUpdate(
      { email: cleanEmail },
      { $set: req.body },
      { new: true, upsert: false }
    );
    return res.status(200).send(updated);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

/* ==========================================
   2. TWEETS / FEED TIMELINE ROUTES
   ========================================== */

// GET all tweets (UPDATED: Added populate)
app.get("/post", async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .populate("author", "displayName username name avatar")
      .sort({ _id: -1 });

    return res.status(200).send(tweets);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// POST a new tweet with enforcement (UPDATED: Added populate before returning response)
app.post("/post", async (req, res) => {
  try {
    const { userEmail, author, content, image } = req.body;

    if (!userEmail) {
      return res.status(400).send({ error: "Missing identity parameter: userEmail" });
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).send({ error: "User account profile not found." });
    }

    const currentPlan = user.subscriptionPlan || 'Free';
    const allowedLimit = PLAN_LIMITS[currentPlan];

    /* 
    // TEMPORARILY DISABLED FOR TESTING
    if ((user.tweetsCount || 0) >= allowedLimit) {
      return res.status(403).send({
        error: `Posting Denied: You have reached the maximum limit of ${allowedLimit} tweet(s) for the ${currentPlan} tier plan. Upgrade your subscription tier to unlock more posts!`
      });
    }
    */

    const tweet = new Tweet({
      author: author || user._id, // Assign User ObjectId
      content: content,
      image: image || null
    });

    await tweet.save();

    // Populate the author info on the tweet document
    await tweet.populate("author", "displayName username name avatar");

    user.tweetsCount = (user.tweetsCount || 0) + 1;
    await user.save();

    return res.status(201).send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

/* ==========================================
   3. RAZORPAY SUBSCRIPTION INTEGRATION ROUTES
   ========================================== */

app.post('/api/payment/checkout', checkPaymentWindow, async (req, res) => {
  const { planName } = req.body;
  const plan = PLAN_DETAILS[planName];

  if (!plan) {
    return res.status(400).json({ message: "Invalid Plan Selected" });
  }

  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
    return res.status(500).json({
      message: "Razorpay Order Creation Failed",
      error: "The server backend process is reading placeholder keys instead of your real .env file values."
    });
  }

  try {
    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: "Razorpay Order Creation Failed", error: error.message });
  }
});

app.post('/api/payment/success', async (req, res) => {
  const { email, planName, razorpay_payment_id } = req.body;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { subscriptionPlan: planName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User profile not found matching this account verification." });
    }

    console.log("Checking Mail Config:", {
      user: process.env.EMAIL_USER ? "Loaded ✅" : "MISSING ❌",
      pass: process.env.EMAIL_PASS ? "Loaded ✅" : "MISSING ❌"
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: `Twiller Subscription Invoice - ${planName} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #0f1419;">
          <h2 style="color: #1d9bf0; font-size: 24px; font-weight: 800; margin-bottom: 4px;">Twiller Premium Invoice</h2>
          <hr style="border: 0; border-top: 1px solid #eff3f4; margin: 20px 0;"/>
          <p style="font-size: 16px;">Hi <strong>${user.displayName || 'Subscriber'}</strong>,</p>
          <p style="font-size: 15px; line-height: 22px;">Your payment processed successfully! Your new tweeting limit cap has been unlocked.</p>
          <p style="font-size: 14px; color: #536471;">Payment ID: ${razorpay_payment_id}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Subscription activated and digital invoice delivered successfully!",
      user
    });
  } catch (error) {
    return res.status(500).json({ message: "Error completing full automation routine", error: error.message });
  }
});

app.get("/api/user/login-history", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email parameter is required." });
    }

    const history = await LoginHistory.find({ email })
      .sort({ loginTime: -1 })
      .limit(20);

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch login history." });
  }
});

// ==========================================
// LIKE A TWEET ROUTE
// ==========================================
app.post('/like/:id', async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { userId } = req.body;

    console.log("--- LIKE REQUEST RECEIVED ---");
    console.log("Tweet ID:", tweetId);
    console.log("Incoming userId:", userId, "Type:", typeof userId);

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ error: "Tweet not found" });

    console.log("Current tweet.likedBy in DB:", tweet.likedBy);

    const likedByArray = (tweet.likedBy || []).map(id => id.toString());
    const stringUserId = userId.toString();
    const hasLiked = likedByArray.includes(stringUserId);

    console.log("Has user liked already?", hasLiked);

    if (hasLiked) {
      tweet.likedBy = (tweet.likedBy || []).filter(id => id.toString() !== stringUserId);
      tweet.likes = Math.max(0, (tweet.likes || 1) - 1);
    } else {
      tweet.likedBy = [...(tweet.likedBy || []), userId];
      tweet.likes = (tweet.likes || 0) + 1;
    }

    await tweet.save();
    await tweet.populate("author", "displayName username name avatar verified");

    console.log("Updated tweet.likedBy saved to DB:", tweet.likedBy);
    res.status(200).json(tweet);

  } catch (error) {
    console.error("Error liking tweet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ==========================================
// RETWEET A TWEET ROUTE
// ==========================================
app.post('/retweet/:id', async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ error: "Tweet not found" });

    // Safely map stored ObjectIds to strings for accurate comparison
    const retweetedByArray = (tweet.retweetedBy || []).map(id => id.toString());
    const stringUserId = userId.toString();
    const hasRetweeted = retweetedByArray.includes(stringUserId);

    if (hasRetweeted) {
      // Undo Retweet: Filter out matching string IDs
      tweet.retweetedBy = (tweet.retweetedBy || []).filter(id => id.toString() !== stringUserId);
      tweet.retweets = Math.max(0, (tweet.retweets || 1) - 1);
    } else {
      // Retweet: Push raw userId
      tweet.retweetedBy = [...(tweet.retweetedBy || []), userId];
      tweet.retweets = (tweet.retweets || 0) + 1;
    }

    await tweet.save();

    // CRITICAL: Populate author so frontend doesn't lose user data
    await tweet.populate("author", "displayName username name avatar verified");

    res.status(200).json(tweet);

  } catch (error) {
    console.error("Error retweeting tweet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ==========================================
// COMMENT ON A TWEET ROUTE
// ==========================================
app.post('/comment/:id', async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: "Missing userId or content" });
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ error: "Tweet not found" });

    // Store the reply locally inside the tweet's replies array
    const newComment = {
      userId,
      content,
      createdAt: new Date()
    };

    tweet.replies = [...(tweet.replies || []), newComment];
    tweet.comments = (tweet.comments || 0) + 1;

    await tweet.save();

    // CRITICAL: Populate author so frontend doesn't lose user data when rendering the updated TweetCard
    await tweet.populate("author", "displayName username name avatar verified");

    res.status(200).json(tweet);

  } catch (error) {
    console.error("Error commenting on tweet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});