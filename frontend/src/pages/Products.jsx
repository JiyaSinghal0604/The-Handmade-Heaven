import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShoppingBag, Search, Loader2, Heart, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
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
    const desc = item.description || item.desc || '';
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-6 bg-gradient-to-b from-pink-50/50 via-white to-pink-50/30">
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            filter: ["drop-shadow(0 0 10px rgba(244,114,182,0.5))", "drop-shadow(0 0 25px rgba(236,72,153,0.8))", "drop-shadow(0 0 10px rgba(244,114,182,0.5))"]
          }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Sparkles className="w-14 h-14 text-pink-500" />
        </motion.div>
        <p className="text-pink-600 font-serif text-sm tracking-[0.3em] uppercase font-semibold animate-pulse">
          Crafting Magic 🦋...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6 max-w-7xl mx-auto relative overflow-hidden bg-gradient-to-br from-pink-50/40 via-white to-rose-50/30">
      
      {/* 🌸 Ambient Glowing Background Orbs for Ultra-Modern Depth */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-pink-300/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-rose-300/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-purple-200/10 rounded-full blur-[180px] pointer-events-none" />

      {/* 🦋 Interactive Floating Butterflies Ecosystem */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl select-none opacity-30 drop-shadow-md"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * 1000,
              rotate: Math.random() * 45
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, (i % 2 === 0 ? 40 : -40), 0],
              rotate: [0, 25, -25, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{
              duration: 7 + (i * 1.5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          >
            🦋
          </motion.div>
        ))}
      </div>

      {/* Boutique Header */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-20 relative z-10"
      >
        <motion.div 
          whileHover={{ scale: 1.08, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/80 border border-pink-200/80 text-pink-700 text-xs font-bold mb-6 uppercase tracking-[0.2em] shadow-xl shadow-pink-200/50 backdrop-blur-xl cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-pink-500 animate-spin" /> Handmade Heaven Boutique 🦋🌸
        </motion.div>
        
        <h1 className="font-serif text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 mb-6 leading-tight drop-shadow-sm">
          Artisanal Masterpieces
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed font-normal">
          Immerse yourself in a curated world of luxury handcrafted creations, woven with passion, patience, and exquisite detail.
        </p>
      </motion.div>

      {/* Ultra-Modern Glassmorphic Search & Category Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-16 p-5 rounded-[2.5rem] bg-white/70 border border-white shadow-[0_20px_50px_rgba(244,114,182,0.15)] backdrop-blur-2xl relative z-10"
      >
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <input
            type="text"
            placeholder="Search magical pieces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-pink-50/50 border border-pink-200/60 rounded-2xl text-sm text-slate-800 placeholder:text-pink-300 focus:outline-none focus:ring-4 focus:ring-pink-400/30 focus:border-pink-400 transition-all shadow-inner font-medium"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-7 py-3.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                  isActive 
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-xl shadow-pink-400/40 ring-2 ring-pink-300/60' 
                    : 'bg-white/90 border border-pink-100 text-slate-600 hover:text-pink-600 hover:bg-pink-50/80 shadow-md'
                }`}
              >
                {isActive && <span>🦋</span>}
                {cat === 'All' ? '✨ All Collections' : cat}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Products Grid with 3D Parallax & Scroll Reveal Effects */}
      {filteredProducts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 bg-white/50 rounded-[3rem] backdrop-blur-xl border border-pink-100 shadow-xl relative z-10"
        >
          <div className="text-4xl mb-4">🦋</div>
          <p className="text-slate-600 font-serif text-xl mb-2 font-bold">No masterpieces found matching your criteria</p>
          <span className="text-xs text-pink-500 font-semibold uppercase tracking-widest">Try exploring another category or keyword!</span>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
          {filteredProducts.map((product, index) => {
            const productId = product._id || product.id;
            return (
              <motion.div
                key={productId}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.02,
                  boxShadow: "0 30px 60px -15px rgba(244, 114, 182, 0.35)" 
                }}
                className="bg-white/95 rounded-[2.5rem] border border-pink-100/80 overflow-hidden flex flex-col justify-between backdrop-blur-2xl transition-all duration-500 group shadow-xl shadow-pink-100/50 relative"
              >
                <div>
                  {/* Image Container with Floating Quick-View Icon & Zoom */}
                  <Link 
                    to={`/product/${productId}`}
                    className="relative h-80 overflow-hidden bg-gradient-to-br from-pink-50/80 to-rose-100/50 block cursor-pointer"
                  >
                    <motion.img
                      whileHover={{ scale: 1.12 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Floating Category Tag */}
                    <div className="absolute top-5 left-5 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-pink-700 border border-pink-200/85 shadow-lg text-[10px] uppercase font-black tracking-widest">
                      <span>🦋</span> {product.category || "Handmade"}
                    </div>

                    {/* Quick View Hover Indicator */}
                    <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-pink-200 flex items-center justify-center text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </Link>

                  <div className="p-8">
                    <Link to={`/product/${productId}`}>
                      <h2 className="font-serif text-2xl font-bold text-slate-800 mb-3 group-hover:text-pink-600 transition-colors cursor-pointer truncate">
                        {product.name}
                      </h2>
                    </Link>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-normal mb-2">
                      {product.description || product.desc || "Exquisite handcrafted artisanal piece crafted with absolute love."}
                    </p>
                  </div>
                </div>

                <div className="p-8 pt-0 flex flex-col gap-5 mt-auto">
                  <div className="flex justify-between items-center bg-pink-50/60 px-5 py-3 rounded-2xl border border-pink-100/80">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-extrabold">Price</span>
                    <span className="font-serif text-2xl font-black text-pink-600">₹{product.price}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <motion.button
                      whileHover={{ scale: 1.04, backgroundColor: "#fdf2f8", borderColor: "#f472b6" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product)}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-pink-200 text-pink-700 font-bold text-xs shadow-sm transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add Bag
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: "0 15px 30px -5px rgba(244, 63, 94, 0.45)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBuyNow(product)}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-300/50 transition-all"
                    >
                      Buy Now ✨
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;