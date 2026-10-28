const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/categories/summary', getCategories);
router.route('/')
  .get(getProducts)
  .post(protect, authorizeRoles('admin'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('admin'), updateProduct)
  .delete(protect, authorizeRoles('admin'), deleteProduct);

module.exports = router;
