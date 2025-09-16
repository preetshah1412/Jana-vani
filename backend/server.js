const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/aadhaar-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Aadhaar Verification Schema
const AadhaarSchema = new mongoose.Schema({
  aadhaarNumber: String,
  otp: String,
  verified: { type: Boolean, default: false },
});
const Aadhaar = mongoose.model('Aadhaar', AadhaarSchema);

// Initiate Aadhaar Verification (Send OTP)
app.post('/api/aadhaar/initiate', async (req, res) => {
  const { aadhaarNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Aadhaar.findOneAndUpdate(
    { aadhaarNumber },
    { otp, verified: false },
    { upsert: true, new: true }
  );
  console.log(`Mock OTP for ${aadhaarNumber}: ${otp}`);
  res.json({ success: true, message: 'OTP sent to registered mobile (mock).' });
});

// Verify OTP
app.post('/api/aadhaar/verify', async (req, res) => {
  const { aadhaarNumber, otp } = req.body;
  const record = await Aadhaar.findOne({ aadhaarNumber, otp });
  if (record) {
    record.verified = true;
    await record.save();
    res.json({ success: true, message: 'Aadhaar verified successfully (mock).' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP.' });
  }
});

app.listen(4000, () => console.log('Server running on port 4000'));