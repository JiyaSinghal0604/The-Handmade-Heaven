// backend/routes/customerRoutes.js

const express = require('express');
const router = express.Router();
const { getCustomers } = require('../controllers/customerController');
const verifyToken = require('../middleware/auth');

// Protected Admin CRM route
router.get('/', verifyToken, getCustomers);

module.exports = router;