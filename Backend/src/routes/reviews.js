// Backend/src/routes/reviews.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/security');
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleLikeReview,
} = require('../controllers/reviewController');

router.get('/:productId', getProductReviews);
router.post('/:productId', auth, createReview);
router.put('/:reviewId', auth, updateReview);
router.delete('/:reviewId', auth, deleteReview);
router.post('/:reviewId/like', auth, toggleLikeReview);

module.exports = router;