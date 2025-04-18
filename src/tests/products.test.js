const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const { getTestUserToken, createTestProduct } = require('./testUtils');

describe('Product API', () => {
  let vendorToken;

  beforeAll(async () => {
    vendorToken = await getTestUserToken('vendor');
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product (vendor)', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'New Product',
          price: 49.99,
          description: 'Test description',
          stock: 10,
          category: 'Electronics'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('name', 'New Product');
    });

    it('should reject product creation (customer)', async () => {
      const customerToken = await getTestUserToken('customer');

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Customer Product',
          price: 19.99,
          description: 'Should fail',
          stock: 5,
          category: 'Home'
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/v1/products/my-products', () => {
    it('should get vendor products', async () => {
      await createTestProduct();

      const res = await request(app)
        .get('/api/v1/products/my-products')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});