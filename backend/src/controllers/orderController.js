import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import { parseOrderPayload, serializeOrder } from '../utils/serializers.js';

const usingPlaceholderKeys = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder') || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('placeholder');

const razorpay = usingPlaceholderKeys ? null : new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function getOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ orders });
}

export async function createOrder(req, res) {
  const payload = parseOrderPayload(req.body);
  const razorpayOrder = razorpay
    ? await razorpay.orders.create({ amount: Number(payload.total) * 100, currency: 'INR', receipt: `belimaa_${Date.now()}` })
    : { id: `mock_order_${Date.now()}`, amount: Number(payload.total) * 100, currency: 'INR' };

  const order = await Order.create({
    ...payload,
    razorpayOrderId: razorpayOrder.id
  });

  res.status(201).json({ order: serializeOrder(order), razorpayOrder, mockMode: usingPlaceholderKeys });
}

export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!usingPlaceholderKeys) {
    const digest = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }
  }

  const order = await Order.findByIdAndUpdate(req.params.id, {
    paymentStatus: 'paid',
    status: 'confirmed',
    razorpayPaymentId: razorpay_payment_id || 'mock_payment',
    razorpaySignature: razorpay_signature || 'mock_signature'
  }, { new: true });

  res.json({ order: serializeOrder(order) });
}