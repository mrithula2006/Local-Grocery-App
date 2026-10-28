const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Product = require('./models/Product');
const seedDB = require('./seeds/seedData');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auto-seed if database is empty on start
const checkAndSeed = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database appears empty. Seeding initial catalog and demo users...');
      await seedDB();
    }
  } catch (err) {
    console.error('Error during auto-seed check:', err.message);
  }
};
checkAndSeed();

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Grocery Delivery App API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Seed endpoint for quick UI reset
app.post('/api/seed', async (req, res) => {
  try {
    await seedDB();
    res.json({ success: true, message: 'Database reseeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled error: ${err.message}`);
});
