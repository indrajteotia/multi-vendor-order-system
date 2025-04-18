const express = require("express");
const router = express.Router();
const {
  protect,
  vendorOnly
} = require("../middlewares/authMiddleware");
const productController = require("../controllers/productController");

// All routes are protected and vendor-only
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - description
 *         - stock
 *         - category
 *       properties:
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         stock:
 *           type: number
 *         category:
 *           type: string
 *           enum: [Electronics, Clothing, Home, Books, Food, Other]
 */

// All routes are protected and vendor-only
router.use(protect);
router.use(vendorOnly);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Not authorized
 */
router.route('/')
  .post(productController.createProduct);

/**
 * @swagger
 * /products/my-products:
 *   get:
 *     summary: Get all products for current vendor
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.route('/my-products')
  .get(productController.getMyProducts);

router
  .route("/:id")
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;