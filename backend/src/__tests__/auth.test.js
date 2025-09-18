import request from 'supertest';
import app from '../test-app.js';
import { createTestUser, createTestAdmin, generateToken, seedTestData, clearDatabase } from './helpers.js';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', userData.username);
      expect(response.body).toHaveProperty('isAdmin', false);
      
      // Should set JWT cookie
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should not register user with existing username', async () => {
      await createTestUser({ username: 'existinguser' });

      const userData = {
        username: 'existinguser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should not register user without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(500); // Mongoose validation error gets converted to 500

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', userData.username);
      expect(response.body).toHaveProperty('isAdmin');
      
      // Should set JWT cookie
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should not login user with incorrect password', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid username or password');
    });

    it('should not login non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid username or password');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
      
      // Should clear JWT cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('jwt=;');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile when authenticated', async () => {
      const user = await createTestUser({ username: 'profileuser' });
      const token = generateToken(user._id);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `jwt=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', user.username);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});