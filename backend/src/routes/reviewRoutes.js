import express from 'express';
import { listAdminReviews, listProductReviews, createReview, updateReviewStatus } from '../controllers/reviewController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { validateReview } from '../middleware/validators.js';

const router = express.Router();
const reviewLimiter = createRateLimiter({ windowMs: 60000, max: 8, keyPrefix: 'reviews' });

router.get('/admin', protect, adminOnly, listAdminReviews);
router.patch('/admin/:reviewId', protect, adminOnly, updateReviewStatus);
router.get('/product/:productId', listProductReviews);
router.post('/product/:productId', reviewLimiter, validateReview, createReview);

export default router;
