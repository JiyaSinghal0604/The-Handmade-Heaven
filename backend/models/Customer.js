// backend/models/Customer.js

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
            unique: true
        },
        totalOrders: {
            type: Number,
            default: 1
        },
        totalSpent: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;