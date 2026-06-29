import { Router } from 'express';
import { getUserProfile } from '../controllers/auth';

const router = Router();

router.get('/api/auth/me', getUserProfile);

export default router;