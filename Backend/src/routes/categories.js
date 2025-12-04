const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
} = require('../controllers/categoryController');

/**
 * @route   GET /api/categories
 * @desc    Lấy tất cả danh mục
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   GET /api/categories/:slug
 * @desc    Lấy chi tiết danh mục
 * @access  Public
 */
router.get('/:slug', getCategoryBySlug);

module.exports = router;