import express from 'express';
import { adminOnly, protect } from '../middleware/auth.js';
import { createOrder, getOrders, verifyPayment } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', protect, adminOnly, getOrders);
router.post('/:id/verify-payment', verifyPayment);

export default router;
