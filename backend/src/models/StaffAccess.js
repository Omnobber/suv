import mongoose from 'mongoose';

const staffAccessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  role: { type: String, default: 'catalog_manager', trim: true },
  status: { type: String, default: 'active', trim: true }
}, { timestamps: true });

staffAccessSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('StaffAccess', staffAccessSchema);
