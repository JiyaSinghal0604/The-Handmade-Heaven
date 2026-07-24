import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext.jsx';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <CartProvider>
        <App />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff0f3',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              borderRadius: '12px',
              fontFamily: 'system-ui, sans-serif',
            },
          }}
        />
      </CartProvider>
    </Router>
  </StrictMode>,
)