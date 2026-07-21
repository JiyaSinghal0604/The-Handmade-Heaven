// backend/server.js

// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const dns=require('dns');

// Load environment variables from the .env file into process.env
dotenv.config({ path: __dirname + '/.env' });

// Force Node.js to use Google (8.8.8.8) or Cloudflare (1.1.1.1) DNS servers
// This bypasses local ISP network blocks or SRV lookup failures
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Import route modules
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const authRoutes = require('./routes/authRoutes');

// Establish connection to MongoDB Atlas
connectDB();

// Initialize the Express application
const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);

// Root test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Handmade Heaven API!' });
});

// Define the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
});