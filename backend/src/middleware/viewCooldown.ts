import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import IORedis from 'ioredis';

const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

export const viewCooldown = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const articleId = req.params.id;
  
  // Use User ID if logged in, otherwise use IP (standardized for proxies)
  const identifier = req.user?.sub || req.ip || req.headers['x-forwarded-for'];
  
  if (!identifier || !articleId) return next();

  const lockKey = `view_lock:${identifier}:${articleId}`;
  
  const isLocked = await redis.get(lockKey);

  if (isLocked) {
    (req as any).skipLogging = true;
  } else {
    // 5-minute cooldown
    await redis.set(lockKey, '1', 'EX', 300);
  }

  next();
};