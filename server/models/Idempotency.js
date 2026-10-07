const mongoose = require('mongoose');

const idempotencySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    endpoint: { type: String, required: true, trim: true },
    statusCode: { type: Number, required: true },
    responseBody: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24-hour retention
    }
  },
  { timestamps: true }
);

// Unique compound index: same user + same key = identical operation
idempotencySchema.index({ key: 1, userId: 1 }, { unique: true });
idempotencySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.Idempotency || mongoose.model('Idempotency', idempotencySchema);
