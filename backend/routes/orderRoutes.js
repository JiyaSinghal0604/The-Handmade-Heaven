// backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAnalytics
} = require('../controllers/orderController');
const verifyToken = require('../middleware/auth');

// Public route for guest checkout
router.post('/', createOrder);

// Protected Admin order management & analytics routes
router.get('/', verifyToken, getOrders);
router.get('/analytics', verifyToken, getAnalytics);
router.put('/:id/status', verifyToken, updateOrderStatus);

module.exports = router;