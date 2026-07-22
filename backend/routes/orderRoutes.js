// backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getAnalytics,
    linkGuestOrders
} = require('../controllers/orderController');

const verifyToken = require('../middleware/auth');

// ================= PUBLIC =================

// Guest checkout
router.post('/', createOrder);

// Link previous guest orders after customer registers/logs in
router.post('/link-orders', linkGuestOrders);

// ================= CUSTOMER =================

// Get all orders of a logged-in customer
router.get('/user/:ownerId', getMyOrders);

// Get single order
router.get('/:id', getOrderById);

// ================= ADMIN =================

// Get all orders
router.get('/', verifyToken, getOrders);

// Analytics
router.get('/analytics', verifyToken, getAnalytics);

// Update order status
router.put('/:id/status', verifyToken, updateOrderStatus);

// Update payment status
router.put('/:id/payment', verifyToken, updatePaymentStatus);

module.exports = router;