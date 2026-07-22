import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Heart, ArrowRight } from "lucide-react";
import {Toaster} from "react-hot-toast";

import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrackOrder from "./pages/TrackOrder";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/40 to-pink-100/30 text-slate-800 flex flex-col relative overflow-hidden">
      
      {/* Floating Background Butterflies */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100,
              scale: 0.5 + Math.random() * 0.5,
              rotate: 0 
            }}
            animate={{ 
              y: -100,
              x: `calc(${Math.sin(i) * 120}px + ${Math.random() * 100}vw)`,
              rotate: [0, 20, -20, 0]
            }}
            transition={{ 
              duration: 14 + i * 4, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 3 
            }}
            className="absolute text-pink-400/30 text-2xl select-none"
          >
            🦋
          </motion.div>
        ))}
      </div>

      <Navbar />

      <main className="flex-grow relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
                
                {/* Hero Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-xs font-semibold mb-6 tracking-wider uppercase shadow-sm backdrop-blur-md"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Luxury Artisanal Goods 🦋
                </motion.div>

                {/* Hero Heading */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="font-serif text-5xl sm:text-7xl font-bold text-pink-700 mb-6 tracking-tight drop-name"
                >
                  Handmade Heaven <span className="inline-block animate-pulse">🌸</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 font-light"
                >
                  Discover bespoke, hand-crafted masterpieces created with passion, love, and meticulous attention to detail. Elevate your lifestyle with authentic artisanal elegance.
                </motion.p>

                {/* Call to Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center gap-4"
                >
                  <Link 
                    to="/products"
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-xl shadow-pink-200 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <ShoppingBag className="w-4 h-4" /> Explore Shop Collection <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link 
                    to="/products"
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white border border-pink-200 text-pink-700 font-semibold text-sm shadow-sm hover:bg-pink-50 hover:scale-105 transition-all duration-300"
                  >
                    <Heart className="w-4 h-4 text-pink-500" /> View Catalog
                  </Link>
                </motion.div>

                {/* Feature Highlights Grid */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 w-full text-left"
                >
                  <div className="p-6 rounded-3xl bg-white/70 border border-pink-100 backdrop-blur-xl shadow-xl shadow-pink-100/40">
                    <span className="text-2xl mb-3 block">✨</span>
                    <h3 className="font-serif text-lg font-bold text-slate-800 mb-2">100% Handcrafted</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">Every individual piece is meticulously shaped and perfected by skilled artisans.</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/70 border border-pink-100 backdrop-blur-xl shadow-xl shadow-pink-100/40">
                    <span className="text-2xl mb-3 block">🌿</span>
                    <h3 className="font-serif text-lg font-bold text-slate-800 mb-2">Sustainable Materials</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">Created using eco-friendly, premium-grade materials sourced ethically.</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/70 border border-pink-100 backdrop-blur-xl shadow-xl shadow-pink-100/40">
                    <span className="text-2xl mb-3 block">🎁</span>
                    <h3 className="font-serif text-lg font-bold text-slate-800 mb-2">Luxury Packaging</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">Delivered in exquisite, gift-ready signature boxes with custom ribbons.</p>
                  </div>
                </motion.div>

              </div>
            }
          />

          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track-order" element={<TrackOrder />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>

      <footer className="bg-white/80 border-t border-pink-100 py-6 text-center text-slate-500 text-xs backdrop-blur-md relative z-10">
        © {new Date().getFullYear()} Handmade Heaven. Crafted with love & elegance 🌸
      </footer>

    </div>
  );
}

export default App;