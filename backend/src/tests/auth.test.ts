import request from 'supertest';
import app from '../app';
import { db } from '../db';

// Mock the DB module
jest.mock('../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockImplementation(() => []),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockImplementation(() => [{ id: '123', name: 'Test', email: 't@t.com' }]),
  },
}));

describe('Auth Endpoints', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Abebe Kebede',
        email: 'abebe@gmail.com',
        password: 'Password123!',
        role: 'author'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object).toHaveProperty('id');
  });

  it('should return 400 for invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Abebe Kebede',
        email: 'abebe@gmail.com',
        password: '123',
        role: 'author'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.Success).toBe(false);
  });
});