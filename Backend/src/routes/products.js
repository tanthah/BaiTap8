const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Featured products
router.get('/featured', productController.getFeaturedProducts);

// Similar products - THÊM MỚI
router.get('/:id/similar', productController.getSimilarProducts);

// Product stats - THÊM MỚI
router.get('/:id/stats', productController.getProductStats);

// Products by category
router.get('/category/:categorySlug', productController.getProductsByCategory);

// All products
router.get('/', productController.getProducts);

// Product by ID
router.get('/:id', productController.getProductById);

module.exports = router;