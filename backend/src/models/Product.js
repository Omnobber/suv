import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  subcategory: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  price: { type: Number, required: true },
  original_price: { type: Number, default: null },
  stock: { type: Number, default: 0 },
  image: { type: String, required: true },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  tags: [{ type: String, trim: true }]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('image_url').get(function imageUrl() {
  return this.image;
});

export default mongoose.model('Product', productSchema);