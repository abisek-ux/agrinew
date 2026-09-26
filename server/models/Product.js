const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ['seed', 'fruit', 'vegetable'], required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    stock: { type: Number, default: 100 },
    description: { type: String, default: '' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b' },
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String, default: '' },
    farmerEmail: { type: String, default: '' },
    farmerNative: { type: String, default: '' },
    location: {
      lat: { type: Number, default: 12.5222 },
      lng: { type: Number, default: 76.9004 },
      address: { type: String, default: 'Mandya Organic Farm, Karnataka, India' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);