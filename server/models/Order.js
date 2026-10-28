const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: '1 pc' },
  image: { type: String },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      landmark: { type: String, default: '' },
      pincode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Credit Card', 'Cash on Delivery (COD)'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    paymentDetails: {
      transactionId: { type: String, default: '' },
      upiId: { type: String, default: '' },
      cardLast4: { type: String, default: '' },
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    assignedDeliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    shopName: {
      type: String,
      default: 'FreshCart Central Organic Mart',
    },
    shopAddress: {
      type: String,
      default: 'Shop #14, Sector 4, Koramangala, Bengaluru',
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    packedAt: {
      type: Date,
    },
    outForDeliveryAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
