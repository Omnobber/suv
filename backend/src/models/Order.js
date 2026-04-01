import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  price: Number,
  qty: Number,
  image_url: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'cod' },
  paymentStatus: { type: String, default: 'created' },
  status: { type: String, default: 'pending' },
  invoiceNumber: { type: String, trim: true, default: '' },
  trackingNumber: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, default: '' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
