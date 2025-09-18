import User from '../models/User.models.js';
import Sweet from '../models/Sweet.models.js';
import { createTestUser, createTestSweet, clearDatabase } from './helpers.js';

describe('User Model', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.isAdmin).toBe(false); // Default value
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should not create user without username', async () => {
      const user = new User({ password: 'password123' });
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create user without password', async () => {
      const user = new User({ username: 'testuser' });
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create user with duplicate username', async () => {
      await createTestUser({ username: 'duplicate' });
      
      const duplicateUser = new User({
        username: 'duplicate',
        password: 'password123'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('Password Methods', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = new User({
        username: 'testuser',
        password: plainPassword
      });

      await user.save();

      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(plainPassword.length);
    });

    it('should match correct password', async () => {
      const plainPassword = 'password123';
      const user = await createTestUser({ username: 'passwordtest1', password: plainPassword });

      const isMatch = await user.matchPassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should not match incorrect password', async () => {
      const user = await createTestUser({ username: 'passwordtest2', password: 'password123' });

      const isMatch = await user.matchPassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Admin User', () => {
    it('should create admin user', async () => {
      const adminData = {
        username: 'admin',
        password: 'password123',
        isAdmin: true
      };

      const admin = new User(adminData);
      const savedAdmin = await admin.save();

      expect(savedAdmin.isAdmin).toBe(true);
    });
  });
});

describe('Sweet Model', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Sweet Creation', () => {
    it('should create a sweet with valid data', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Candy',
        price: 5.99,
        quantity: 10
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      expect(savedSweet._id).toBeDefined();
      expect(savedSweet.name).toBe(sweetData.name);
      expect(savedSweet.category).toBe(sweetData.category);
      expect(savedSweet.price).toBe(sweetData.price);
      expect(savedSweet.quantity).toBe(sweetData.quantity);
      expect(savedSweet.createdAt).toBeDefined();
      expect(savedSweet.updatedAt).toBeDefined();
    });

    it('should not create sweet without name', async () => {
      const sweet = new Sweet({
        category: 'Candy',
        price: 5.99,
        quantity: 10
      });
      
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should not create sweet without category', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        price: 5.99,
        quantity: 10
      });
      
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should not create sweet without price', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Candy',
        quantity: 10
      });
      
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should not create sweet with negative price', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Candy',
        price: -5.99,
        quantity: 10
      });
      
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should not create sweet with negative quantity', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Candy',
        price: 5.99,
        quantity: -10
      });
      
      await expect(sweet.save()).rejects.toThrow();
    });
  });

  describe('Sweet Updates', () => {
    it('should update sweet properties', async () => {
      const sweet = await createTestSweet();
      
      sweet.name = 'Updated Sweet Name';
      sweet.price = 9.99;
      sweet.quantity = 50;

      const updatedSweet = await sweet.save();

      expect(updatedSweet.name).toBe('Updated Sweet Name');
      expect(updatedSweet.price).toBe(9.99);
      expect(updatedSweet.quantity).toBe(50);
      expect(updatedSweet.updatedAt).not.toBe(updatedSweet.createdAt);
    });

    it('should maintain validation on updates', async () => {
      const sweet = await createTestSweet();
      
      sweet.price = -10;

      await expect(sweet.save()).rejects.toThrow();
    });
  });

  describe('Sweet Queries', () => {
    beforeEach(async () => {
      await createTestSweet({ name: 'Chocolate Bar', category: 'Chocolate', price: 2.99 });
      await createTestSweet({ name: 'Gummy Bears', category: 'Gummy', price: 1.99 });
      await createTestSweet({ name: 'Lollipop', category: 'Hard Candy', price: 0.99 });
    });

    it('should find sweets by name regex', async () => {
      const chocolateSweets = await Sweet.find({ 
        name: { $regex: 'chocolate', $options: 'i' } 
      });

      expect(chocolateSweets.length).toBe(1);
      expect(chocolateSweets[0].name).toBe('Chocolate Bar');
    });

    it('should find sweets by category regex', async () => {
      const gummySweets = await Sweet.find({ 
        category: { $regex: 'gummy', $options: 'i' } 
      });

      expect(gummySweets.length).toBe(1);
      expect(gummySweets[0].category).toBe('Gummy');
    });

    it('should find sweets by price range', async () => {
      const affordableSweets = await Sweet.find({ 
        price: { $gte: 1, $lte: 3 } 
      });

      expect(affordableSweets.length).toBe(2);
      affordableSweets.forEach(sweet => {
        expect(sweet.price).toBeGreaterThanOrEqual(1);
        expect(sweet.price).toBeLessThanOrEqual(3);
      });
    });
  });
});