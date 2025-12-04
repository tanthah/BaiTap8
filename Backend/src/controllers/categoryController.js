const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * @desc   Lấy tất cả danh mục
 * @route  GET /api/categories
 * @access Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    
    // Đếm số sản phẩm trong mỗi danh mục
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category._id,
          isActive: true 
        });
        return {
          ...category,
          productCount,
        };
      })
    );
    
    res.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Lấy chi tiết danh mục
 * @route  GET /api/categories/:slug
 * @access Public
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    
    const productCount = await Product.countDocuments({ 
      category: category._id,
      isActive: true 
    });
    
    res.json({
      success: true,
      data: {
        ...category.toObject(),
        productCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};