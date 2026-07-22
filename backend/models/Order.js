const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer WhatsApp/Phone number is required'],
      trim: true,
      index: true
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Shipping address is required']
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'At least one order item is required'
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['WhatsApp', 'Cash on Delivery'],
      default: 'Cash on Delivery'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Paid'],
      default: 'Pending'
    },
    status: {
      type: String,
      enum: ['New', 'Accepted', 'Making', 'Ready', 'Delivered', 'Cancelled'],
      default: 'New'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ customerPhone: 1, createdAt: -1 });
orderSchema.index({ owner: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;