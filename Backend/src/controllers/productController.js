const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const mongoose = require('mongoose');

class ProductController {

  /** ------------------------------
   *  GET ALL PRODUCTS
   *  GET /api/products
   --------------------------------*/
  async getProducts(req, res) {
    try {
      const products = await Product.find()
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: products });

    } catch (error) {
      console.error("❌ Error in getProducts:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }


  /** ------------------------------
   *  GET FEATURED PRODUCTS
   *  GET /api/products/featured
   --------------------------------*/
  async getFeaturedProducts(req, res) {
    try {
      const products = await Product.find({ isFeatured: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort({ rating: -1 });

      res.json({ success: true, data: products });

    } catch (error) {
      console.error("❌ Error in getFeaturedProducts:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }


  /** ------------------------------
   *  GET PRODUCTS BY CATEGORY SLUG
   *  GET /api/products/category/:slug
   --------------------------------*/
  async getProductsByCategory(req, res) {
    try {
      const { categorySlug } = req.params;

      const category = await Category.findOne({ slug: categorySlug });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      const products = await Product.find({ category: category._id })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: products });

    } catch (error) {
      console.error("❌ Error in getProductsByCategory:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }


  /** ------------------------------
   *  GET PRODUCT BY ID + STATS
   *  GET /api/products/:id
   --------------------------------*/
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id)
        .populate('category', 'name slug description');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }

      const buyersCount = product.sold;
      const reviewsCount = await Review.countDocuments({ product: product._id });

      // FIXED: Không ép kiểu ObjectId
      const stats = await Review.aggregate([
        { $match: { product: product._id } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      const ratingStats =
        stats.length > 0
          ? {
              avgRating: parseFloat(stats[0].avgRating.toFixed(1)),
              totalReviews: stats[0].totalReviews,
            }
          : { avgRating: 0, totalReviews: 0 };

      res.json({
        success: true,
        data: {
          ...product.toObject(),
          buyersCount,
          reviewsCount,
          ratingStats,
        },
      });

    } catch (error) {
      console.error("❌ Error in getProductById:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }


  /** ------------------------------
   *  GET SIMILAR PRODUCTS
   *  GET /api/products/:id/similar
   --------------------------------*/
  async getSimilarProducts(req, res) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 8;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }

      const priceRange = {
        min: product.price * 0.7,
        max: product.price * 1.3,
      };

      const similar = await Product.find({
        _id: { $ne: id },
        category: product.category,
        price: { $gte: priceRange.min, $lte: priceRange.max },
        isActive: true,
      })
        .populate("category", "name slug")
        .sort({ rating: -1, sold: -1 })
        .limit(limit)
        .lean();

      let result = [...similar];

      // Nếu còn thiếu → lấy thêm sản phẩm liên quan cùng category
      if (result.length < limit) {
        const additional = await Product.find({
          _id: { $ne: id, $nin: result.map((p) => p._id) },
          category: product.category,
          isActive: true,
        })
          .populate("category", "name slug")
          .sort({ rating: -1, sold: -1 })
          .limit(limit - result.length)
          .lean();

        result.push(...additional);
      }

      res.json({ success: true, data: result });

    } catch (error) {
      console.error("❌ Error in getSimilarProducts:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }


  /** ------------------------------
   *  GET PRODUCT STATISTICS
   *  GET /api/products/:id/stats
   --------------------------------*/
  async getProductStats(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }

      const buyersCount = product.sold;
      const reviewsCount = await Review.countDocuments({ product: id });

      const stats = await Review.aggregate([
        { $match: { product: product._id } }, // FIXED
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            ratings: { $push: "$rating" },
          },
        },
      ]);

      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      if (stats.length > 0) {
        stats[0].ratings.forEach((r) => (ratingCounts[r] += 1));
      }

      res.json({
        success: true,
        data: {
          productId: id,
          buyersCount,
          reviewsCount,
          avgRating:
            stats.length > 0
              ? parseFloat(stats[0].avgRating.toFixed(1))
              : 0,
          ratingCounts,
        },
      });

    } catch (error) {
      console.error("❌ Error in getProductStats:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProductController();
