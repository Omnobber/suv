import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { adminOnly, protect } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { validateProduct } from '../middleware/validators.js';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../controllers/productController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const upload = multer({ storage });
const router = express.Router();
const adminProductLimiter = createRateLimiter({ windowMs: 60000, max: 20, keyPrefix: 'admin-products' });

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, adminProductLimiter, upload.single('image'), validateProduct, createProduct);
router.put('/:id', protect, adminOnly, adminProductLimiter, upload.single('image'), validateProduct, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
