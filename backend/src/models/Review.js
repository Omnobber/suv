import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  name: { type: String, trim: true, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, trim: true, required: true },
  comment: { type: String, trim: true, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
