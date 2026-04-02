import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/belimaa');
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }
  await mongoose.connect(uri);
}
