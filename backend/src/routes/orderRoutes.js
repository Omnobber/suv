import express from 'express';
import { adminOnly, protect } from '../middleware/auth.js';
import { createOrder, getInvoice, getOrders, trackOrder, verifyPayment } from '../controllers/orderController.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { validateOrder } from '../middleware/validators.js';

const router = express.Router();

router.get('/track', trackOrder);
router.get('/:id/invoice', getInvoice);
router.post('/', createRateLimiter({ windowMs: 60000, max: 10, keyPrefix: 'orders' }), validateOrder, createOrder);
router.get('/', protect, adminOnly, getOrders);
router.post('/:id/verify-payment', verifyPayment);

export default router;
