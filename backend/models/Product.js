// backend/models/Product.js

const mongoose = require('mongoose');

// Define the schema (blueprint) for a Product document in MongoDB
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Please provide a product description']
        },
        price: {
            type: Number,
            required: [true, 'Please provide a product price'],
            min: [0, 'Price cannot be negative']
        },
        category: {
            type: String,
            required: [true, 'Please specify a product category'],
            trim: true
        },
        image: {
            type: String,
            required: [true, 'Please provide a product image URL (Cloudinary)']
        },
        stock: {
            type: Number,
            required: [true, 'Please provide stock quantity'],
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        isLowStock: {
            type: Boolean,
            default: false
        }
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' timestamps to documents
        timestamps: true
    }
);

// Create and export the Product model based on the schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;