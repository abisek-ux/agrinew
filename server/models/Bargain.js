const mongoose = require('mongoose');

const bargainSchema = new mongoose.Schema(
  {
    bargainId: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerEmail: { type: String, default: '' },
    farmerPhone: { type: String, default: '' },
    productId: { type: String, required: true },
    productTitle: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'kg' },
    originalPrice: { type: Number, required: true },
    proposedPrice: { type: Number, required: true },
    counterPrice: { type: Number, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'CANCELLED'],
      default: 'PENDING'
    },
    farmerNote: { type: String, default: '' },
    responseHistory: [
      {
        senderRole: { type: String, enum: ['customer', 'farmer'] },
        action: { type: String }, // 'propose', 'accept', 'reject', 'counter'
        proposedPrice: Number,
        counterPrice: Number,
        note: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// High-performance query indexes for bargain negotiation lookups
bargainSchema.index({ customerId: 1, createdAt: -1 });
bargainSchema.index({ farmerId: 1, createdAt: -1 });
bargainSchema.index({ productId: 1, status: 1 });

module.exports = mongoose.models.Bargain || mongoose.model('Bargain', bargainSchema);
