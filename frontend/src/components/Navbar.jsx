import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sparkles, ShieldCheck, Package, LogOut, UserCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { totalItems } = useCart();
  const location = useLocation();

  const [customer, setCustomer] = useState(null);
  const [admin, setAdmin] = useState(null);

  const checkAuthStates = () => {
    // Check Customer
    const user = localStorage.getItem("customer");
    if (user) {
      try { setCustomer(JSON.parse(user)); } catch { setCustomer(user); }
    } else {
      setCustomer(null);
    }

    // Check Admin across multiple common storage keys for robust persistence
    const adminUser = localStorage.getItem("admin") || localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (adminUser) {
      try {
        setAdmin(JSON.parse(adminUser));
      } catch {
        setAdmin({ active: true }); // Fallback if token is stored as a raw string
      }
    } else {
      setAdmin(null);
    }
  };

  useEffect(() => {
    checkAuthStates();
  }, [location]);

  const logout = () => {
    localStorage.removeItem("customer");
    localStorage.removeItem("customerToken");
    setCustomer(null);
    window.location.href = "/";
  };

  const adminLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    setAdmin(null);
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-pink-100 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-200 group-hover:scale-105 transition-transform flex-shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate">
            <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-pink-700 block leading-none truncate">
              Handmade Heaven
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-400 font-semibold block truncate">
              Luxury Artisan Goods
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6">
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

        {/* Action Icons & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

          {/* 1. IF ADMIN IS LOGGED IN */}
          {admin ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold shadow-sm">
                <UserCheck className="w-3.5 h-3.5" />
                Admin Session
              </div>

              <Link
                to="/admin/orders"
                className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition text-xs sm:text-sm font-medium shadow-sm"
              >
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Dashboard</span>
              </Link>

              <button
                object="true"
                onClick={adminLogout}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition text-xs sm:text-sm font-medium"
                title="Admin Logout"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : customer ? (
            /* 2. IF CUSTOMER IS LOGGED IN */
            <>
              <Link
                to="/track-order"
                className="px-2.5 sm:px-4 py-2 rounded-xl border border-pink-200 text-pink-600 hover:bg-pink-50 transition text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                My Orders
              </Link>

              <button
                onClick={logout}
                className="px-2.5 sm:px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition text-xs sm:text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            /* 3. IF NO ONE IS LOGGED IN */
            <>
              <Link
                to="/products"
                className="lg:hidden px-2.5 py-2 rounded-xl border border-pink-200 text-pink-600 hover:bg-pink-50 transition text-xs font-medium"
              >
                Shop
              </Link>

              <Link
                to="/login"
                className="px-2.5 sm:px-4 py-2 rounded-xl border border-pink-200 text-pink-600 hover:bg-pink-50 transition text-xs sm:text-sm font-medium"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="hidden sm:inline-block px-4 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600 transition text-sm font-medium shadow-sm"
              >
                Register
              </Link>

              <Link
                to="/admin/login"
                className="p-2.5 sm:p-3 rounded-2xl bg-pink-50 border border-pink-200 text-slate-700 hover:text-pink-600 hover:bg-pink-100 transition-all shadow-sm"
                title="Admin Login"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            </>
          )}

          {/* Cart Icon (Always visible & fixed size so it never pushes off-screen) */}
          <Link
            to="/cart"
            className="relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200 hover:scale-105 transition-transform flex-shrink-0"
            title="Cart"
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