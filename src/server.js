const app = require('./app');
const connectDB = require('./config/db');
const createAdmin = require('./utils/createAdmin');
const swaggerDocs = require('./config/swagger');
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create admin if doesn't exist
createAdmin();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  swaggerDocs(app, PORT); // Initialize Swagger
});