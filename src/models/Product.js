const mongoose = require("mongoose");
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price cannot exceed 1,000,000"]
    },
    description: {
      type: String,
      required: [true, "Please enter product description"]
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    category: {
      type: String,
      required: [true, "Please select category"],
      enum: {
        values: [
          "Electronics",
          "Clothing",
          "Home",
          "Books",
          "Food",
          "Other"
        ],
        message: "Please select correct category"
      }
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Prevent vendors from having duplicate product names
productSchema.index({ name: 1, vendor: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);

productSchema.plugin(mongooseAggregatePaginate);