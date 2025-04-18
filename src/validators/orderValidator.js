const Joi = require('joi');

exports.createOrderValidator = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.string().required(),
  paymentMethod: Joi.string().valid('credit_card', 'paypal', 'cash_on_delivery').required()
});