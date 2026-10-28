const Product = require('../models/Product');

// @desc    Fetch all products with filtering, search & sorting
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, keyword, sort } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Keyword search (name or description)
    if (keyword && keyword.trim()) {
      query.$or = [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'popularity') {
      sortOption = { popularityScore: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const products = await Product.find(query).sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, category, price, discountPrice, stock, unit, image, description } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, category, price, and stock quantity',
      });
    }

    const product = new Product({
      name,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: Number(stock),
      unit: unit || '1 pc',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      description: description || '',
      isAvailable: Number(stock) > 0,
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, category, price, discountPrice, stock, unit, image, description, isAvailable } = req.body;

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (stock !== undefined) {
      product.stock = Number(stock);
      product.isAvailable = Number(stock) > 0;
    }
    if (unit !== undefined) product.unit = unit;
    if (image !== undefined) product.image = image;
    if (description !== undefined) product.description = description;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    const updatedProduct = await product.save();
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product category statistics
// @route   GET /api/products/categories/summary
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = ['Fruits & Veggies', 'Dairy', 'Bakery', 'Snacks', 'Household'];
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const summary = categories.map((cat) => {
      const match = counts.find((c) => c._id === cat);
      return {
        name: cat,
        count: match ? match.count : 0,
      };
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
