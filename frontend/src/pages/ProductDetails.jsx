import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Zap, Truck, ArrowLeft, Plus, Minus, Loader2, Sparkles, ShieldCheck, Package } from "lucide-react";
import API from "../services/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products/${id}`);
      setProduct(res.data.product || res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching product details:", err);
      toast.error("Could not load product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
      toast.success("Added to your magical bag! 🛍️✨");
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart({ ...product, quantity });
      navigate('/cart');
    }
  };

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
          Loading Masterpiece 🦋...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-pink-50/40 via-white to-rose-50/30">
        <div className="text-4xl">🦋</div>
        <p className="text-slate-700 font-serif text-xl font-bold">Product not found in our boutique.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)} 
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-300/50"
        >
          ← Back to Collection
        </motion.button>
      </div>
    );
  }

  const descriptionText = product.description || product.desc || "No description provided by the artisan.";
  const attributesList = product.attributes || product.specs || [];

  return (
    <div className="min-h-screen py-16 px-6 max-w-6xl mx-auto relative overflow-hidden bg-gradient-to-br from-pink-50/40 via-white to-rose-50/30">
      
      {/* 🌸 Ambient Glowing Background Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[30rem] h-[30rem] bg-rose-300/20 rounded-full blur-[150px] pointer-events-none" />

      {/* 🦋 Floating Background Butterflies */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl select-none opacity-25"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * 800,
              rotate: Math.random() * 30
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, (i % 2 === 0 ? 35 : -35), 0],
              rotate: [0, 20, -20, 0]
            }}
            transition={{
              duration: 6 + (i * 1.5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6
            }}
          >
            🦋
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8 relative z-10"
      >
        <motion.button 
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 border border-pink-200/80 text-xs font-bold text-slate-600 hover:text-pink-600 transition shadow-md shadow-pink-100/50 backdrop-blur-xl"
        >
          <ArrowLeft className="w-4 h-4 text-pink-500" /> Back to Collection
        </motion.button>
      </motion.div>

      {/* Main Glassmorphic Detail Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/90 p-8 sm:p-10 rounded-[3rem] border border-pink-100/80 shadow-[0_30px_60px_rgba(244,114,182,0.18)] backdrop-blur-2xl relative z-10"
      >
        {/* Product Image Container with Zoom */}
        <div className="bg-gradient-to-br from-pink-50/85 to-rose-100/50 rounded-[2.2rem] overflow-hidden h-[450px] flex items-center justify-center border border-pink-100/85 shadow-inner relative group">
          <motion.img 
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600"} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-pink-700 border border-pink-200 shadow-md text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5">
            <span>🦋</span> {product.category || "Handmade"}
          </div>
        </div>

        {/* Product Info & Interactive Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight">{product.name}</h1>
            
            <div className="flex items-center justify-between bg-pink-50/60 px-5 py-3.5 rounded-2xl border border-pink-100/80">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-extrabold">Artisanal Price</span>
              <span className="font-serif text-3xl font-black text-pink-600">₹{product.price}</span>
            </div>
            
            {/* Description */}
            <div className="space-y-1.5 pt-2">
              <h4 className="text-[10px] uppercase font-bold text-pink-500 tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Description
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">{descriptionText}</p>
            </div>

            {/* Custom Specifications / Attributes */}
            {attributesList.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-pink-100/60">
                <h4 className="text-[10px] uppercase font-bold text-pink-500 tracking-widest flex items-center gap-1">
                  <Package className="w-3 h-3" /> Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {attributesList.map((attr, index) => (
                    <div key={index} className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100/80 shadow-sm">
                      <span className="text-slate-400 block mb-0.5 font-medium">{attr.label || attr.key}</span>
                      <span className="font-bold text-slate-800">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Policy Banner */}
            <div className="bg-gradient-to-r from-pink-50/80 via-white to-pink-50/50 p-4.5 rounded-2xl border border-pink-200/70 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <Truck className="w-4 h-4 text-pink-600" /> Free Delivery & Shipping Guarantee 🦋
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="text-emerald-600 font-extrabold">FREE Delivery</span> within Muzaffarnagar. Flat <span className="font-bold text-slate-700">₹150</span> shipping fee applies for all other locations.
              </p>
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-5 pt-4 border-t border-pink-100/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Select Quantity</span>
              <div className="flex items-center border-2 border-pink-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-slate-600 hover:bg-pink-50 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="px-5 text-sm font-black text-slate-800">{quantity}</span>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-pink-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#fdf2f8", borderColor: "#f472b6" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="py-4 px-4 rounded-2xl bg-white border-2 border-pink-200 text-pink-700 font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add Bag
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 15px 30px -5px rgba(244, 63, 94, 0.45)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyNow}
                className="py-4 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-300/50 transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Buy Now ✨
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetail;