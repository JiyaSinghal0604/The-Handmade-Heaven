// backend/controllers/orderController.js

const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// @desc    Create a new guest order & update customer database
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const { customerName, customerPhone, shippingAddress, orderItems, totalAmount } = req.body;

        if (!customerName || !customerPhone || !shippingAddress || !orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Please provide all required order details' });
        }

        // 1. Create and save the order
        const order = new Order({
            customerName,
            customerPhone,
            shippingAddress,
            orderItems,
            totalAmount,
            status: 'New'
        });
        const savedOrder = await order.save();

        // 2. Automatically update or create customer record for CRM
        let customer = await Customer.findOne({ phone: customerPhone });
        if (customer) {
            customer.totalOrders += 1;
            customer.totalSpent += totalAmount;
            customer.name = customerName; // Update name in case of slight changes
            await customer.save();
        } else {
            await Customer.create({
                name: customerName,
                phone: customerPhone,
                totalOrders: 1,
                totalSpent: totalAmount
            });
        }

        // 3. Deduct stock quantities from products and check low stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock = Math.max(0, product.stock - item.quantity);
                product.isLowStock = product.stock <= 5;
                await product.save();
            }
        }

        res.status(201).json({ message: 'Order placed successfully!', order: savedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to place order', error: error.message });
    }
};

// @desc    Get all orders (Admin dashboard)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('orderItems.product').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to fetch orders', error: error.message });
    }
};

// @desc    Update order status in pipeline (New -> Accepted -> Making -> Ready -> Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['New', 'Accepted', 'Making', 'Ready', 'Delivered'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order pipeline status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to update order status', error: error.message });
    }
};

// @desc    Get Dashboard Analytics (Revenue, Best Sellers, Completed Orders)
// @route   GET /api/orders/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const orders = await Order.find({});
        
        let totalRevenue = 0;
        let completedCount = 0;
        const productSales = {};

        orders.forEach(order => {
            if (order.status === 'Delivered') {
                totalRevenue += order.totalAmount;
                completedCount += 1;
            }

            // Track item quantities sold for best-selling products
            order.orderItems.forEach(item => {
                const prodId = item.product.toString();
                if (!productSales[prodId]) {
                    productSales[prodId] = 0;
                }
                productSales[prodId] += item.quantity;
            });
        });

        res.status(200).json({
            totalRevenue,
            totalOrdersCount: orders.length,
            completedOrdersCount: completedCount,
            productSales
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Failed to compute analytics', error: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAnalytics
};