import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Truck,
  Copy,
  Phone,
  MapPin,
  Clock3
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'details' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('whatsapp'); // 'whatsapp' | 'cod'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  const handleInputChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const readResponseSafely = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error('Please fill in your name, phone number, and address for delivery.');
      return;
    }

    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customerName: customerInfo.name.trim(),
      customerPhone: customerInfo.phone.trim(),
      customerEmail: '',
      shippingAddress: {
        address: customerInfo.address.trim(),
        city: customerInfo.city.trim(),
        pincode: customerInfo.pincode.trim()
      },
      orderItems: cart.map((item) => ({
        product: item._id || item.id,
        name: item.name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0)
      })),
      totalAmount: Number(totalPrice || 0),
      paymentMethod: paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Cash on Delivery'
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await readResponseSafely(response);

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to place order');
      }

      const orderId = data?.order?._id || data?._id || '';
      setSavedOrder({
        orderId,
        customerName: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        paymentMethod: paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Cash on Delivery'
      });

      clearCart();
      setCheckoutStep('success');
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error?.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(savedOrder?.orderId || '');
      toast.success('Order ID copied');
    } catch {
      toast.error('Could not copy order ID');
    }
  };

  if (checkoutStep === 'success') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-600 mb-6 shadow-inner"
        >
          <CheckCircle2 className="w-12 h-12" strokeWidth={1.5} />
        </motion.div>

        <h2 className="font-serif text-3xl font-bold text-slate-800 mb-2">Order Placed Successfully!</h2>

        <p className="text-slate-500 text-sm mb-5 leading-relaxed">
          Seller will contact you shortly through WhatsApp.
        </p>

        <div className="w-full p-4 rounded-3xl bg-white border border-pink-100 shadow-md shadow-pink-100/40 mb-5 text-left space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase font-bold text-slate-500">Order ID</span>
            <button onClick={copyOrderId} className="text-pink-600 text-xs font-semibold flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>
          <p className="text-sm font-semibold text-slate-800 break-all">
            {savedOrder?.orderId || 'Order ID will appear here'}
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 text-pink-500" />
            {savedOrder?.phone}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock3 className="w-4 h-4 text-pink-500" />
            Track order anytime after login/signup
          </div>
        </div>

        <div className="w-full flex items-center justify-center gap-2 mb-8 px-4 py-3 rounded-2xl bg-pink-50 border border-pink-100 text-xs font-semibold text-pink-700">
          {paymentMethod === 'whatsapp' ? <MessageCircle className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
          Payment Mode: {paymentMethod === 'whatsapp' ? 'WhatsApp Order' : 'Cash on Delivery'}
        </div>

        <div className="w-full space-y-3">
          <Link
            to="/track-order"
            className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-xl shadow-pink-200 hover:scale-105 active:scale-95 transition-all"
          >
            Track Order <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl bg-white border border-pink-200 text-pink-700 font-semibold text-sm hover:bg-pink-50 transition-all"
          >
            Create Account
          </Link>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
          >
            Login
          </Link>

          <Link
            to="/products"
            className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-pink-100 flex items-center justify-center text-pink-500 mb-6 shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-slate-800 mb-2">Your Bag is Empty</h2>
        <p className="text-slate-500 text-sm mb-8">
          Explore our artisan catalog and find something special crafted just for you.
        </p>
        <Link
          to="/products"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-xl shadow-pink-200 hover:scale-105 active:scale-95 transition-all"
        >
          Explore Shop Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pink-700 mb-8 text-center sm:text-left">
        Shopping Bag &amp; Checkout 🛍️
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="lg:col-span-2 space-y-5">
          {checkoutStep === 'cart' ? (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-slate-800">Review Your Items</h2>

              {cart.map((item) => (
                <motion.div
                  key={item._id || item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-pink-100 shadow-md shadow-pink-100/40 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600'}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-pink-50 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                        {item.category || 'Handmade'}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-slate-800 mt-1">{item.name}</h3>
                      <p className="text-pink-600 font-serif font-bold text-sm">₹{item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 bg-pink-50/80 border border-pink-200 rounded-2xl p-1.5">
                      <button
                        onClick={() => updateQuantity(item._id || item.id, -1)}
                        className="p-1.5 rounded-xl bg-white text-slate-600 hover:text-pink-600 shadow-sm transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-slate-800 px-2 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id || item.id, 1)}
                        className="p-1.5 rounded-xl bg-white text-slate-600 hover:text-pink-600 shadow-sm transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id || item.id)}
                      className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition-colors"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handlePlaceOrder}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-md shadow-pink-100/40 space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-800">Shipping &amp; Payment Details</h2>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="text-xs text-pink-600 hover:underline font-semibold shrink-0"
                  disabled={isSubmitting}
                >
                  ← Back to Bag
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 98765 43210"
                    className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Delivery Address</label>
                  <textarea
                    name="address"
                    required
                    rows="2"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    placeholder="Street address, apartment, suite, etc."
                    className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={customerInfo.pincode}
                      onChange={handleInputChange}
                      placeholder="Pincode"
                      className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-100">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-3">Choose Payment Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('whatsapp')}
                      disabled={isSubmitting}
                      className={`h-24 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'whatsapp'
                          ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200'
                          : 'bg-white border-pink-200 text-slate-700 hover:bg-pink-50'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp Order
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      disabled={isSubmitting}
                      className={`h-24 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'cod'
                          ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200'
                          : 'bg-white border-pink-200 text-slate-700 hover:bg-pink-50'
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                      Cash on Delivery
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm shadow-xl shadow-emerald-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingBag className="w-5 h-5" />
                {isSubmitting ? 'Placing Order...' : 'Place Order ✨'}
              </button>
            </motion.form>
          )}
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-md shadow-pink-100/40 h-fit lg:sticky lg:top-6">
          <h3 className="font-serif text-xl font-bold text-slate-800 mb-6">Order Summary</h3>

          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Luxury Packaging</span>
              <span className="text-pink-600 font-medium">Free 🌸</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Payment Mode</span>
              <span className="flex items-center gap-1.5 text-pink-700 font-semibold text-xs bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full">
                {paymentMethod === 'whatsapp' ? (
                  <MessageCircle className="w-3.5 h-3.5" />
                ) : (
                  <Truck className="w-3.5 h-3.5" />
                )}
                {paymentMethod === 'whatsapp' ? 'WhatsApp Order' : 'Cash on Delivery'}
              </span>
            </div>

            <div className="border-t border-pink-100 pt-4 flex justify-between text-base font-bold text-slate-800">
              <span>Total Amount</span>
              <span className="font-serif text-pink-600 text-xl">₹{totalPrice}</span>
            </div>
          </div>

          {checkoutStep === 'cart' && (
            <button
              onClick={() => setCheckoutStep('details')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-xl shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {checkoutStep === 'details' && (
            <div className="mt-4 p-4 rounded-2xl bg-pink-50 border border-pink-100 text-xs text-slate-600 leading-relaxed">
              Please review your details carefully before placing the order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}