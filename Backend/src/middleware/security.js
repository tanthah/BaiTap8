

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * LAYER 1: INPUT VALIDATION - Sử dụng express-validator
 */

// Validation rules
const authValidationRules = () => {
  return {
    login: [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email không hợp lệ'),
      body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc'),
    ],
    register: [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Họ và tên là bắt buộc')
        .isLength({ min: 2, max: 100 })
        .withMessage('Họ và tên phải từ 2-100 ký tự'),
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email không hợp lệ'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/[A-Z]/)
        .withMessage('Mật khẩu phải chứa ít nhất một chữ hoa')
        .matches(/[0-9]/)
        .withMessage('Mật khẩu phải chứa ít nhất một chữ số'),
    ],
    forgotPassword: [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email không hợp lệ'),
    ],
    resetPassword: [
      body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/[A-Z]/)
        .withMessage('Mật khẩu phải chứa ít nhất một chữ hoa')
        .matches(/[0-9]/)
        .withMessage('Mật khẩu phải chứa ít nhất một chữ số'),
    ],
  };
};

// Middleware kiểm tra validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * LAYER 2: RATE LIMITING
 */

const rateLimit = require('express-rate-limit');

// Rate limiter cho login (5 lần/15 phút)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho register (3 lần/1 giờ)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 giờ',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho forgot password (3 lần/1 giờ)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * LAYER 3: AUTHENTICATION - JWT
 */

const auth = async (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token. Vui lòng đăng nhập',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Lấy user từ database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Lưu user vào req
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
    });
  }
};

/**
 * LAYER 4: AUTHORIZATION - Phân quyền
 */

// Middleware kiểm tra role (USER/ADMIN)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập. Vui lòng đăng nhập',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này',
      });
    }

    next();
  };
};

// Middleware chỉ cho phép user chỉnh sửa tài khoản của chính họ
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập',
    });
  }

  const userId = req.params.id;
  
  if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn chỉ có thể chỉnh sửa tài khoản của chính bạn',
    });
  }

  next();
};

module.exports = {
  authValidationRules,
  handleValidationErrors,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  auth,
  authorize,
  ownerOrAdmin,
};