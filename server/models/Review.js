const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewType: { type: String, enum: ['product', 'delivery'], default: 'product' },
    orderId: { type: String, required: true },
    productId: { type: String, default: null },
    productTitle: { type: String, default: '' },
    farmerId: { type: String, default: null },
    deliveryId: { type: String, default: null },
    deliveryName: { type: String, default: '' },
    customerId: { type: String, required: true },
    customerName: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

// Compound indexes to prevent duplicate reviews on the same product or delivery partner from the same order
reviewSchema.index({ orderId: 1, productId: 1, customerId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ orderId: 1, deliveryId: 1, customerId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ farmerId: 1, createdAt: -1 });
reviewSchema.index({ deliveryId: 1, createdAt: -1 });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
