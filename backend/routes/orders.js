const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Order } = require('../models/WishlistOrder');

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingCost, total, notes } = req.body;
    const order = await Order.create({
      user: req.user._id,
      items, shippingAddress, paymentMethod,
      subtotal, shippingCost, total, notes
    });
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
