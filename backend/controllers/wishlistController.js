const { Wishlist } = require('../models/WishlistOrder');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items.product', 'name price images category rating');
    if (!wishlist) wishlist = { items: [] };
    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [{ product: productId }] });
      return res.json({ success: true, added: true, message: 'Added to wishlist' });
    }

    const index = wishlist.items.findIndex(item => item.product.toString() === productId);
    if (index > -1) {
      wishlist.items.splice(index, 1);
      await wishlist.save();
      return res.json({ success: true, added: false, message: 'Removed from wishlist' });
    } else {
      wishlist.items.push({ product: productId });
      await wishlist.save();
      return res.json({ success: true, added: true, message: 'Added to wishlist' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getWishlist, toggleWishlist, clearWishlist };
