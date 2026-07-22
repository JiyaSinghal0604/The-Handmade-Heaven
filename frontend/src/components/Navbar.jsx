import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-pink-700 block leading-none">
              Handmade Heaven
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
              Luxury Artisan Goods
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-pink-600 font-semibold' : 'text-slate-600 hover:text-pink-600'
            }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`text-sm font-medium transition-colors ${
              isActive('/products') ? 'text-pink-600 font-semibold' : 'text-slate-600 hover:text-pink-600'
            }`}
          >
            Shop Collection
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin/login"
            className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-slate-700 hover:text-pink-600 hover:bg-pink-100 transition-all shadow-sm"
            title="Admin Dashboard"
          >
            <ShieldCheck className="w-4 h-4" />
          </Link>

          <Link
            to="/cart"
            className="relative p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200 hover:scale-105 transition-transform"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-md"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}