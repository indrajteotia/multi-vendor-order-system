const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = process.env;

// Protect routes - user must be logged in
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Not authorized to access this route" 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password");
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ 
      success: false,
      message: "Not authorized, token failed" 
    });
  }
};

// Role-based authorization (admin, vendor, customer)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Role-specific middleware (for cleaner route definitions)
exports.customerOnly = this.authorize('customer');
exports.vendorOnly = this.authorize('vendor');
exports.adminOnly = this.authorize('admin');