const mongoose = require('mongoose');

const tryOnSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userImageGridId: { type: mongoose.Schema.Types.ObjectId },
  userImageBase64: { type: String },
  resultImageGridId: { type: mongoose.Schema.Types.ObjectId },
  resultImageBase64: { type: String },
  resultVideoGridId: { type: mongoose.Schema.Types.ObjectId },
  resultVideoUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingTime: { type: Number },
  aiModel: { type: String, default: 'gemini-2.0-flash-exp' },
  prompt: { type: String },
  errorMessage: { type: String },
  isVideo: { type: Boolean, default: false },
  isFavorited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TryOn', tryOnSchema);
