const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Customer
exports.createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // 1. Validate input
    if (!items || !Array.isArray(items)) {
      throw new ErrorResponse('Invalid order items', 400);
    }

    if (items.length === 0) {
      throw new ErrorResponse('No items in order', 400);
    }

    // 2. Calculate total and group by vendor
    let totalAmount = 0;
    const vendorItemsMap = new Map(); // vendorId -> items

    // Check product availability and calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        throw new ErrorResponse(`Product not found: ${item.productId}`, 404);
      }

      if (product.stock < item.quantity) {
        throw new ErrorResponse(
          `Insufficient stock for product: ${product.name}. Available: ${product.stock}`,
          400
        );
      }

      // Add to vendor grouping
      if (!vendorItemsMap.has(product.vendor.toString())) {
        vendorItemsMap.set(product.vendor.toString(), []);
      }
      vendorItemsMap.get(product.vendor.toString()).push({
        product,
        quantity: item.quantity
      });

      // Calculate total
      totalAmount += product.price * item.quantity;
    }

    // 3. Create master order
    const order = await Order.create([{
      user: userId,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending'
    }], { session });

    if (!order || order.length === 0) {
      throw new ErrorResponse('Order creation failed', 500);
    }

    // 4. Create order items and update stock
    const orderItems = [];
    for (const [vendorId, vendorItems] of vendorItemsMap) {
      for (const vendorItem of vendorItems) {
        // Create order item
        const orderItem = await OrderItem.create([{
          order: order[0]._id,
          product: vendorItem.product._id,
          vendor: vendorId,
          quantity: vendorItem.quantity,
          priceAtPurchase: vendorItem.product.price,
          status: 'pending'
        }], { session });

        orderItems.push(orderItem[0]);

        // Update product stock
        await Product.findByIdAndUpdate(
          vendorItem.product._id,
          { $inc: { stock: -vendorItem.quantity } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        order: order[0],
        items: orderItems
      }
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @desc    Get my orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'customer') {
      query = Order.find({ user: req.user.id });
    } else if (req.user.role === 'vendor') {
      query = OrderItem.find({ vendor: req.user.id }).distinct('order');
    } else {
      return next(new ErrorResponse('Not authorized', 401));
    }

    const orders = await query.populate({
      path: 'items',
      populate: {
        path: 'product',
        select: 'name price'
      }
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    let order;
    if (req.user.role === 'customer') {
      order = await Order.findOne({
        _id: req.params.id,
        user: req.user.id
      }).populate({
        path: 'items',
        populate: [
          { path: 'product', select: 'name price' },
          { path: 'vendor', select: 'name email' }
        ]
      });
    } else if (req.user.role === 'vendor') {
      const orderItems = await OrderItem.find({
        order: req.params.id,
        vendor: req.user.id
      }).populate('product', 'name price');

      if (!orderItems || orderItems.length === 0) {
        return next(new ErrorResponse('Order not found', 404));
      }

      order = await Order.findById(req.params.id);
      order.items = orderItems;
    } else {
      order = await Order.findById(req.params.id).populate({
        path: 'items',
        populate: [
          { path: 'product', select: 'name price' },
          { path: 'vendor', select: 'name email' }
        ]
      });
    }

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};