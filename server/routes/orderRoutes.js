const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorizeRoles('customer'), createOrder)
  .get(protect, authorizeRoles('admin', 'delivery'), getAllOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.put('/:id/status', protect, authorizeRoles('admin', 'delivery'), updateOrderStatus);

module.exports = router;
