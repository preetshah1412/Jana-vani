require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors()); // adjust origin if you want to restrict to your frontend
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connect error:', err));

// Schema & model
const AadhaarSchema = new mongoose.Schema({
  aadhaarNumber: { type: String, required: true, unique: true },
  otp: String,
  otpExpiresAt: Date,
  verified: { type: Boolean, default: false },
}, { timestamps: true });

const Aadhaar = mongoose.model('Aadhaar', AadhaarSchema);

// Helper to create OTP and expiry (5 minutes)
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Initiate OTP
app.post('/api/aadhaar/initiate', async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      return res.status(400).json({ success: false, message: 'Invalid Aadhaar number' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Aadhaar.findOneAndUpdate(
      { aadhaarNumber },
      { otp, otpExpiresAt: expiresAt, verified: false },
      { upsert: true, new: true }
    );

    // In production send SMS via official provider; here we log it.
    console.log(`Mock OTP for ${aadhaarNumber}: ${otp} (expires ${expiresAt.toISOString()})`);

    return res.json({ success: true, message: 'OTP sent to registered mobile (mock).' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP
app.post('/api/aadhaar/verify', async (req, res) => {
  try {
    const { aadhaarNumber, otp } = req.body;
    if (!aadhaarNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const record = await Aadhaar.findOne({ aadhaarNumber });
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this Aadhaar' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (record.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    record.verified = true;
    record.otp = null;
    record.otpExpiresAt = null;
    await record.save();

    return res.json({ success: true, message: 'Aadhaar verified (mock).' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));