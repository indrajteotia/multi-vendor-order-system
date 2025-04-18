const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const roleTestRoutes = require("./routes/roleTestRoutes");
const errorHandler = require("./middlewares/errorHandler");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Log API requests
app.use(express.json()); // Parse JSON requests


const authRoutes = require("./routes/authRoutes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", roleTestRoutes);
app.use(errorHandler);
app.use("/api/v1/products", productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Multi-Vendor Order System API");
});

// Export the app
module.exports = app;