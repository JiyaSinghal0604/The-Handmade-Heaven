import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2, MapPin, Phone, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Muzaffarnagar',
    pincode: '',
    instructions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('handmade-heaven-cart') || '[]');
      // Sanitize items: ensure quantity is a normal number between 1 and 99
      const cleanedCart = savedCart.map(item => ({
        ...item,
        quantity: Number(item.quantity) && item.quantity > 0 && item.quantity < 100 ? Number(item.quantity) : 1
      }));
      setCartItems(cleanedCart);
      localStorage.setItem('handmade-heaven-cart', JSON.stringify(cleanedCart));
    } catch (e) {
      // If localStorage is corrupted, reset it
      localStorage.setItem('handmade-heaven-cart', JSON.stringify([]));
      setCartItems([]);
    }
  }, []);

  const updateCartInStorage = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem('handmade-heaven-cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('storage'));
  };

  const handleIncrement = (index) => {
    const updated = [...cartItems];
    if (updated[index].quantity < 99) {
      updated[index].quantity += 1;
      updateCartInStorage(updated);
    }
  };

  const handleDecrement = (index) => {
    const updated = [...cartItems];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      updateCartInStorage(updated);
    } else {
      handleRemoveItem(index);
    }
  };

  const handleRemoveItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    updateCartInStorage(updated);
    toast.success('Item removed from cart');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const deliveryFee = formData.city.trim().toLowerCase() === 'muzaffarnagar' ? 0 : 150;
  const totalAmount = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      toast.error('Please fill in all required delivery details.');
      return;
    }

    setIsSubmitting(true);

    try {

      const getUserId = () => {
    try {
      // Check the exact key your login and TrackOrder use ("customer")
      const customer = localStorage.getItem("customer");
      if (customer) {
        const parsed = JSON.parse(customer);
        if (parsed && (parsed._id || parsed.id)) {
          return parsed._id || parsed.id;
        }
      }

      // Fallback: scan all keys just in case
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object') {
              const foundId = parsed._id || parsed.id || parsed.userId;
              if (foundId) return foundId;
            }
          } catch (e) {
            if (value.length === 24) return value;
          }
        }
      }
    } catch (e) {
      console.error("Error retrieving user ID", e);
    }
    return null;
  };

      const orderPayload = {
        customerName: formData.name,
        customerPhone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode
        },
        orderItems: cartItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity)
        })),
        totalAmount: Number(totalAmount),
        specialInstructions: formData.instructions || '',
        paymentMethod: 'WhatsApp / COD',
        ownerId: getUserId(),
      };

      const currentOwnerId = getUserId();
      console.log("🔍 DEBUG - Extracted Owner ID:", currentOwnerId);
      console.log("📦 DEBUG - Full Order Payload:", orderPayload);

      const response = await fetch('${import.meta.env.VITE_API_BASE_URL}/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      setOrderSuccess(true);
      localStorage.setItem('handmade-heaven-cart', JSON.stringify([]));
      setCartItems([]);
      window.dispatchEvent(new Event('storage'));
      toast.success('Order placed successfully! 🎉');
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order. Check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-slate-800">Order Placed Successfully! 🌸</h2>
        <p className="text-slate-600 text-sm">
          Thank you for shopping with Handmade Heaven. We have received your order and will contact you via WhatsApp shortly.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-pink-600 text-white font-semibold rounded-2xl shadow-md hover:bg-pink-700 transition cursor-pointer"
        >
          Continue Shopping ✨
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-pink-100 pb-5">
        <h1 className="font-serif text-3xl font-bold text-slate-800 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-pink-600" /> Your Shopping Bag
        </h1>
        <p className="text-slate-500 text-sm mt-1">Review your artisan selections and complete your delivery details.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-pink-100 p-8 shadow-sm space-y-4">
          <ShoppingBag className="w-16 h-16 text-pink-300 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-slate-800">Your bag is currently empty</h3>
          <p className="text-slate-500 text-sm">Explore our handcrafted creations and add something special.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-pink-600 text-white font-semibold text-sm rounded-2xl shadow-md hover:bg-pink-700 transition cursor-pointer"
          >
            Explore Creations ✨
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-800">Cart Items ({cartItems.length})</h3>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={index}
                  layout
                  className="bg-white p-4 sm:p-5 rounded-3xl border border-pink-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.imageUrl || item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-pink-100"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                        {item.category || 'Handmade'}
                      </span>
                      <h4 className="font-serif font-bold text-slate-800 text-base mt-1">{item.name}</h4>
                      <p className="text-pink-600 font-bold text-sm mt-0.5">₹{item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-pink-100">
                    <div className="flex items-center gap-2 bg-pink-50/70 border border-pink-200 rounded-2xl p-1">
                      <button
                        type="button"
                        onClick={() => handleDecrement(index)}
                        className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-pink-100 transition shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(index)}
                        className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-pink-100 transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-sm space-y-6 sticky top-8">
            <h3 className="font-serif text-xl font-bold text-slate-800">Checkout Details</h3>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-600" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Aarav Sharma"
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-pink-600" /> Phone Number (WhatsApp)
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-pink-600" /> Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House No, Street, Area"
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="251001"
                    className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-pink-600" /> Special Instructions (Optional)
                </label>
                <textarea
                  name="instructions"
                  rows="2"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  placeholder="Any custom color notes..."
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="pt-4 border-t border-pink-100 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Delivery Fee:</span>
                  <span className="font-bold text-slate-800">
                    {deliveryFee === 0 ? 'FREE' : `₹150`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-slate-800 pt-2 border-t border-pink-100">
                  <span>Total Amount:</span>
                  <span className="font-serif text-2xl text-pink-600">₹{totalAmount}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-pink-600 text-white font-bold text-sm rounded-2xl shadow-md hover:bg-pink-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order Now ✨'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}