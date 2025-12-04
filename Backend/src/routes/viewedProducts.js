// Backend/src/routes/viewedProducts.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/security');
const {
  addViewedProduct,
  getViewedProducts,
  removeViewedProduct,
  clearViewedProducts,
} = require('../controllers/viewedProductController');

router.post('/:productId', auth, addViewedProduct);
router.get('/', auth, getViewedProducts);
router.delete('/:productId', auth, removeViewedProduct);
router.delete('/', auth, clearViewedProducts);

module.exports = router;
