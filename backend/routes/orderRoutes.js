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
  cancelOrder,
  getAnalytics,
  linkGuestOrders
} = require('../controllers/orderController');

const verifyToken = require('../middleware/auth');

// ================= PUBLIC =================

// Guest checkout
router.post('/', createOrder);

// Link previous guest orders after customer registers/logs in
router.post('/link-orders', linkGuestOrders);


// ================= ADMIN (Static routes MUST come before /:id) =================

// Get all orders
router.get('/', verifyToken, getOrders);

// Analytics
router.get('/analytics', verifyToken, getAnalytics);


// ================= CUSTOMER =================

// Get all orders of a logged-in customer
router.get('/user/:ownerId', getMyOrders);


// ================= DYNAMIC / ID ROUTES =================

// Get single order
router.get('/:id', getOrderById);

// Cancel an order
router.put('/:id/cancel', cancelOrder);

// Update order status (Admin)
router.put('/:id/status', verifyToken, updateOrderStatus);

// Update payment status (Admin)
router.put('/:id/payment', verifyToken, updatePaymentStatus);

module.exports = router;