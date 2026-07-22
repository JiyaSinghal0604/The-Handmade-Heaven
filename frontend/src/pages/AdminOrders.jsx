import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  Search,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  { value: 'Processing', label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw },
  { value: 'Out for Delivery', label: 'Out for Delivery', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
  { value: 'Delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle }
];

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Helper to get token from localStorage (adjust key if your app uses something else like 'authToken')
  const getToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        toast.error('Unauthorized access. Please log in as an admin.');
        navigate('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      toast.error(error.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const token = getToken();
      // Match backend route method: PUT
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
      );
      toast.success(`Order status updated to "${newStatus}"`);
    } catch (error) {
      toast.error(error.message || 'Could not update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getWhatsAppLink = (order) => {
    const cleanPhone = order.customerPhone ? order.customerPhone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(
      `Hello ${order.customerName},\n\nRegarding your order #${order._id}:\nCurrent Status: *${order.status || 'Pending'}*\nTotal Amount: ₹${order.totalAmount}\n\nThank you for shopping with us!`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerPhone || '').includes(searchQuery) ||
      (order._id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || (order.status || 'Pending') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800">
            Admin Order Dashboard 📦
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage incoming orders, review customer instructions, and update delivery statuses.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-semibold self-start md:self-auto transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone number, or Order ID..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium text-slate-700 shadow-sm"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-pink-500" />
          <p className="text-sm font-medium">Fetching orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 p-8 shadow-sm">
          <Package className="w-12 h-12 text-pink-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-slate-800">No Orders Found</h3>
          <p className="text-slate-500 text-xs mt-1">
            {searchQuery || statusFilter !== 'All'
              ? 'Try adjusting your search or status filter.'
              : 'New customer orders will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStatus = order.status || 'Pending';
            const matchedStatusOpt =
              STATUS_OPTIONS.find((s) => s.value === currentStatus) || STATUS_OPTIONS[0];

            return (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-7 shadow-md shadow-pink-100/30 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-slate-400">Order ID:</span>
                      <span className="text-sm font-mono font-bold text-slate-800">{order._id}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Placed on: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${matchedStatusOpt.color}`}
                    >
                      <matchedStatusOpt.icon className="w-3.5 h-3.5" />
                      {currentStatus}
                    </span>

                    <select
                      value={currentStatus}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="px-3 py-1.5 bg-pink-50 border border-pink-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          Mark as {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2.5">
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Customer Details</h4>
                    <p className="font-serif font-bold text-base text-slate-800">{order.customerName}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span>{order.customerPhone}</span>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                      <span>
                        {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                      </span>
                    </div>

                    <a
                      href={getWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-100 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat on WhatsApp
                    </a>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Items Ordered</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {order.orderItems && order.orderItems.length > 0 ? (
                        order.orderItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-xs p-2 rounded-xl bg-pink-50/50 border border-pink-100"
                          >
                            <span className="font-medium text-slate-800">
                              {item.name} <span className="text-pink-600 font-bold">x{item.quantity}</span>
                            </span>
                            <span className="font-bold text-slate-700">₹{item.price * item.quantity}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No items listed</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 bg-pink-50/30 p-4 rounded-2xl border border-pink-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="font-bold text-slate-800">{order.paymentMethod || 'WhatsApp'}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Total Amount:</span>
                      <span className="font-serif font-bold text-lg text-pink-600">₹{order.totalAmount}</span>
                    </div>

                    {order.specialInstructions && (
                      <div className="pt-2 border-t border-pink-100">
                        <span className="text-[10px] uppercase font-bold text-pink-600 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Special Instructions:
                        </span>
                        <p className="text-xs italic text-slate-700 mt-1 bg-white p-2.5 rounded-xl border border-pink-200">
                          "{order.specialInstructions}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}