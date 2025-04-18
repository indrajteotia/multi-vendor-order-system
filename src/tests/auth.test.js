const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { getTestUserToken } = require('./testUtils');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new customer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: 'customer@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should prevent duplicate emails', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      await User.create({
        name: 'Login Test',
        email: 'login@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});