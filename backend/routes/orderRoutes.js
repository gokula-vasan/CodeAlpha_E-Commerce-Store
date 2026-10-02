const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const {
    addOrderItems,
    getOrders,
    getMyOrders,
    updateOrderToDelivered
} = require('../controllers/orderController');

// User: Create order
// Admin: Get all orders
router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

// User: Get my orders
router.route('/myorders').get(protect, getMyOrders);

// Admin: Mark order as delivered
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

module.exports = router;