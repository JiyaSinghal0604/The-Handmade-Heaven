// backend/controllers/authController.js

const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc    Admin Login
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }

        // Find admin in database
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare submitted password with hashed password in database
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token valid for 7 days
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            admin: { id: admin._id, username: admin.username }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during login', error: error.message });
    }
};

// @desc    Register Admin (Utility controller to seed first admin account)
// @route   POST /api/auth/register
// @access  Public
const registerAdmin = async (req, res) => {
    
    try {
        const { username, password } = req.body;

        // Check if an admin already exists to prevent open public registration
        const existingAdmin = await Admin.findOne({});
        if (existingAdmin) {
            return res.status(403).json({ message: 'Admin registration is closed. An admin account already exists.' });
        }

        // Hash password securely with salt rounds of 10
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            username,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during registration', error: error.message });
    }
};

module.exports = {
    loginAdmin,
    registerAdmin
};