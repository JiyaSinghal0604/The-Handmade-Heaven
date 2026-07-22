import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Trash2, Edit3, Package, LogOut, Loader2, ShieldCheck, X, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Theme State ('dark' or 'dim-light')
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'dim-light');
  
  // New Product Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Unauthorized access. Please log in.');
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/products');
      setProducts(response.data.products || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', Number(price));
      formData.append('category', category);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await API.post('/products', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Masterpiece added successfully! ✨');
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImageFile(null);
      setImagePreview('');
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this luxury item?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await API.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product removed.');
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product.');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name || '');
    setEditDescription(product.description || '');
    setEditPrice(product.price || '');
    setEditCategory(product.category || '');
    setEditImageUrl(product.imageUrl || product.image || '');
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('adminToken');

      await API.put(`/products/${editingProduct._id}`, {
        name: editName,
        description: editDescription,
        price: Number(editPrice),
        category: editCategory,
        imageUrl: editImageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Product updated successfully! ✨');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully.');
    navigate('/admin/login');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-500 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f7f3f5] text-slate-800'}`}>
      
      {/* Top Banner with Theme Toggle & Fluid Animations */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border shadow-lg backdrop-blur-xl mb-10 transition-colors duration-500 ${
          isDark 
            ? 'bg-slate-900/80 border-slate-800 shadow-pink-950/20' 
            : 'bg-[#ede5e9]/90 border-[#e3d5dd] shadow-pink-200/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.05 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/30"
          >
            <ShieldCheck className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">Admin Command Center 🌸</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage your luxury catalog and inventory effortlessly</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setTheme(isDark ? 'dim-light' : 'dark')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800' 
                : 'bg-white/80 border-[#e0cfd8] text-pink-600 hover:bg-white shadow-sm'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Dim Mode' : 'Dark Mode'}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleLogout}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold border transition-all duration-300 ${
              isDark
                ? 'bg-rose-950/30 border-rose-900/50 text-rose-300 hover:bg-rose-900/40'
                : 'bg-white/80 border-[#e0cfd8] text-rose-600 hover:bg-rose-50 shadow-sm'
            }`}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Add New Product */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-5"
        >
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl sticky top-28 backdrop-blur-xl transition-colors duration-500 ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800' 
              : 'bg-[#ede5e9]/85 border-[#e3d5dd]'
          }`}>
            <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" /> Add New Creation
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Rose Gold Artisan Tray"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all ${
                    isDark 
                      ? 'bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600' 
                      : 'bg-white/70 border-[#e0cfd8] text-slate-800 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Category *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Decor, Jewelry, Home"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all ${
                    isDark 
                      ? 'bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600' 
                      : 'bg-white/70 border-[#e0cfd8] text-slate-800 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Price (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="1499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all ${
                    isDark 
                      ? 'bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600' 
                      : 'bg-white/70 border-[#e0cfd8] text-slate-800 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Product Image (From Device) *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className={`w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold transition-all cursor-pointer ${
                    isDark 
                      ? 'text-slate-400 file:bg-slate-800 file:text-pink-400 hover:file:bg-slate-700' 
                      : 'text-slate-600 file:bg-pink-100/60 file:text-pink-700 hover:file:bg-pink-200/70'
                  }`}
                />
                {imagePreview && (
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={imagePreview} 
                    alt="Preview" 
                    className={`w-20 h-20 object-cover rounded-xl mt-3 border shadow-sm ${isDark ? 'border-slate-800' : 'border-[#e0cfd8]'}`} 
                  />
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Description *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe the artisan craftsmanship..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all resize-none ${
                    isDark 
                      ? 'bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600' 
                      : 'bg-white/70 border-[#e0cfd8] text-slate-800 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white py-3.5 px-6 rounded-2xl font-semibold shadow-lg shadow-pink-500/20 transition-all duration-300 text-sm tracking-wide disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4" /> Publish Masterpiece</>}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Right Section: Existing Products Catalog */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-7"
        >
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg backdrop-blur-xl transition-colors duration-500 ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800' 
              : 'bg-[#ede5e9]/85 border-[#e3d5dd]'
          }`}>
            <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-500" /> Active Inventory ({products.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <p className={`text-center py-12 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>No products found in database.</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                <AnimatePresence>
                  {products.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center justify-between gap-4 p-4 rounded-2xl border shadow-sm transition-colors duration-300 ${
                        isDark 
                          ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700' 
                          : 'bg-white/80 border-[#e3d5dd] hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200'}
                          alt={item.name}
                          className={`w-16 h-16 rounded-xl object-cover flex-shrink-0 border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-[#e0cfd8] bg-pink-50'}`}
                        />
                        <div>
                          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                            isDark ? 'bg-pink-950/60 text-pink-300 border border-pink-900/50' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {item.category}
                          </span>
                          <h4 className="font-serif font-bold mt-1">{item.name}</h4>
                          <p className="text-sm font-semibold text-pink-500">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(item)}
                          className={`p-2.5 rounded-xl transition-colors ${
                            isDark ? 'text-pink-400 hover:bg-slate-800' : 'text-pink-600 hover:bg-pink-100/60'
                          }`}
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteProduct(item._id)}
                          className={`p-2.5 rounded-xl transition-colors ${
                            isDark ? 'text-rose-400 hover:bg-rose-950/40' : 'text-rose-500 hover:bg-rose-50'
                          }`}
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#ede5e9] border-[#e3d5dd]'
              }`}
            >
              <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-[#e0cfd8]'}`}>
                <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-pink-500" /> Edit Masterpiece
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingProduct(null)}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-pink-100/60'}`}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      isDark ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white/70 border-[#e0cfd8] text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Category *</label>
                  <input
                    type="text"
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      isDark ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white/70 border-[#e0cfd8] text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      isDark ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white/70 border-[#e0cfd8] text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Image URL *</label>
                  <input
                    type="url"
                    required
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      isDark ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white/70 border-[#e0cfd8] text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Description *</label>
                  <textarea
                    required
                    rows="3"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none ${
                      isDark ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white/70 border-[#e0cfd8] text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className={`w-1/2 py-3 px-6 rounded-2xl font-semibold border text-sm transition-all ${
                      isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-[#d4c2cc] text-slate-700 hover:bg-white/60'
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={updating}
                    className="w-1/2 py-3 px-6 rounded-2xl font-semibold bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20 hover:shadow-lg text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}