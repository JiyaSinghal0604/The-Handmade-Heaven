import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Muzaffarnagar'); // Default to Muzaffarnagar for convenience
  const [pincode, setPincode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery Calculation Logic (Flat ₹150 per order if outside Muzaffarnagar, 0 if inside)
  const isMuzaffarnagar = city.trim().toLowerCase() === 'muzaffarnagar';
  const deliveryFee = isMuzaffarnagar ? 0 : 150;
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName,
        customerPhone,
        shippingAddress: {
          address,
          city,
          pincode
        },
        orderItems: cart.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.imageUrl || item.image
        })),
        totalAmount: finalTotal,
        deliveryFee,
        specialInstructions,
        paymentMethod: 'WhatsApp / COD'
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to place order');

      const data = await response.json();
      toast.success('Order placed successfully! 🎉');
      clearCart();
      navigate('/track-order', { state: { orderId: data._id || data.order?._id } });
    } catch (error) {
      toast.error(error.message || 'Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Explore our exquisite collection of handmade artisan goods and add your favorite pieces to the cart.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-pink-600 text-white font-semibold text-sm shadow-lg shadow-pink-200 hover:bg-pink-700 transition"
        >
          Explore Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
        <Sparkles className="w-7 h-7 text-pink-500" /> Shopping Cart &amp; Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Review Your Items ({totalItems})</h2>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <motion.div
                key={item._id || item.id}
                layout
                className="flex items-center justify-between p-4 bg-white border border-pink-100 rounded-3xl shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl || item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-pink-50"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">
                      {item.category || 'Artisan Goods'}
                    </span>
                    <h3 className="font-serif font-bold text-slate-800 mt-1">{item.name}</h3>
                    <p className="text-pink-600 font-bold text-sm mt-0.5">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-pink-50/60 p-1.5 rounded-xl border border-pink-100">
                    <button
                      onClick={() => updateQuantity((item._id || item.id), item.quantity - 1)}
                      className="p-1 text-slate-600 hover:text-pink-600 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity((item._id || item.id), item.quantity + 1)}
                      className="p-1 text-slate-600 hover:text-pink-600 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id || item.id)}
                    className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Shipping Details & Order Summary */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-sm space-y-6 h-fit">
          <h2 className="font-serif text-xl font-bold text-slate-800">Shipping &amp; Summary</h2>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-4 py-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Street, Area"
                className="w-full px-4 py-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Muzaffarnagar"
                  className="w-full px-4 py-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium text-pink-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="251001"
                  className="w-full px-4 py-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Special Instructions (Optional)</label>
              <textarea
                rows="2"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Gift wrapping, delivery notes..."
                className="w-full px-4 py-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-pink-100 pt-4 space-y-2.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({totalItems} items):</span>
                <span className="font-semibold">₹{totalPrice}</span>
              </div>

              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" /> Delivery Fee:
                </span>
                {isMuzaffarnagar ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                    FREE (Inside Muzaffarnagar)
                  </span>
                ) : (
                  <span className="font-bold text-pink-600">
                    ₹150 (Outside Muzaffarnagar)
                  </span>
                )}
              </div>

              <div className="flex justify-between text-base font-bold text-slate-800 border-t border-pink-100 pt-3">
                <span>Total Amount:</span>
                <span className="font-serif text-xl text-pink-600">₹{finalTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm shadow-lg shadow-pink-200 transition flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order Now ✨'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}