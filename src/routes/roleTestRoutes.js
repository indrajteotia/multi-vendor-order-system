const express = require("express");
const router = express.Router();
const {
  protect,
  customerOnly,
  vendorOnly,
  adminOnly
} = require("../middlewares/authMiddleware");

// Public route - no auth needed
router.get("/public", (req, res) => {
  res.json({ message: "This is public data" });
});

// Protected but any logged-in user can access
router.get("/protected", protect, (req, res) => {
  res.json({ 
    message: "You're authenticated!",
    user: req.user 
  });
});

// Customer-only route
router.get("/customer", protect, customerOnly, (req, res) => {
  res.json({ 
    message: "Welcome customer!",
    user: req.user 
  });
});

// Vendor-only route
router.get("/vendor", protect, vendorOnly, (req, res) => {
  res.json({ 
    message: "Welcome vendor!",
    user: req.user 
  });
});

// Admin-only route
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ 
    message: "Welcome admin!",
    user: req.user 
  });
});

module.exports = router;