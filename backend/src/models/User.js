import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, sparse: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  authProvider: { type: String, enum: ['email', 'phone', 'google', 'facebook'], default: 'email' },
  phoneVerified: { type: Boolean, default: false },
  otpCodeHash: { type: String, default: '' },
  otpExpiresAt: { type: Date, default: null },
  otpChannel: { type: String, enum: ['sms', 'whatsapp', 'email', 'none'], default: 'none' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
