const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: ['Fruits & Veggies', 'Dairy', 'Bakery', 'Snacks', 'Household'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      default: '1 pc',
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    },
    description: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    popularityScore: {
      type: Number,
      default: 50,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
