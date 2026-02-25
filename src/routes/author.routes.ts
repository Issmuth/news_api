import { Router } from 'express';
import { getAuthorDashboard } from '../controllers/author.controller';
import { authenticate, requireRole } from '../middleware/auth';


const router = Router();


router.get('/dashboard',authenticate, requireRole('author'), getAuthorDashboard);

export default router;