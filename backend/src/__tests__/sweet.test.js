import request from 'supertest';
import app from '../test-app.js';
import { createTestUser, createTestAdmin, createTestSweet, generateToken, seedTestData, clearDatabase } from './helpers.js';

describe('Sweet Routes', () => {
  let adminToken, userToken, admin, user;

  beforeEach(async () => {
    await clearDatabase();
    const testData = await seedTestData();
    admin = testData.admin;
    user = testData.user;
    adminToken = testData.adminToken;
    userToken = testData.userToken;
  });

  describe('GET /api/sweets', () => {
    it('should get all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const sweet = response.body[0];
      expect(sweet).toHaveProperty('name');
      expect(sweet).toHaveProperty('category');
      expect(sweet).toHaveProperty('price');
      expect(sweet).toHaveProperty('quantity');
    });

    it('should return empty array when no sweets exist', async () => {
      await clearDatabase();
      
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=chocolate')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      response.body.forEach(sweet => {
        expect(sweet.name.toLowerCase()).toContain('chocolate');
      });
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=gummy')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      response.body.forEach(sweet => {
        expect(sweet.category.toLowerCase()).toContain('gummy');
      });
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=1&maxPrice=3')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      response.body.forEach(sweet => {
        expect(sweet.price).toBeGreaterThanOrEqual(1);
        expect(sweet.price).toBeLessThanOrEqual(3);
      });
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=nonexistentsweet')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/sweets', () => {
    it('should allow admin to add new sweet', async () => {
      const sweetData = {
        name: 'New Sweet',
        category: 'Candy',
        price: 4.99,
        quantity: 25
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Cookie', `jwt=${adminToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body).toHaveProperty('name', sweetData.name);
      expect(response.body).toHaveProperty('category', sweetData.category);
      expect(response.body).toHaveProperty('price', sweetData.price);
      expect(response.body).toHaveProperty('quantity', sweetData.quantity);
      expect(response.body).toHaveProperty('_id');
    });

    it('should not allow regular user to add sweet', async () => {
      const sweetData = {
        name: 'New Sweet',
        category: 'Candy',
        price: 4.99,
        quantity: 25
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Cookie', `jwt=${userToken}`)
        .send(sweetData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    it('should not allow unauthenticated user to add sweet', async () => {
      const sweetData = {
        name: 'New Sweet',
        category: 'Candy',
        price: 4.99,
        quantity: 25
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should not add sweet with duplicate name', async () => {
      const sweetData = {
        name: 'Chocolate Bar', // This already exists from seeded data
        category: 'Candy',
        price: 4.99,
        quantity: 25
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Cookie', `jwt=${adminToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Sweet with this name already exists');
    });

    it('should not add sweet with missing required fields', async () => {
      const sweetData = {
        name: 'Incomplete Sweet'
        // Missing category, price, quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Cookie', `jwt=${adminToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await createTestSweet({ name: 'Update Test Sweet' });
    });

    it('should allow admin to update sweet', async () => {
      const updateData = {
        name: 'Updated Sweet Name',
        category: 'Updated Category',
        price: 9.99,
        quantity: 50
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Cookie', `jwt=${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('category', updateData.category);
      expect(response.body).toHaveProperty('price', updateData.price);
      expect(response.body).toHaveProperty('quantity', updateData.quantity);
    });

    it('should not allow regular user to update sweet', async () => {
      const updateData = {
        name: 'Updated Sweet Name',
        price: 9.99
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Cookie', `jwt=${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Cookie', `jwt=${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Sweet not found');
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await createTestSweet({ name: 'Delete Test Sweet' });
    });

    it('should allow admin to delete sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .set('Cookie', `jwt=${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Sweet removed');

      // Verify sweet is actually deleted
      const getResponse = await request(app)
        .get('/api/sweets')
        .expect(200);

      const deletedSweet = getResponse.body.find(s => s._id === testSweet._id.toString());
      expect(deletedSweet).toBeUndefined();
    });

    it('should not allow regular user to delete sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set('Cookie', `jwt=${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Sweet not found');
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await createTestSweet({ name: 'Restock Test Sweet', quantity: 5 });
    });

    it('should allow admin to restock sweet', async () => {
      const restockData = { quantity: 20 };

      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Cookie', `jwt=${adminToken}`)
        .send(restockData)
        .expect(200);

      expect(response.body).toHaveProperty('quantity', 25); // 5 + 20
    });

    it('should not allow regular user to restock sweet', async () => {
      const restockData = { quantity: 20 };

      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Cookie', `jwt=${userToken}`)
        .send(restockData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    it('should not allow negative restock quantity', async () => {
      const restockData = { quantity: -5 };

      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Cookie', `jwt=${adminToken}`)
        .send(restockData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});