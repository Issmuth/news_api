import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { signupSchema, loginSchema } from '../middleware/validation';

const router = Router();

router.get('/test', (req, res) => {
  res.json({ message: "Auth route is working!" });
});

// /api/auth/signup
router.post('/signup', validate(signupSchema), signup);

// /api/auth/login
router.post('/login', validate(loginSchema), login);

export default router;