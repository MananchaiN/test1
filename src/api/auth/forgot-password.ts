import { Router } from 'express';
import { forgotPassword } from '../controllers/auth';

const router = Router();

router.post('/api/auth/forgot-password', forgotPassword);

export default router;