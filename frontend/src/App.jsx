import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Heart, ArrowRight, Truck, ShieldCheck, Package } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrackOrder from "./pages/TrackOrder";
import ProductDetail from "./pages/ProductDetails";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/40 via-white to-rose-50/30 text-slate-800 flex flex-col relative overflow-hidden selection:bg-pink-200 selection:text-pink-900">
      
      {/* Toast Notification Container */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(244, 114, 182, 0.2)',
            color: '#1e293b',
            borderRadius: '1.25rem',
            boxShadow: '0 20px 40px rgba(244, 114, 182, 0.15)',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />

      {/* 🌸 Ambient Glowing Background Orbs for Ultra-Modern Depth */}
      <div className="absolute top-10 left-10 w-[35rem] h-[35rem] bg-pink-300/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-[40rem] h-[40rem] bg-rose-300/20 rounded-full blur-[170px] pointer-events-none z-0" />
      <div className="absolute bottom-20 left-1/4 w-[35rem] h-[35rem] bg-purple-200/15 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* 🦋 Interactive Floating Butterflies Ecosystem */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100,
              scale: 0.6 + Math.random() * 0.4,
              rotate: 0 
            }}
            animate={{ 
              y: -120,
              x: `calc(${Math.sin(i) * 100}px + ${Math.random() * 100}vw)`,
              rotate: [0, 25, -25, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 12 + i * 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 2 
            }}
            className="absolute text-pink-400/35 text-3xl select-none drop-shadow-sm"
          >
            🦋
          </motion.div>
        ))}
      </div>

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow relative z-10 flex flex-col items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center w-full">
                
                {/* Hero Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex justify-center w-full"
                >
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/85 border border-pink-200/80 text-pink-700 text-xs font-black mb-8 uppercase tracking-[0.25em] shadow-xl shadow-pink-200/40 backdrop-blur-xl"
                  >
                    <Sparkles className="w-4 h-4 text-pink-500 animate-spin" /> Luxury Artisanal Goods 🦋🌸
                  </motion.span>
                </motion.div>

                {/* Hero Heading (Glitch-Free & Perfectly Centered) */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black text-pink-700 mb-8 leading-[1.15] tracking-tight text-center w-full drop-shadow-sm"
                >
                  Handmade Heaven <span className="inline-block animate-pulse text-rose-500">✨</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-12 font-normal text-center"
                >
                  Discover bespoke, hand-crafted masterpieces created with passion, love, and meticulous attention to detail. Elevate your lifestyle with authentic artisanal elegance.
                </motion.p>

                {/* Call to Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/products"
                      className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-sm shadow-xl shadow-pink-300/50 transition-all duration-300"
                    >
                      <ShoppingBag className="w-4 h-4" /> Explore Shop Collection <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/track-order"
                      className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/90 border-2 border-pink-200 text-pink-700 font-bold text-sm shadow-lg shadow-pink-100/50 backdrop-blur-xl transition-all duration-300"
                    >
                      <Truck className="w-4 h-4 text-pink-500" /> See My Orders 🦋
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Feature Highlights Grid */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-28 w-full text-left"
                >
                  <motion.div 
                    whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(244, 114, 182, 0.25)" }}
                    className="p-8 rounded-[2.5rem] bg-white/80 border border-pink-100 backdrop-blur-2xl shadow-xl shadow-pink-100/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-xl mb-4 shadow-inner">✨</div>
                    <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">100% Handcrafted</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-normal">Every individual piece is meticulously shaped and perfected by skilled artisans with absolute care.</p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(244, 114, 182, 0.25)" }}
                    className="p-8 rounded-[2.5rem] bg-white/80 border border-pink-100 backdrop-blur-2xl shadow-xl shadow-pink-100/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-xl mb-4 shadow-inner">🌿</div>
                    <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">Sustainable Materials</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-normal">Created using eco-friendly, premium-grade materials sourced ethically for long-lasting beauty.</p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(244, 114, 182, 0.25)" }}
                    className="p-8 rounded-[2.5rem] bg-white/80 border border-pink-100 backdrop-blur-2xl shadow-xl shadow-pink-100/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-xl mb-4 shadow-inner">🎁</div>
                    <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">Luxury Packaging</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-normal">Delivered safely in exquisite, gift-ready signature boutique boxes adorned with custom ribbons.</p>
                  </motion.div>
                </motion.div>

              </div>
            }
          />

          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track-order" element={<TrackOrder />} />

          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-pink-100 py-8 text-center text-slate-500 text-xs backdrop-blur-2xl relative z-10 shadow-lg">
        <p className="font-medium tracking-wide">
          © {new Date().getFullYear()} Handmade Heaven. Crafted with love & elegance 🌸
        </p>
      </footer>

    </div>
  );
}

export default App;