// Backend/src/controllers/reviewController.js
const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * @desc   Lấy reviews của sản phẩm
 * @route  GET /api/reviews/:productId
 * @access Public
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    // Tính trung bình rating - FIX: Sử dụng product._id thay vì mongoose.Types.ObjectId()
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Đếm số lượng mỗi loại rating (1-5 sao)
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0) {
      stats[0].ratings.forEach(rating => {
        ratingCounts[rating]++;
      });
    }

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats.length > 0 ? {
        avgRating: parseFloat(stats[0].avgRating.toFixed(1)),
        totalReviews: stats[0].totalReviews,
        ratingCounts,
      } : {
        avgRating: 0,
        totalReviews: 0,
        ratingCounts,
      },
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Tạo review mới
 * @route  POST /api/reviews/:productId
 * @access Private
 */
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment, images } = req.body;

    // Kiểm tra product tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi',
      });
    }

    // Tạo review
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
      images: images || [],
    });

    // Cập nhật rating và numReviews của product
    await updateProductRating(productId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Đã tạo đánh giá thành công',
      data: populatedReview,
    });
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Cập nhật review
 * @route  PUT /api/reviews/:reviewId
 * @access Private
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá',
      });
    }

    // Kiểm tra quyền sở hữu
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa đánh giá này',
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    review.updatedAt = Date.now();

    await review.save();

    // Cập nhật rating của product
    await updateProductRating(review.product);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.json({
      success: true,
      message: 'Đã cập nhật đánh giá',
      data: populatedReview,
    });
  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Xóa review
 * @route  DELETE /api/reviews/:reviewId
 * @access Private
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá',
      });
    }

    // Kiểm tra quyền sở hữu
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa đánh giá này',
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Cập nhật rating của product
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Đã xóa đánh giá',
    });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Like/Unlike review
 * @route  POST /api/reviews/:reviewId/like
 * @access Private
 */
exports.toggleLikeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá',
      });
    }

    const likeIndex = review.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      review.likes.splice(likeIndex, 1);
    } else {
      // Like
      review.likes.push(req.user._id);
    }

    await review.save();

    res.json({
      success: true,
      data: {
        liked: likeIndex === -1,
        likesCount: review.likes.length,
      },
    });
  } catch (error) {
    console.error('Error in toggleLikeReview:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function để cập nhật rating của product
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avgRating.toFixed(1)),
      numReviews: reviews.length,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
  }
};