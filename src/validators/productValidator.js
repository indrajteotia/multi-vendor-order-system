const Joi = require("joi");

// Validation for creating a product
exports.createProductValidator = Joi.object({
  name: Joi.string().required().max(100),
  price: Joi.number().required().min(0).max(1000000),
  description: Joi.string().required(),
  stock: Joi.number().required().min(0),
  category: Joi.string().valid(
    "Electronics",
    "Clothing",
    "Home",
    "Books",
    "Food",
    "Other"
  ).required()
});

// Validation for updating a product
exports.updateProductValidator = Joi.object({
  name: Joi.string().max(100),
  price: Joi.number().min(0).max(1000000),
  description: Joi.string(),
  stock: Joi.number().min(0),
  category: Joi.string().valid(
    "Electronics",
    "Clothing",
    "Home",
    "Books",
    "Food",
    "Other"
  )
});