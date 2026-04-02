import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import abandonedCartRoutes from './routes/abandonedCartRoutes.js';
import authRoutes from './routes/authRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import tableRoutes from './routes/tableRoutes.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');
const uploadsDir = path.join(__dirname, '..', 'uploads');
const cssDir = path.join(projectRoot, 'css');
const jsDir = path.join(projectRoot, 'js');
const imagesDir = path.join(projectRoot, 'images');
const allowedOrigins = String(process.env.FRONTEND_ORIGIN || '').split(',').map((entry) => entry.trim()).filter(Boolean);
const staticHtmlFiles = new Set([
  'index.html',
  'products.html',
  'product-detail.html',
  'category.html',
  'cart.html',
  'login.html',
  'admin.html'
]);

fs.mkdirSync(uploadsDir, { recursive: true });
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  }
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/css', express.static(cssDir, { maxAge: '7d' }));
app.use('/js', express.static(jsDir, { maxAge: '7d' }));
app.use('/images', express.static(imagesDir, { maxAge: '30d' }));
app.use('/favicon.svg', express.static(path.join(projectRoot, 'favicon.svg'), { maxAge: '30d' }));
app.use('/robots.txt', express.static(path.join(projectRoot, 'robots.txt'), { maxAge: '1d' }));
app.use('/site.webmanifest', express.static(path.join(projectRoot, 'site.webmanifest'), { maxAge: '1d' }));
app.use('/sitemap.xml', express.static(path.join(projectRoot, 'sitemap.xml'), { maxAge: '1d' }));

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/abandoned-carts', abandonedCartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tables', tableRoutes);

app.get('/', (_req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/:page', (req, res, next) => {
  const page = String(req.params.page || '').trim();
  if (!staticHtmlFiles.has(page)) return next();
  res.sendFile(path.join(projectRoot, page));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error.' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Belimaa API running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Database connection failed', error);
  process.exit(1);
});
