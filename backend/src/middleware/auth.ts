import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { baseResponse } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Extend Express Request type to include user data
export interface AuthRequest extends Request {
  user?: {
    sub: string;
    role: 'author' | 'reader';
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(baseResponse(false, "Unauthorized: No token provided"));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(baseResponse(false, "Unauthorized: Invalid or expired token"));
  }
};

export const requireRole = (role: 'author' | 'reader') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json(baseResponse(false, "Forbidden: Insufficient permissions"));
    }
    next();
  };
};

// Used for Engagement Trigger where guests are allowed
export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    } catch {
      // Ignore errors; req.user remains undefined for guests
    }
  }
  next();
};