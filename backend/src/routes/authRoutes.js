import express from 'express';
import { login, me, register, requestOtp, socialAuthStatus, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/oauth/:provider', socialAuthStatus);
router.get('/me', protect, me);

export default router;
