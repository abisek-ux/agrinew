const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    name: {
      type: String,
      default: function () {
        return `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'User';
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'farmer', 'delivery', 'CUSTOMER', 'FARMER', 'DELIVERY'],
      default: 'customer',
      set: (v) => (v ? v.toLowerCase() : 'customer'),
    },
    nativePlace: {
      type: String,
      default: 'Bengaluru, Karnataka',
      trim: true,
    },
    location: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
      address: { type: String, default: 'Bengaluru, Karnataka, India' },
      placeName: { type: String, default: 'Bengaluru, Karnataka' }
    },
    wishlist: [{ type: String }],
    farmName: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    isVerified: { type: Boolean, default: false },

    // Password Reset & OTP Fields
    resetOtpHash: { type: String, default: null },
    resetOtpExpiresAt: { type: Date, default: null },
    resetOtpAttempts: { type: Number, default: 0 },
    resetOtpLastSentAt: { type: Date, default: null },
    resetOtpRequestWindowStartedAt: { type: Date, default: null },
    resetOtpRequestCount: { type: Number, default: 0 },

    // Supabase / Email OTP legacy fields
    emailOtpHash: { type: String, default: null },
    emailOtpExpiresAt: { type: Date, default: null },
    emailOtpAttempts: { type: Number, default: 0 },
    resetTokenHash: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
    resetTokenVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: ensure password is always securely hashed if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);