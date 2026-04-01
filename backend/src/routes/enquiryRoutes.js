import express from 'express';
import { createEnquiry, getEnquiries } from '../controllers/enquiryController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { validateEnquiry } from '../middleware/validators.js';

const router = express.Router();

router.post('/', createRateLimiter({ windowMs: 60000, max: 8, keyPrefix: 'enquiries' }), validateEnquiry, createEnquiry);
router.get('/', protect, adminOnly, getEnquiries);

export default router;
