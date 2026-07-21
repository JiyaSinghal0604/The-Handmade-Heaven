// backend/controllers/productController.js

const Product = require('../models/Product');
const { generateProductDescription, generateInstagramCaption } = require('../services/geminiService');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        // Fetch all products from MongoDB, sorted by newest first
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to fetch products', error: error.message });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to fetch product', error: error.message });
    }
};

// @desc    Create a new product (Admin only)
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;

        // Check if an image was uploaded via Multer and Cloudinary
        if (!req.file) {
            return res.status(400).json({ message: 'Product image is required' });
        }

        const imageUrl = req.file.path; // Cloudinary secure URL

        // Determine if stock is low (e.g., 5 items or fewer)
        const parsedStock = Number(stock) || 0;
        const isLowStock = parsedStock <= 5;

        // Create and save the new product document
        const newProduct = new Product({
            name,
            description,
            price: Number(price),
            category,
            image: imageUrl,
            stock: parsedStock,
            isLowStock
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Detailed Error Message:", error.message);
        console.error("Full Error Stack:", error.stack);
        console.error("Error Object JSON:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: 'Server Error: Failed to create product', error: error.message });
    }
};

// @desc    Update product and stock (Admin only)
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields if provided
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = Number(price);
        if (category) product.category = category;
        if (stock !== undefined) {
            product.stock = Number(stock);
            product.isLowStock = Number(stock) <= 5; // Automatic low stock warning rule
        }
        if (req.file) {
            product.image = req.file.path;
        }

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to update product', error: error.message });
    }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.status(200).json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to delete product', error: error.message });
    }
};

// @desc    AI Controller: Generate Product Description using Gemini
// @route   POST /api/products/ai-description
// @access  Private
const aiGenerateDescription = async (req, res) => {
    try {
        const { productTitle, keyFeatures } = req.body;
        if (!productTitle || !keyFeatures) {
            return res.status(400).json({ message: 'Title and features are required for AI generation' });
        }

        const description = await generateProductDescription(productTitle, keyFeatures);
        res.status(200).json({ description });
    } catch (error) {
        res.status(500).json({ message: 'AI Generation Failed', error: error.message });
    }
};

// @desc    AI Controller: Generate Instagram Caption using Gemini
// @route   POST /api/products/ai-caption
// @access  Private
const aiGenerateCaption = async (req, res) => {
    try {
        const { productName, details } = req.body;
        if (!productName || !details) {
            return res.status(400).json({ message: 'Product name and details are required' });
        }

        const caption = await generateInstagramCaption(productName, details);
        res.status(200).json({ caption });
    } catch (error) {
        res.status(500).json({ message: 'AI Generation Failed', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    aiGenerateDescription,
    aiGenerateCaption
};