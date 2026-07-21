// backend/middleware/upload.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

// Load environment variables to ensure Cloudinary credentials are readable
dotenv.config();

// Configure Cloudinary with credentials from your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up storage engine for Multer using Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'handmade-heaven-products', // The folder name inside your Cloudinary dashboard
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Acceptable image formats
        transformation: [{ width: 800, height: 800, crop: 'limit' }] // Resize images automatically to save bandwidth
    }
});

// Initialize Multer with the Cloudinary storage configuration
const upload = multer({ storage: storage });

module.exports = upload;