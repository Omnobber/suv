import express from 'express';
import { login, me, register, requestOtp, socialAuthStatus, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { validateAuth } from '../middleware/validators.js';

const router = express.Router();
const authLimiter = createRateLimiter({ windowMs: 60000, max: 10, keyPrefix: 'auth' });

router.post('/register', authLimiter, validateAuth, register);
router.post('/login', authLimiter, validateAuth, login);
router.post('/request-otp', authLimiter, requestOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.get('/oauth/:provider', socialAuthStatus);
router.get('/me', protect, me);

export default router;
