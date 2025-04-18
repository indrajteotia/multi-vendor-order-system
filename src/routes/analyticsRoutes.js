const express = require('express');
const router = express.Router();
const { protect, adminOnly, vendorOnly } = require('../middlewares/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.use(protect);

// Admin analytics
router.get('/revenue', adminOnly, analyticsController.getRevenueAnalytics);

// Vendor analytics
router.get('/vendor', vendorOnly, analyticsController.getVendorAnalytics);

module.exports = router;