import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

function sanitizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function authResponse(user) {
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tokenVersion: user.tokenVersion,
      authProvider: user.authProvider,
      phoneVerified: !!user.phoneVerified
    },
    token: generateToken(user)
  };
}

export async function register(req, res) {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password || '';

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    authProvider: 'email'
  });

  res.status(201).json(authResponse(user));
}

export async function login(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

  res.json(authResponse(user));
}

export async function requestOtp(req, res) {
  const phone = sanitizePhone(req.body.phone);
  const name = req.body.name?.trim();

  if (phone.length < 10) {
    return res.status(400).json({ message: 'Enter a valid phone number.' });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpCodeHash = hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  let user = await User.findOne({ phone });
  if (!user) {
    const placeholderPassword = await bcrypt.hash(crypto.randomUUID(), 10);
    user = await User.create({
      name: name || `Belimaa User ${phone.slice(-4)}`,
      email: `phone-${phone}@belimaa.local`,
      phone,
      password: placeholderPassword,
      authProvider: 'phone',
      otpChannel: 'sms',
      otpCodeHash,
      otpExpiresAt
    });
  } else {
    if (name && (!user.name || user.name.startsWith('Belimaa User '))) user.name = name;
    user.phone = phone;
    user.authProvider = user.authProvider || 'phone';
    user.otpChannel = 'sms';
    user.otpCodeHash = otpCodeHash;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();
  }

  console.log(`[Belimaa OTP] ${phone}: ${otp}`);

  res.json({
    message: 'OTP generated. Connect SMS or WhatsApp gateway to deliver it live.',
    phone,
    expiresInSeconds: 300,
    devOtp: process.env.NODE_ENV === 'production' ? undefined : otp
  });
}

export async function verifyOtp(req, res) {
  const phone = sanitizePhone(req.body.phone);
  const otp = String(req.body.otp || '').trim();
  const name = req.body.name?.trim();

  if (!phone || otp.length !== 6) {
    return res.status(400).json({ message: 'Phone number and 6-digit OTP are required.' });
  }

  const user = await User.findOne({ phone });
  if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
    return res.status(400).json({ message: 'OTP request not found. Please request a new OTP.' });
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
  }

  if (user.otpCodeHash !== hashOtp(otp)) {
    return res.status(400).json({ message: 'Invalid OTP.' });
  }

  if (name) user.name = name;
  user.phoneVerified = true;
  user.authProvider = 'phone';
  user.otpCodeHash = '';
  user.otpExpiresAt = null;
  await user.save();

  res.json(authResponse(user));
}

export async function socialAuthStatus(req, res) {
  const provider = req.params.provider;
  if (!['google', 'facebook'].includes(provider)) {
    return res.status(404).json({ message: 'Unsupported provider.' });
  }

  return res.status(501).json({
    message: `${provider[0].toUpperCase()}${provider.slice(1)} login needs provider app keys before it can go live.`,
    provider,
    configured: false
  });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select('_id name email phone role tokenVersion authProvider phoneVerified createdAt');
  if (!user) return res.status(404).json({ message: 'User not found.' });

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tokenVersion: user.tokenVersion,
      authProvider: user.authProvider,
      phoneVerified: !!user.phoneVerified,
      createdAt: user.createdAt
    }
  });
}
