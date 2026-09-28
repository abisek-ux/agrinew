const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    productId: { type: String, required: true },
    farmerId: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

// Compound index to prevent duplicate reviews on the same product from the same order
reviewSchema.index({ orderId: 1, productId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
