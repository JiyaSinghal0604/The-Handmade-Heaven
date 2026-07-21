// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Read the authorization header from the incoming request
    const authHeader = req.headers.authorization;

    // Check if the header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    // Extract the token string after 'Bearer '
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using our secret key stored in environment variables
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded admin payload to the request object so downstream controllers can use it
        req.admin = verified;
        
        // Pass control to the next middleware or route handler function
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = verifyToken;