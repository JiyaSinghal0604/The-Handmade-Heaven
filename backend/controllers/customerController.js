// backend/controllers/customerController.js

const Customer = require('../models/Customer');

// @desc    Get all customers for CRM database
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({}).sort({ totalSpent: -1 });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to fetch customers', error: error.message });
    }
};

module.exports = {
    getCustomers
};