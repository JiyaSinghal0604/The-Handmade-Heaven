// backend/models/Admin.js

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide an admin username'],
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Please provide a secure password']
        }
    },
    {
        timestamps: true
    }
);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;