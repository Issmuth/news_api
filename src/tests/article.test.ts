import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET || 'secret'; 

jest.mock('../db', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ 
      id: 'article-123', 
      title: 'Test News', 
      authorId: 'user-uuid' 
    }]),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  },
}));

const mockToken = jwt.sign({ sub: 'user-uuid', role: 'author' }, TEST_SECRET);

describe('Article Endpoints', () => {
  it('should allow author to create article', async () => {
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Test News',
        content: 'This is a test article content.',
        category: 'Tech',
        status: 'Published'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.Success).toBe(true);
  });
});