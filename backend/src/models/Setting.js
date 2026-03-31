import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({}, {
  strict: false,
  timestamps: true
});

export default mongoose.model('Setting', settingSchema);