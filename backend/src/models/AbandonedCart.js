import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number
}, { _id: false });

const abandonedCartSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, required: true, index: true },
  phone: { type: String, trim: true, default: '' },
  items: [cartItemSchema],
  subtotal: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'recovered', 'archived'], default: 'active' },
  reminderSentAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('AbandonedCart', abandonedCartSchema);
