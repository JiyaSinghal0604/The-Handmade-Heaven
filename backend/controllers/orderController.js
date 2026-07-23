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
      specialInstructions,
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
      return res.status(400).json({ message: 'No valid order items provided with valid product IDs' });
    }

    const totalAmount = Number(computedTotal || clientTotalAmount || 0);

    let owner = undefined;
    if (ownerId && typeof ownerId === 'string' && !['null', 'undefined', ''].includes(ownerId.trim())) {
      if (isValidId(ownerId.trim())) {
        owner = ownerId.trim();
      }
    }

    let finalAddress = shippingAddress;
    if (typeof shippingAddress === 'object' && shippingAddress !== null) {
      finalAddress = [shippingAddress.address, shippingAddress.city, shippingAddress.pincode]
        .filter(Boolean)
        .join(', ')
        .trim() || 'Not specified';
    } else if (!finalAddress || typeof finalAddress !== 'string') {
      finalAddress = 'Not specified';
    }

    const order = await Order.create({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: (customerEmail || '').trim(),
      shippingAddress: finalAddress,
      orderItems: normalized,
      totalAmount,
      paymentMethod: paymentMethod && paymentMethod.includes('WhatsApp') ? 'WhatsApp' : 'Cash on Delivery',
      paymentStatus: 'Pending',
      status: 'New',
      owner,
      ownerId: owner, // Set both to prevent schema mapping mismatches
      specialInstructions: specialInstructions ? specialInstructions.trim() : ''
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
        if (owner) existingCustomer.linkedUser = owner;
        await existingCustomer.save();
      } else {
        await Customer.create({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: (customerEmail || '').trim().toLowerCase(),
          totalOrders: 1,
          totalSpent: totalAmount,
          linkedUser: owner
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
    console.error('createOrder error stack:', error);
    return res.status(500).json({ 
      message: 'Server Error: Failed to place order', 
      error: error.message 
    });
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
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = [
      'New', 'Pending', 'Processing', 'Accepted', 'Making', 'Ready', 
      'Out for Delivery', 'Delivered', 'Cancelled'
    ];

    const matchedStatus = validStatuses.find(
      v => v.toLowerCase() === status.trim().toLowerCase()
    );

    if (!matchedStatus) {
      return res.status(400).json({ message: `Invalid order pipeline status: ${status}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = matchedStatus;
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

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid order id' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const allowedStatuses = ['New', 'Accepted'];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order because it is currently marked as '${order.status}'` 
      });
    }

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = (Number(product.stock) || 0) + Number(item.quantity || 0);
        product.isLowStock = product.stock <= 5;
        await product.save();
      }
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save();

    return res.status(200).json({ 
      message: 'Order cancelled successfully', 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('cancelOrder error:', error);
    return res.status(500).json({ message: 'Server Error: Failed to cancel order', error: error.message });
  }
};

const linkGuestOrders = async (req, res) => {
  try {
    const { ownerId, phone, email } = req.body;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: "Owner ID is required" });
    }

    const conditions = [];
    if (phone) {
      conditions.push({ customerPhone: phone });
      conditions.push({ phone: phone });
    }
    if (email) {
      conditions.push({ customerEmail: email });
      conditions.push({ email: email });
    }

    if (conditions.length === 0) {
      return res.status(200).json({ success: true, modifiedCount: 0, message: "No contact info provided" });
    }

    const query = {
      $and: [
        { 
          $or: [
            { owner: null }, 
            { owner: { $exists: false } }, 
            { ownerId: null }, 
            { ownerId: { $exists: false } }
          ] 
        },
        { $or: conditions }
      ]
    };

    const updateResult = await Order.updateMany(
      query,
      { $set: { owner: ownerId, ownerId: ownerId } }
    );

    return res.status(200).json({
      success: true,
      message: "Guest orders linked successfully",
      modifiedCount: updateResult.modifiedCount
    });
  } catch (err) {
    console.error("Error in linkGuestOrders:", err);
    return res.status(500).json({ success: false, message: "Server error while linking orders", error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!isValidId(ownerId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Query both 'owner' and 'ownerId' fields to prevent missing any records
    const orders = await Order.find({
      $or: [{ owner: ownerId }, { ownerId: ownerId }]
    })
      .populate("orderItems.product", "name price image imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({
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
  cancelOrder,
  getAnalytics,
  linkGuestOrders,
  getMyOrders
};