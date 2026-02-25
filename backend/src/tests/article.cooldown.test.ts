import request from 'supertest';
import app from '../app';
import { db } from '../db';
import IORedis from 'ioredis';

// We need to spy on the DB 'insert' method
jest.mock('../db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn().mockImplementation(() => ({
      values: jest.fn().mockResolvedValue({})
    }))
  }
}));

const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

describe('Article View Cooldown logic', () => {
  const articleId = 'test-article-id';

  beforeEach(async () => {
    jest.clearAllMocks();
    await redis.flushall();

    // Mock the 'select' so the controller thinks the article exists
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ id: articleId, status: 'Published' }])
    });
  });

  it('should only call db.insert once even if user refreshes (cooldown)', async () => {
    // 1. First request
    await request(app).get(`/api/articles/${articleId}`);

    // 2. Second request (immediate refresh)
    await request(app).get(`/api/articles/${articleId}`);

    // 3. Wait for setImmediate to fire inside the controller
    await new Promise((resolve) => setImmediate(resolve));

    // 4. Assert that insert was only called once
    expect(db.insert).toHaveBeenCalledTimes(1);
  });
});