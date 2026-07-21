// backend/config/db.js

// Import the mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define an asynchronous function to handle database connection
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the URI stored in environment variables
        // process.env accesses variables defined in our .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // Log a success message including the host name for confirmation
        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        // If connection fails, log the error message and terminate the process
        console.error(`Database Connection Error: ${error.message}`);
        
        // Exit the Node.js process with a failure code (1)
        process.exit(1);
    }
};

// Export the function so it can be imported and executed in server.js
module.exports = connectDB;