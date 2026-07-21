// backend/routes/reviewRoutes.js

const express = require('express');
const router = express.Router();
const { getProductReviews, addReview } = require('../controllers/reviewController');

// Public routes for product reviews
router.get('/:productId', getProductReviews);
router.post('/', addReview);

module.exports = router;