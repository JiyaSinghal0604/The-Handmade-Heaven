const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeAddress = (shippingAddress) => {
  if (!shippingAddress) return '';
  if (typeof shippingAddress === 'string') return shippingAddress.trim();
  if (typeof shippingAddress === 'object') {
    return [shippingAddress.address, shippingAddress.city, shippingAddress.pincode]
      .filter(Boolean)
      .join(', ')
      .trim();
  }
  return String(shippingAddress).trim();
};

async function normalizeOrderItems(orderItems) {
  const normalized = [];
  let computedTotal = 0;

  for (const it of orderItems || []) {
    const prodId = (it.product || it._id || it.id || '').toString();
    if (!isValidId(prodId)) continue;

    const product = await Product.findById(prodId).lean();
    const quantity = Math.max(1, Number(it.quantity || it.qty || 0));
    const price = Number(it.price ?? (product ? product.price : 0)) || 0;
    const name = it.name || (product ? product.name : 'Unknown product');

    normalized.push({ product: prodId, name, price, quantity });
    computedTotal += price * quantity;
  }

  return { normalized, computedTotal };
}

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      orderItems,
      paymentMethod,
      ownerId,
      totalAmount: clientTotalAmount
    } = req.body || {};

    if (!customerName || !customerPhone) {
      return res.status(400).json({ message: 'Customer name and phone are required' });
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const { normalized, computedTotal } = await normalizeOrderItems(orderItems);
    if (normalized.length === 0) {
      return res.status(400).json({ message: 'No valid order items provided' });
    }

    const totalAmount = Number(computedTotal || clientTotalAmount || 0);
    const owner = ownerId && isValidId(ownerId) ? ownerId : undefined;
    const finalAddress = normalizeAddress(shippingAddress);

    if (!finalAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const order = await Order.create({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: (customerEmail || '').trim(),
      shippingAddress: finalAddress,
      orderItems: normalized,
      totalAmount,
      paymentMethod: paymentMethod === 'WhatsApp' ? 'WhatsApp' : 'Cash on Delivery',
      paymentStatus: 'Pending',
      status: 'New',
      owner
    });

    const customerQuery = customerPhone
      ? { phone: customerPhone.trim() }
      : customerEmail
        ? { email: customerEmail.trim().toLowerCase() }
        : null;

    if (customerQuery) {
      const existingCustomer = await Customer.findOne(customerQuery);
      if (existingCustomer) {
        existingCustomer.totalOrders = (existingCustomer.totalOrders || 0) + 1;
        existingCustomer.totalSpent = (existingCustomer.totalSpent || 0) + totalAmount;
        existingCustomer.name = customerName.trim();
        if (customerEmail) existingCustomer.email = customerEmail.trim().toLowerCase();
        await existingCustomer.save();
      } else {
        await Customer.create({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: (customerEmail || '').trim().toLowerCase(),
          totalOrders: 1,
          totalSpent: totalAmount
        });
      }
    }

    for (const item of normalized) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      product.stock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 0));
      product.isLowStock = product.stock <= 5;
      await product.save();
    }

    return res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        customerPhone: order.customerPhone
      }
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ message: 'Server Error: Failed to place order', error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 100);
    const skip = (page - 1) * limit;

    const orders = await Order.find({})
      .populate('orderItems.product', 'name price image imageUrl')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments({});
    return res.status(200).json({ orders, meta: { total, page, limit } });
  } catch (error) {
    console.error('getOrders error:', error);
    return res.status(500).json({ message: 'Server Error: Failed to fetch orders', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid order id' });

    const order = await Order.findById(id)
      .populate('orderItems.product', 'name price image imageUrl')
      .populate('owner', 'name email phone')
      .lean();

    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.status(200).json(order);
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ message: 'Server Error: Failed to fetch order', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const validStatuses = ['New', 'Accepted', 'Making', 'Ready', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order pipeline status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    const updated = await order.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ message: 'Server Error: Failed to update order status', error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body || {};
    const validStatuses = ['Pending', 'Confirmed', 'Paid'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = paymentStatus;
    const updated = await order.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error('updatePaymentStatus error:', error);
    return res.status(500).json({ message: 'Server Error: Failed to update payment status', error: error.message });
  }
};

const linkGuestOrders = async (req, res) => {
  try {
    const { ownerId, phone, email } = req.body || {};
    if (!ownerId || !isValidId(ownerId)) {
      return res.status(400).json({ message: 'Valid ownerId is required' });
    }
    if (!phone && !email) {
      return res.status(400).json({ message: 'Phone or email is required to find guest orders' });
    }

    const query = { owner: { $in: [null, undefined] } };
    if (phone) query.customerPhone = phone;
    if (email) query.customerEmail = email.toLowerCase();

    const result = await Order.updateMany(query, { $set: { owner: ownerId } });

    await User.findById(ownerId).lean();
    const custQuery = phone ? { phone } : email ? { email: email.toLowerCase() } : null;
    if (custQuery) {
      await Customer.updateMany(custQuery, { $set: { linkedUser: ownerId } });
    }

    return res.status(200).json({
      message: 'Linked guest orders',
      modifiedCount: result.modifiedCount ?? result.nModified ?? 0
    });
  } catch (error) {
    console.error('linkGuestOrders error:', error);
    return res.status(500).json({ message: 'Server Error: Failed to link guest orders', error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!isValidId(ownerId)) {
      return res.status(400).json({
        message: "Invalid user id"
      });
    }

    const orders = await Order.find({ owner: ownerId })
      .populate("orderItems.product", "name price image imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({}).lean();
    let totalRevenue = 0;
    let deliveredOrdersCount = 0;
    let pendingOrdersCount = 0;
    const productSales = {};

    for (const order of orders) {
      if (order.status === 'Delivered') {
        totalRevenue += Number(order.totalAmount || 0);
        deliveredOrdersCount += 1;
      }
      if (['New', 'Accepted', 'Making', 'Ready'].includes(order.status)) {
        pendingOrdersCount += 1;
      }
      for (const it of order.orderItems || []) {
        const pid = (it.product || '').toString();
        productSales[pid] = (productSales[pid] || 0) + Number(it.quantity || 0);
      }
    }

    return res.status(200).json({
      totalRevenue,
      totalOrdersCount: orders.length,
      deliveredOrdersCount,
      pendingOrdersCount,
      productSales
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    return res.status(500).json({ message: 'Server Error: Failed to compute analytics', error: error.message });
  }
};


module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getAnalytics,
  linkGuestOrders,
  getMyOrders
};