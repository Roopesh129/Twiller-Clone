const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  deviceType: { type: String, required: true }, // 'desktop', 'mobile', or 'tablet'
  ipAddress: { type: String, required: true },
  loginTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['SUCCESS', 'BLOCKED', 'OTP_PENDING'], default: 'SUCCESS' }
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);