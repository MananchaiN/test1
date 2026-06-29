import { Router } from 'express';
import { registerUser } from '../controllers/auth';
import { rateLimit } from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many attempts, please try again later',
});

const router = Router();

router.post('/api/auth/register', authLimiter, registerUser);

export default router;