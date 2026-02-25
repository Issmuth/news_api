import { Router } from 'express';
import authRoutes from './auth.routes';
// import articleRoutes from './article.routes'; // We'll add this next

const router = Router();

router.use('/auth', authRoutes);
// router.use('/articles', articleRoutes);

export default router;