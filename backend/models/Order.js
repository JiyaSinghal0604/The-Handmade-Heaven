// backend/models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: [true, 'Customer name is required']
        },
        customerPhone: {
            type: String,
            required: [true, 'Customer WhatsApp/Phone number is required']
        },
        shippingAddress: {
            type: String,
            required: [true, 'Shipping address is required']
        },
        orderItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['New', 'Accepted', 'Making', 'Ready', 'Delivered'],
            default: 'New'
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;