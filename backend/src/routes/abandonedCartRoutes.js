import express from 'express';
import { listAbandonedCarts, recoverAbandonedCart, upsertAbandonedCart } from '../controllers/abandonedCartController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { validateAbandonedCart } from '../middleware/validators.js';

const router = express.Router();

router.post('/', createRateLimiter({ windowMs: 60000, max: 10, keyPrefix: 'abandoned-cart' }), validateAbandonedCart, upsertAbandonedCart);
router.get('/', protect, adminOnly, listAbandonedCarts);
router.patch('/:cartId/recover', protect, adminOnly, recoverAbandonedCart);

export default router;
