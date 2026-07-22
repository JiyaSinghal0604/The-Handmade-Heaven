import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Users,
  XCircle,
  Clock,
  CheckCircle2,
  Truck,
  RefreshCw,
  Search,
  FileText,
  Phone,
  MapPin,
  MessageCircle,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  DollarSign
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products'
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Products State (from your existing inventory view)
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    imageUrl: ''
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      toast.error(error.message || 'Error loading orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch {
      // fallback if product endpoint differs
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const token = getToken();
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      const token = getToken();
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      if (!res.ok) throw new Error('Failed to add product');
      toast.success('Product added successfully!');
      setProductForm({ name: '', category: '', price: '', description: '', imageUrl: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Analytics Metrics Calculations
  const totalOrdersCount = orders.length;
  const uniqueCustomersCount = new Set(orders.map((o) => o.customerPhone || o.customerName)).size;
  const cancelledOrdersCount = orders.filter((o) => (o.status || 'Pending') === 'Cancelled').length;
  const totalRevenue = orders
    .filter((o) => (o.status || 'Pending') !== 'Cancelled')
    .reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-800">Admin Command Center 🌸</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your store orders, track customer statistics, and control inventory effortlessly.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-pink-50 p-1.5 rounded-2xl border border-pink-100">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
                : 'text-slate-600 hover:text-pink-600'
            }`}
          >
            📦 Orders &amp; Customers ({totalOrdersCount})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
                : 'text-slate-600 hover:text-pink-600'
            }`}
          >
            ✨ Inventory ({products.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ORDERS & ANALYTICS */}
      {activeTab === 'orders' && (
        <div className="space-y-8">
          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Total Orders</p>
                <h3 className="font-serif text-2xl font-bold text-slate-800">{totalOrdersCount}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Total Customers</p>
                <h3 className="font-serif text-2xl font-bold text-slate-800">{uniqueCustomersCount}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Cancelled Orders</p>
                <h3 className="font-serif text-2xl font-bold text-slate-800">{cancelledOrdersCount}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Active Revenue</p>
                <h3 className="font-serif text-2xl font-bold text-slate-800">₹{totalRevenue}</h3>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Orders List & Status Updates */}
          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-pink-500" />
              <p className="text-sm font-medium">Loading orders &amp; customer metrics...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 p-8 shadow-sm">
              <Package className="w-12 h-12 text-pink-300 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-slate-800">No Orders Found</h3>
              <p className="text-slate-500 text-xs mt-1">Customer orders will appear here once placed.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const currentStatus = order.status || 'Pending';
                const matchedStatusOpt = STATUS_OPTIONS.find((s) => s.value === currentStatus) || STATUS_OPTIONS[0];

                return (
                  <motion.div
                    key={order._id}
                    layout
                    className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6"
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
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${matchedStatusOpt.color}`}>
                          <matchedStatusOpt.icon className="w-3.5 h-3.5" />
                          {currentStatus}
                        </span>

                        {/* Status Updater Dropdown */}
                        <select
                          value={currentStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="px-3 py-1.5 bg-pink-50 border border-pink-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>Mark as {opt.label}</option>
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
                          <span>{order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</span>
                        </div>

                        <a
                          href={getWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat on WhatsApp
                        </a>
                      </div>

                      <div className="space-y-2.5">
                        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Items Ordered</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                          {order.orderItems?.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-xs p-2 rounded-xl bg-pink-50/50 border border-pink-100">
                              <span className="font-medium text-slate-800">
                                {item.name} <span className="text-pink-600 font-bold">x{item.quantity}</span>
                              </span>
                              <span className="font-bold text-slate-700">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
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
                              <FileText className="w-3 h-3" /> Special Instructions:
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
      )}

      {/* TAB 2: INVENTORY & PRODUCTS */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm h-fit space-y-4">
            <h3 className="font-serif text-xl font-bold text-slate-800">Add New Creation</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g., Rose Gold Artisan Tray"
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  placeholder="e.g., Decor, Jewelry"
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="1499"
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe the artisan craftsmanship..."
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingProduct}
                className="w-full py-4 rounded-2xl bg-pink-600 text-white font-semibold text-sm shadow-md hover:bg-pink-700 transition"
              >
                {submittingProduct ? 'Adding...' : 'Add Creation ✨'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-pink-100 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-slate-800">Active Inventory ({products.length})</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {products.length === 0 ? (
                <p className="text-sm text-slate-400 text-py-10">No products listed yet.</p>
              ) : (
                products.map((prod) => (
                  <div key={prod._id || prod.id} className="flex items-center justify-between p-4 rounded-2xl border border-pink-100 bg-pink-50/20">
                    <div className="flex items-center gap-4">
                      <img src={prod.imageUrl || prod.image} alt={prod.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">{prod.category}</span>
                        <h4 className="font-serif font-bold text-slate-800 mt-1">{prod.name}</h4>
                        <p className="text-pink-600 font-bold text-sm">₹{prod.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(prod._id || prod.id)}
                      className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}