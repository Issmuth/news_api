import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const TEST_SECRET = process.env.JWT_SECRET || 'secret';

jest.mock('../db', () => {
  // Define the inner mock functions here so they are available when hoisted
  const internalMockValues = jest.fn().mockResolvedValue(true);
  const internalMockInsert = jest.fn().mockReturnValue({ values: internalMockValues });

  return {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ 
        id: 'article-123', 
        status: 'Published', 
        title: 'Test News' 
      }]),
      insert: internalMockInsert,
      // We attach them to the db object so we can access them in tests
      _mockInsert: internalMockInsert,
      _mockValues: internalMockValues
    },
  };
});

describe('Engagement Tracker (User Story 5)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log a guest read with null readerId', async () => {
    const res = await request(app).get('/api/articles/article-123');

    expect(res.statusCode).toEqual(200);

    // Wait for the event loop
    await new Promise((resolve) => setImmediate(resolve));

    // Access the mocks through the imported db object (cast as any for TS)
    const dbMock = db as any;
    expect(dbMock._mockInsert).toHaveBeenCalled();
    expect(dbMock._mockValues).toHaveBeenCalledWith(expect.objectContaining({
      articleId: 'article-123',
      readerId: null
    }));
  });

  it('should log an authenticated read with user sub from JWT', async () => {
    const token = jwt.sign({ sub: 'user-789', role: 'reader' }, TEST_SECRET);

    const res = await request(app)
      .get('/api/articles/article-123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);

    await new Promise((resolve) => setImmediate(resolve));

    const dbMock = db as any;
    expect(dbMock._mockInsert).toHaveBeenCalled();
    expect(dbMock._mockValues).toHaveBeenCalledWith(expect.objectContaining({
      articleId: 'article-123',
      readerId: 'user-789'
    }));
  });
});