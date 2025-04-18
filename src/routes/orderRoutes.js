const express = require('express');
const router = express.Router();
const { protect, customerOnly } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: number
 */

router.use(protect);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               shippingAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, cash_on_delivery]
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 */
router.route('/')
  .post(customerOnly, orderController.createOrder);

router
  .route('/my-orders')
  .get(orderController.getMyOrders);

router
  .route('/:id')
  .get(orderController.getOrder);

module.exports = router;