// Backend/src/controllers/wishlistController.js
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @desc   Lấy wishlist của user
 * @route  GET /api/wishlist
 * @access Private
 */
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name slug price originalPrice discount mainImage stock isActive category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Lọc các sản phẩm không còn active
    wishlist.products = wishlist.products.filter(item => 
      item.product && item.product.isActive
    );

    res.json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Thêm sản phẩm vào wishlist
 * @route  POST /api/wishlist/:productId
 * @access Private
 */
exports.addToWishlist = async (req, res) => {
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

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [{ product: productId }],
      });
    } else {
      // Kiểm tra đã có trong wishlist chưa
      const exists = wishlist.products.some(
        item => item.product.toString() === productId
      );

      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Sản phẩm đã có trong danh sách yêu thích',
        });
      }

      wishlist.products.unshift({ product: productId });
      await wishlist.save();
    }

    // Populate để trả về thông tin product
    wishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'products.product',
        select: 'name slug price originalPrice discount mainImage stock isActive category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Xóa sản phẩm khỏi wishlist
 * @route  DELETE /api/wishlist/:productId
 * @access Private
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh sách yêu thích',
      });
    }

    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích',
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Xóa toàn bộ wishlist
 * @route  DELETE /api/wishlist
 * @access Private
 */
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh sách yêu thích',
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Đã xóa toàn bộ danh sách yêu thích',
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Kiểm tra product có trong wishlist không
 * @route  GET /api/wishlist/check/:productId
 * @access Private
 */
exports.checkInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const isInWishlist = wishlist?.products.some(
      item => item.product.toString() === productId
    ) || false;

    res.json({
      success: true,
      data: { isInWishlist },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};