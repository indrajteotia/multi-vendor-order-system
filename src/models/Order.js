const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'cash_on_delivery'],
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate - get all items in this order
OrderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order'
});

module.exports = mongoose.model('Order', OrderSchema);

OrderSchema.plugin(mongooseAggregatePaginate);