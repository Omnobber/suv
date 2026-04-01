import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true, uppercase: true },
  discount: { type: Number, default: 0 },
  minOrder: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paused'], default: 'active' }
}, { timestamps: true });

couponSchema.index({ code: 1 }, { unique: true });

export default mongoose.model('Coupon', couponSchema);
