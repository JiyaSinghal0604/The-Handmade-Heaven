// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin } = require('../controllers/authController');

// Public authentication routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin); // Used once to seed initial admin

module.exports = router;