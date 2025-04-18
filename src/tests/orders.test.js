const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { getTestUserToken, createTestProduct } = require('./testUtils');

describe('Order API', () => {
  let customerToken, vendorToken, productId;

  beforeAll(async () => {
    customerToken = await getTestUserToken('customer');
    vendorToken = await getTestUserToken('vendor');
    
    const product = await createTestProduct();
    productId = product._id;
  });

  describe('POST /api/v1/orders', () => {
    it('should create a new order (customer)', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId, quantity: 2 }],
          shippingAddress: '123 Test St',
          paymentMethod: 'credit_card'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.order).toHaveProperty('totalAmount');
    });

    it('should reject insufficient stock', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId, quantity: 100 }], // More than available stock
          shippingAddress: '123 Test St',
          paymentMethod: 'credit_card'
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/v1/orders/my-orders', () => {
    it('should get customer orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders/my-orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get vendor orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders/my-orders')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.statusCode).toEqual(200);
    });
  });
});