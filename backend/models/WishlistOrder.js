const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    size: String,
    color: String,
    quantity: { type: Number, default: 1 },
    image: String
  }],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    country: String,
    postalCode: String,
    phone: String
  },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  subtotal: Number,
  shippingCost: { type: Number, default: 0 },
  total: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'WX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = { Wishlist, Order };
