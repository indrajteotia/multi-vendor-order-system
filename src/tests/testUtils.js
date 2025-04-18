const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Create test user and get auth token
exports.getTestUserToken = async (role = 'customer') => {
  const user = await User.create({
    name: 'Test User',
    email: `test-${role}@example.com`,
    password: 'password123',
    role
  });

  return jwt.sign({ id: user._id, role }, JWT_SECRET, {
    expiresIn: '1h'
  });
};

// Create test product
exports.createTestProduct = async (vendorId) => {
  return await Product.create({
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
    stock: 10,
    category: 'Electronics',
    vendor: vendorId
  });
};