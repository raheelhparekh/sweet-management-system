import User from '../models/User.models.js';
import Sweet from '../models/Sweet.models.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const createTestUser = async (userData = {}) => {
  const defaultUserData = {
    username: 'testuser',
    password: 'password123',
    isAdmin: false,
    ...userData
  };

  const user = new User(defaultUserData);
  await user.save();
  return user;
};

export const createTestAdmin = async (userData = {}) => {
  return await createTestUser({
    username: 'testadmin',
    password: 'password123',
    isAdmin: true,
    ...userData
  });
};

export const createTestSweet = async (sweetData = {}) => {
  const defaultSweetData = {
    name: 'Test Sweet',
    category: 'Candy',
    price: 5.99,
    quantity: 10,
    ...sweetData
  };

  const sweet = new Sweet(defaultSweetData);
  await sweet.save();
  return sweet;
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

export const createAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const clearDatabase = async () => {
  await User.deleteMany({});
  await Sweet.deleteMany({});
};

export const seedTestData = async () => {
  // Create test admin
  const admin = await createTestAdmin();
  
  // Create test user
  const user = await createTestUser({
    username: 'testuser123'
  });

  // Create test sweets
  const sweets = await Promise.all([
    createTestSweet({ name: 'Chocolate Bar', category: 'Chocolate', price: 2.99, quantity: 50 }),
    createTestSweet({ name: 'Gummy Bears', category: 'Gummy', price: 1.99, quantity: 30 }),
    createTestSweet({ name: 'Lollipop', category: 'Hard Candy', price: 0.99, quantity: 100 }),
  ]);

  return {
    admin,
    user,
    sweets,
    adminToken: generateToken(admin._id),
    userToken: generateToken(user._id)
  };
};