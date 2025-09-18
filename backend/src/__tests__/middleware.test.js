import jwt from 'jsonwebtoken';
import protect from '../middleware/auth.middleware.js';
import admin from '../middleware/admin.middleware.js';
import User from '../models/User.models.js';
import { createTestUser, createTestAdmin, generateToken } from './helpers.js';

// Mock express request and response
const mockRequest = (headers = {}, cookies = {}) => ({
  headers,
  cookies,
  user: null
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should authenticate user with valid JWT token', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);
      
      const req = mockRequest({}, { jwt: token });
      const res = mockResponse();

      await protect(req, res, mockNext);

      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle invalid JWT token', async () => {
      const req = mockRequest({}, { jwt: 'invalid-token' });
      const res = mockResponse();

      try {
        await protect(req, res, mockNext);
      } catch (error) {
        expect(error.message).toBe('Not authorized, token failed');
      }
      
      expect(req.user).toBeNull();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle request without token', async () => {
      const req = mockRequest();
      const res = mockResponse();

      try {
        await protect(req, res, mockNext);
      } catch (error) {
        expect(error.message).toBe('Not authorized, no token');
      }

      expect(req.user).toBeNull();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle token for non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const token = generateToken(fakeUserId);
      
      const req = mockRequest({}, { jwt: token });
      const res = mockResponse();

      await protect(req, res, mockNext);

      // When user is not found, req.user will be null but next() is still called
      expect(req.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('admin middleware', () => {
    it('should allow admin user to proceed', () => {
      const req = mockRequest();
      req.user = { isAdmin: true };
      const res = mockResponse();

      admin(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle non-admin user', () => {
      const req = mockRequest();
      req.user = { isAdmin: false };
      const res = mockResponse();

      try {
        admin(req, res, mockNext);
      } catch (error) {
        expect(error.message).toBe('Not authorized as an admin');
      }
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle request without user', () => {
      const req = mockRequest();
      const res = mockResponse();

      try {
        admin(req, res, mockNext);
      } catch (error) {
        expect(error.message).toBe('Not authorized as an admin');
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});