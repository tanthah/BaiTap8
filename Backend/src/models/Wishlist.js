// Backend/src/models/Wishlist.js
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index để tìm kiếm nhanh
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'products.product': 1 });

// Cập nhật updatedAt trước khi save
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  return;
});

module.exports = mongoose.model('Wishlist', wishlistSchema);