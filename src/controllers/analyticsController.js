// Required imports
const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const moment = require('moment');

/**
 * @desc    Get revenue analytics (Admin only)
 * @route   GET /api/v1/analytics/revenue
 * @access  Private/Admin
 */
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    // ========================
    // 1. Revenue by Vendor (Last 30 Days)
    // ========================
    const revenueByVendor = await OrderItem.aggregate([
      // Filter orders from last 30 days
      {
        $match: {
          createdAt: { 
            $gte: moment().subtract(30, 'days').toDate() 
          }
        }
      },
      // Group by vendor and calculate totals
      {
        $group: {
          _id: '$vendor',
          totalRevenue: { 
            $sum: { 
              $multiply: ['$priceAtPurchase', '$quantity'] 
            } 
          },
          orderCount: { $sum: 1 }
        }
      },
      // Join with User collection to get vendor details
      {
        $lookup: {
          from: 'users',         // Collection to join
          localField: '_id',    // Field from current collection
          foreignField: '_id',  // Field from users collection
          as: 'vendor'          // Output array field
        }
      },
      // Convert vendor array to object
      { $unwind: '$vendor' },
      // Select only specific fields to return
      {
        $project: {
          'vendor.name': 1,
          'vendor.email': 1,
          totalRevenue: 1,
          orderCount: 1
        }
      },
      // Sort by highest revenue first
      { $sort: { totalRevenue: -1 } }
    ]);

    // ========================
    // 2. Top 5 Products by Sales
    // ========================
    const topProducts = await OrderItem.aggregate([
      // Group by product and sum quantities sold
      {
        $group: {
          _id: '$product',
          totalSold: { $sum: '$quantity' }
        }
      },
      // Sort by most sold first
      { $sort: { totalSold: -1 } },
      // Limit to top 5
      { $limit: 5 },
      // Join with Product collection
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      // Convert product array to object
      { $unwind: '$product' },
      // Select specific fields
      {
        $project: {
          'product.name': 1,
          'product.price': 1,
          totalSold: 1
        }
      }
    ]);

    // ========================
    // 3. Average Order Value
    // ========================
    const orderStats = await Order.aggregate([
      // Group all orders together
      {
        $group: {
          _id: null,
          averageValue: { $avg: '$totalAmount' },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Format the response
    res.status(200).json({
      success: true,
      data: {
        revenueByVendor,
        topProducts,
        averageOrderValue: orderStats[0]?.averageValue || 0,
        totalRevenue: orderStats[0]?.totalRevenue || 0,
        totalOrders: orderStats[0]?.orderCount || 0
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get vendor-specific analytics
 * @route   GET /api/v1/analytics/vendor
 * @access  Private/Vendor
 */
exports.getVendorAnalytics = async (req, res, next) => {
  try {
    const vendorId = mongoose.Types.ObjectId(req.user.id);

    // ========================
    // 1. Daily Sales (Last 7 Days)
    // ========================
    const dailySales = await OrderItem.aggregate([
      // Filter for this vendor and last 7 days
      {
        $match: {
          vendor: vendorId,
          createdAt: { 
            $gte: moment().subtract(7, 'days').startOf('day').toDate() 
          }
        }
      },
      // Group by day and calculate totals
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$createdAt' 
            } 
          },
          totalSales: { 
            $sum: { 
              $multiply: ['$priceAtPurchase', '$quantity'] 
            } 
          },
          orderCount: { $sum: 1 }
        }
      },
      // Sort chronologically
      { $sort: { '_id': 1 } },
      // Format output
      {
        $project: {
          date: '$_id',
          totalSales: 1,
          orderCount: 1,
          _id: 0
        }
      }
    ]);

    // ========================
    // 2. Low Stock Items (< 10 in stock)
    // ========================
    const lowStockItems = await Product.find({
      vendor: req.user.id,
      stock: { $lt: 10 }
    }).select('name price stock');

    res.status(200).json({
      success: true,
      data: {
        dailySales,
        lowStockItems
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get sales trends over time (Admin only)
 * @route   GET /api/v1/analytics/trends
 * @access  Private/Admin
 */
exports.getSalesTrends = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupFormat, subtractAmount;
    
    // Determine date format based on requested period
    switch (period) {
      case 'daily':
        groupFormat = '%Y-%m-%d';
        subtractAmount = 30; // days
        break;
      case 'weekly':
        groupFormat = '%Y-%U'; // Year-WeekNumber
        subtractAmount = 12; // weeks
        break;
      default: // monthly
        groupFormat = '%Y-%m';
        subtractAmount = 12; // months
    }

    const salesTrends = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: moment().subtract(subtractAmount, period === 'weekly' ? 'weeks' : period + 's').toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$createdAt'
            }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      {
        $project: {
          period: '$_id',
          totalSales: 1,
          orderCount: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      period,
      data: salesTrends
    });

  } catch (err) {
    next(err);
  }
};