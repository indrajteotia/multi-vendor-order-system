const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define user roles
const roles = ["customer", "vendor", "admin"];

// User Schema (database structure)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true, // Removes extra spaces
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries
    },
    role: {
      type: String,
      enum: roles, // Only allow these values
      default: "customer",
    },
  },
  { timestamps: true } // Adds createdAt/updatedAt fields
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  // Hash password with bcrypt (10 = salt rounds)
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare entered password with database hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);