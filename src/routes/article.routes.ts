import { Router } from 'express';
import { 
  createArticle, 
  getMyArticles, 
  updateArticle, 
  deleteArticle,
  getPublicFeed,
  getArticleById
} from '../controllers/article.controller';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation Schema for Article
const articleSchema = z.object({
  body: z.object({
    title: z.string().max(150, "Title too long"),
    content: z.string().min(10, "Content too short"),
    category: z.string().max(100),
    status: z.enum(['Draft', 'Published']).default('Draft')
  })
});

router.get('/', getPublicFeed);

router.get('/:id',optionalAuthenticate, getArticleById);

// All routes here require authentication and 'author' role
router.use(authenticate, requireRole('author'));

router.post('/', validate(articleSchema), createArticle);
router.get('/me', getMyArticles);
router.put('/:id', validate(articleSchema), updateArticle);
router.delete('/:id', deleteArticle);

export default router;