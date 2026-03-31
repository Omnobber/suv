import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';

dotenv.config();

const products = [
  {
    name: 'Lotus Arch Temple Mandir',
    category: 'Temple',
    subcategory: 'Wall Mandir',
    description: 'Handcrafted temple mandir with laser-cut doors and a soft matte ivory finish.',
    price: 6499,
    original_price: 7299,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1616627458926-4ef6d7c57d86?auto=format&fit=crop&w=900&q=80',
    featured: true,
    active: true,
    tags: ['mandir', 'temple', 'handcrafted']
  },
  {
    name: 'Diya Courtyard Festival Set',
    category: 'Festival',
    description: 'Premium festive decor set with layered brass-inspired detailing.',
    price: 1899,
    original_price: 2299,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1602984603885-42c0d4dfe985?auto=format&fit=crop&w=900&q=80',
    active: true,
    tags: ['festival', 'diya', 'decor']
  },
  {
    name: 'Peacock Filigree Wall Accent',
    category: 'Home Decor',
    description: 'Minimal handcrafted wall accent designed for refined interiors.',
    price: 2799,
    original_price: 3199,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    active: true,
    tags: ['wall art', 'home decor']
  },
  {
    name: 'Zari Bloom Cushion Cover',
    category: 'Embroidery',
    description: 'Soft neutral cushion cover elevated with premium zari embroidery.',
    price: 1499,
    original_price: 1799,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=900&q=80',
    active: true,
    tags: ['zari', 'embroidery']
  },
  {
    name: 'Zardozi Heritage Panel',
    category: 'Metal Embroidery',
    description: 'Statement metal embroidery artwork with artisan texture.',
    price: 4299,
    original_price: 4899,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    active: true,
    tags: ['zardozi', 'metal embroidery']
  }
];

const siteSettings = {
  brand_blue_text: 'Beli',
  brand_green_text: 'maa',
  slogan: 'स्वप्नात् सत्यम्।',
  footer_description: 'Premium cultural, spiritual and decorative handcrafted products. Temple mandirs, festival decor, embroidery and more - made with love in India.'
};

async function seed() {
  await connectDB();
  await Product.deleteMany();
  await User.deleteMany();
  await Setting.deleteMany();
  await Product.insertMany(products);
  const hashed = await bcrypt.hash('Admin@123', 10);
  await User.create({ name: 'Belimaa Admin', email: 'admin@belimaa.in', password: hashed, role: 'admin' });
  await Setting.create(siteSettings);
  console.log('Seeded Belimaa data');
  process.exit(0);
}

seed();