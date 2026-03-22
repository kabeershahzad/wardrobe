const express = require('express');
const router = express.Router();
const { getDashboard, getAllUsers, toggleUserStatus, getAllOrders, updateOrderStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
