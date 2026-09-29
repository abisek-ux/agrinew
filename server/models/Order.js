const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    customerLocation: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
      address: { type: String, default: '' }
    },
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String, default: '' },
    farmerEmail: { type: String, default: '' },
    farmerLocation: {
      lat: { type: Number, default: 12.5222 },
      lng: { type: Number, default: 76.9004 },
      address: { type: String, default: '' }
    },
    deliveryId: { type: String, default: null },
    deliveryName: { type: String, default: 'Unassigned' },
    deliveryPhone: { type: String, default: '' },
    deliveryEmail: { type: String, default: '' },
    deliveryLocation: {
      lat: { type: Number, default: 12.2958 },
      lng: { type: Number, default: 76.6394 },
      address: { type: String, default: 'En Route' }
    },
    items: [
      {
        productId: String,
        title: String,
        price: Number,
        quantity: Number,
        unit: String,
        image: String
      }
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'accepted', 'packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'arrived', 'delivered', 'cancelled'],
      default: 'pending'
    },
    deliveryOtpHash: { type: String, default: null },
    deliveryOtpExpiresAt: { type: Date, default: null },
    deliveryOtpAttempts: { type: Number, default: 0 },
    deliveryOtpLastSentAt: { type: Date, default: null },
    deliveryOtpVerifiedAt: { type: Date, default: null },
    dispatchSignaledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);