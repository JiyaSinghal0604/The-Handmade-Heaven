import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShoppingBag, Eye, Search, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState(null);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/cart');
  };

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 max-w-7xl mx-auto">
      
      {/* Catalog Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs font-semibold mb-4 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Handcrafted Catalog 🌸
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-pink-700 mb-4">
          Our Handmade Collection
        </h1>
        <p className="text-slate-600 text-sm">
          Browse through our exquisite luxury artisanal masterpieces.
        </p>
      </motion.div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 p-4 rounded-3xl bg-white/80 border border-pink-100 shadow-xl shadow-pink-100/50 backdrop-blur-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm text-slate-800 placeholder:text-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200' 
                  : 'bg-white border border-pink-200 text-slate-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-slate-500 font-serif text-base">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl shadow-pink-100/40 border border-pink-100 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:border-pink-300 transition-all duration-300 group"
            >
              <div>
                <div className="relative h-64 overflow-hidden bg-pink-50">
                  <img
                    src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-pink-700 border border-pink-200 shadow-sm">
                    {product.category || "Handmade"}
                  </span>
                  <button
                    onClick={() => setActiveProduct(product)}
                    className="absolute bottom-4 right-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-pink-200 text-slate-700 hover:text-pink-600 shadow-lg transition-colors"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  <h2 className="font-serif text-xl font-bold text-slate-800 mb-2 group-hover:text-pink-600 transition-colors">
                    {product.name}
                  </h2>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex flex-col gap-3 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Price</span>
                  <span className="font-serif text-lg font-bold text-pink-600">₹{product.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-pink-50 border border-pink-200 text-pink-700 font-semibold text-xs hover:bg-pink-100 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add Bag
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuyNow(product)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-xs shadow-md shadow-pink-200 hover:shadow-lg transition-all"
                  >
                    Buy Now ✨
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <AnimatePresence>
        {activeProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-3xl bg-white border border-pink-100 max-w-2xl w-full overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2"
            >
              <div className="h-64 md:h-full bg-pink-50">
                <img
                  src={activeProduct.imageUrl || activeProduct.image}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                      {activeProduct.category}
                    </span>
                    <button 
                      onClick={() => setActiveProduct(null)}
                      className="text-slate-400 hover:text-slate-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-slate-800 mb-2">
                    {activeProduct.name}
                  </h3>
                  <p className="text-pink-600 font-serif text-xl font-bold mb-4">
                    ₹{activeProduct.price}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {activeProduct.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addToCart(activeProduct);
                      setActiveProduct(null);
                    }}
                    className="py-3 px-4 rounded-2xl bg-pink-50 border border-pink-200 text-pink-700 font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add Bag
                  </button>

                  <button
                    onClick={() => {
                      handleBuyNow(activeProduct);
                      setActiveProduct(null);
                    }}
                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-xs shadow-lg shadow-pink-200 flex items-center justify-center gap-1.5"
                  >
                    Buy Now ✨
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Products;