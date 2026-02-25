import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET || 'secret';
const mockToken = jwt.sign({ sub: 'user-uuid', role: 'author' }, TEST_SECRET);

// Combined Mock for all Article interactions
jest.mock('../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockResolvedValue([
      { id: '1', title: 'Feed Article', authorName: 'Ismael' }
    ]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 'new-123', title: 'New Post' }]),
  },
}));

describe('Article & Feed Endpoints', () => {
  
  describe('GET /articles (Public Feed)', () => {
    it('should return 200 and list articles without a token', async () => {
      const res = await request(app).get('/api/articles');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.Success).toBe(true);
      expect(res.body.Object).toBeInstanceOf(Array);
    });
  });

  describe('POST /articles (Author Only)', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/articles').send({ title: 'Title' });
      expect(res.statusCode).toEqual(401);
    });

    it('should return 201 if a valid author token is provided', async () => {
      const res = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Valid Title',
          content: 'Valid content with enough length',
          category: 'Tech',
          status: 'Published'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.Object.title).toBe('New Post');
    });
  });
});