import mongoose from 'mongoose';

const adminActivitySchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  detail: { type: String, default: '', trim: true },
  by: { type: String, default: 'Admin', trim: true },
  at: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('AdminActivity', adminActivitySchema);
