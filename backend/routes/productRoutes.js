// backend/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    aiGenerateDescription,
    aiGenerateCaption
} = require('../controllers/productController');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public Routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Admin AI Routes (Must be placed before /:id routes to avoid route collision)
router.post('/ai-description', verifyToken, aiGenerateDescription);
router.post('/ai-caption', verifyToken, aiGenerateCaption);

// Protected Admin CRUD Routes
router.post('/', verifyToken, upload.single('image'), createProduct);
router.put('/:id', verifyToken, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;