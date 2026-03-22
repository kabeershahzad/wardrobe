const mongoose = require('mongoose');
const Product = require('../models/Product');
const { getGridFSBucket } = require('../config/db');

// @desc    Get all products with filters
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, size, search, sort, featured, newArrival, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (size) query.sizes = { $in: [size] };
    if (search) query.$text = { $search: search };

    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'newest': { createdAt: -1 },
      'rating': { rating: -1 }
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const bucket = getGridFSBucket();
      const imagePromises = req.files.map((file, idx) => {
        return new Promise((resolve, reject) => {
          const uploadStream = bucket.openUploadStream(`product_${Date.now()}_${idx}`, {
            contentType: file.mimetype
          });
          uploadStream.end(file.buffer);
          uploadStream.on('finish', () => {
            resolve({ gridId: uploadStream.id, isPrimary: idx === 0 });
          });
          uploadStream.on('error', reject);
        });
      });
      productData.images = await Promise.all(imagePromises);
    }

    const product = await Product.create(productData);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ error: 'Product already reviewed' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.reviewCount = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview };
