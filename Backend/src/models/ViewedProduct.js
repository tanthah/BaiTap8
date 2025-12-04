// Backend/src/models/ViewedProduct.js
const mongoose = require('mongoose');

const viewedProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
  viewCount: {
    type: Number,
    default: 1,
  },
});

// Index để tìm kiếm và sắp xếp
viewedProductSchema.index({ user: 1, viewedAt: -1 });
viewedProductSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('ViewedProduct', viewedProductSchema);