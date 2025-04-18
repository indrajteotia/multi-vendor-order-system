const Product = require("../models/Product");
const ErrorResponse = require("../utils/errorResponse");
const {
  createProductValidator,
  updateProductValidator
} = require("../validators/productValidator");

// @desc    Create new product
// @route   POST /api/v1/products
exports.createProduct = async (req, res, next) => {
  try {
    // Add vendor to product data
    req.body.vendor = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all products for current vendor
// @route   GET /api/v1/products/my-products
exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.user.id });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure vendor owns the product
    if (product.vendor.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this product`,
          401
        )
      );
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure vendor owns the product
    if (product.vendor.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this product`,
          401
        )
      );
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};