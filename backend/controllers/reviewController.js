// backend/controllers/reviewController.js

const Review = require('../models/Review');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to fetch reviews', error: error.message });
    }
};

// @desc    Add a review for a product
// @route   POST /api/reviews
// @access  Public
const addReview = async (req, res) => {
    try {
        const { product, customerName, rating, comment } = req.body;

        if (!product || !customerName || !rating || !comment) {
            return res.status(400).json({ message: 'All review fields are required' });
        }

        const review = new Review({
            product,
            customerName,
            rating: Number(rating),
            comment
        });

        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to add review', error: error.message });
    }
};

module.exports = {
    getProductReviews,
    addReview
};