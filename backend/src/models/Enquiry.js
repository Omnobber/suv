import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  message: { type: String, trim: true, default: '' },
  status: { type: String, trim: true, default: 'new' }
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);