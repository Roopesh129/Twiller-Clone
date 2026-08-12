import mongoose from 'mongoose';

const loginSessionSchema = new mongoose.Schema({
  browser: { type: String, required: true },
  os: { type: String, required: true },
  deviceCategory: { type: String, required: true }, // 'desktop', 'laptop', or 'mobile'
  ipAddress: { type: String, required: true },
  loginTimestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: String,
  password: String,
  tempOtp: String,
  tempOtpExpires: Date,
  lastPasswordResetDate: Date,
  loginHistory: [loginSessionSchema],
  notificationsEnabled: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);