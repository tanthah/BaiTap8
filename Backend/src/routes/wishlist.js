// Backend/src/routes/wishlist.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/security');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkInWishlist,
} = require('../controllers/wishlistController');

router.get('/', auth, getWishlist);
router.post('/:productId', auth, addToWishlist);
router.delete('/:productId', auth, removeFromWishlist);
router.delete('/', auth, clearWishlist);
router.get('/check/:productId', auth, checkInWishlist);

module.exports = router;