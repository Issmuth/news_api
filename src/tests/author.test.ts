import request from 'supertest';
import app from '../app';
import { db } from '../db';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret';

jest.mock('../db', () => ({
  db: {
    select: jest.fn()
  }
}));

describe('Author Dashboard Integration Test', () => {
  const authorId = 'test-author-123';
  const token = jwt.sign({ sub: authorId, role: 'author' }, SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/author/dashboard - should return success and stats', async () => {
    const mockData = [
      { articleId: '1', title: 'First Post', views: 500 },
      { articleId: '2', title: 'Second Post', views: 25 }
    ];

    const mockChain = {
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockResolvedValue(mockData)
    };

    (db.select as jest.Mock).mockReturnValue(mockChain);

    const res = await request(app)
      .get('/api/author/dashboard')
      .set('Authorization', `Bearer ${token}`);


   expect(res.status).toBe(200);
    expect(res.body).toEqual({
      Success: true,          
      Message: "Performance stats", 
      Object: mockData,        
      Errors: null             
    });
  });

  it('GET /api/author/dashboard - should reject readers with 403', async () => {
    const readerToken = jwt.sign({ sub: 'reader-1', role: 'reader' }, SECRET);

    const res = await request(app)
      .get('/api/author/dashboard')
      .set('Authorization', `Bearer ${readerToken}`);

    expect(res.status).toBe(403);
  });
});