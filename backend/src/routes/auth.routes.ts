import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { body } from 'express-validator';
import { UserRole } from '../models/User';

const router = Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(Object.values(UserRole)).withMessage('Invalid role'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

export default router;
