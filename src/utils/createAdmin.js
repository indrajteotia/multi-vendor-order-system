const User = require("../models/User");
const { JWT_SECRET } = process.env;

const createAdmin = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ role: "admin" });
    
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin"
      });
      console.log("✅ Admin user created!");
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};

module.exports = createAdmin;