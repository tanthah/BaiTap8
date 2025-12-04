// Backend/src/controllers/viewedProductController.js
const ViewedProduct = require('../models/ViewedProduct');
const Product = require('../models/Product');

/**
 * @desc   Thêm sản phẩm đã xem
 * @route  POST /api/viewed-products/:productId
 * @access Private
 */
exports.addViewedProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra product tồn tại
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    // Tìm hoặc tạo viewed product
    let viewedProduct = await ViewedProduct.findOne({
      user: req.user._id,
      product: productId,
    });

    if (viewedProduct) {
      // Cập nhật thời gian xem và tăng viewCount
      viewedProduct.viewedAt = Date.now();
      viewedProduct.viewCount += 1;
      await viewedProduct.save();
    } else {
      // Tạo mới
      viewedProduct = await ViewedProduct.create({
        user: req.user._id,
        product: productId,
      });
    }

    res.json({
      success: true,
      message: 'Đã lưu lịch sử xem sản phẩm',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Lấy danh sách sản phẩm đã xem
 * @route  GET /api/viewed-products
 * @access Private
 */
exports.getViewedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const viewedProducts = await ViewedProduct.find({ user: req.user._id })
      .populate({
        path: 'product',
        select: 'name slug price originalPrice discount mainImage stock isActive category rating numReviews',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .sort({ viewedAt: -1 })
      .limit(limit);

    // Lọc các sản phẩm không còn active
    const filteredProducts = viewedProducts.filter(item => 
      item.product && item.product.isActive
    );

    res.json({
      success: true,
      data: filteredProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Xóa sản phẩm khỏi lịch sử xem
 * @route  DELETE /api/viewed-products/:productId
 * @access Private
 */
exports.removeViewedProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    await ViewedProduct.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    res.json({
      success: true,
      message: 'Đã xóa khỏi lịch sử xem',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Xóa toàn bộ lịch sử xem
 * @route  DELETE /api/viewed-products
 * @access Private
 */
exports.clearViewedProducts = async (req, res) => {
  try {
    await ViewedProduct.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'Đã xóa toàn bộ lịch sử xem',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};