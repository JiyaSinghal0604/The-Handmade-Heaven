import React, { useState } from 'react';
import { motion, useDeprecatedAnimatedState } from 'framer-motion';
import { Lock, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState(''); // Can be email, username, or name depending on your backend
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Check what key your backend login route expects: { email, password } or { username, password } or { name, password }
      // Adjust the key below to match your backend controller (e.g., username: identifier or email: identifier)
      const response = await API.post('/auth/admin/login', { 
        username: identifier,
        password 
      });
      
      const token = response.data.token || response.data.accessToken;
      if (token) {
        localStorage.setItem('adminToken', token);
        toast.success('Welcome back, Admin! 🌸');
        navigate('/admin/dashboard');
      } else {
        toast.error('Authentication token not received.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-pink-100 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 to-rose-300 flex items-center justify-center text-white mx-auto mb-4 shadow-md shadow-pink-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-800">Admin Portal</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage Handmade Heaven</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Admin Username / Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
              <input
                type="text"
                required
                placeholder="Enter your admin name"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-pink-50/30 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-pink-50/30 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all text-slate-700"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white py-3.5 px-6 rounded-2xl font-semibold shadow-lg shadow-pink-200 transition-all duration-300 text-sm tracking-wide disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}