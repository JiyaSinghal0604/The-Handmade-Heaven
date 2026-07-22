import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();
const CART_STORAGE_KEY = 'handmade-heaven-cart';

// Helper: normalize id field to a single string key
const getId = (p) => (p && (p._id || p.id || p.productId || p.product_id || '')).toString();

// Load cart from localStorage with validation
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Normalize items: ensure id field consistent and quantity present
    return parsed
      .map((it) => {
        const id = getId(it);
        if (!id) return null;
        return {
          ...it,
          _id: id,
          id,
          quantity: Number(it.quantity || it.qty || 0) || 0,
          price: Number(it.price || 0) || 0,
        };
      })
      .filter(Boolean)
      .filter((it) => it.quantity > 0);
  } catch (error) {
    console.error('Failed to parse stored cart:', error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  // initialize lazily to avoid reading localStorage on server or before mount
  const [cart, setCart] = useState(() => loadCartFromStorage());

  // Keep localStorage in sync with cart state
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to persist cart:', error);
    }
  }, [cart]);

  // Add item to cart; if exists increment quantity
  const addToCart = useCallback((product, qty = 1) => {
    if (!product) return;
    const id = getId(product);
    if (!id) {
      console.warn('Product missing id, cannot add to cart', product);
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((it) => getId(it) === id);
      if (existing) {
        return prevCart.map((it) =>
          getId(it) === id ? { ...it, quantity: Math.max(1, (it.quantity || 0) + qty) } : it
        );
      }
      // normalize product before adding
      const normalized = {
        ...product,
        _id: id,
        id,
        quantity: Math.max(1, Number(qty) || 1),
        price: Number(product.price || product.cost || 0) || 0,
      };
      return [...prevCart, normalized];
    });
    toast.success(`Added "${product.name || product.title || 'item'}" to your cart! 🛍️`);
  }, []);

  // Remove item by id
  const removeFromCart = useCallback((productId) => {
    if (!productId) return;
    const id = productId.toString();
    setCart((prevCart) => prevCart.filter((item) => getId(item) !== id));
    toast.success('Removed item from cart.');
  }, []);

  // Update quantity: delta can be positive or negative; set exact if third arg provided
  const updateQuantity = useCallback((productId, deltaOrQty, setExact = false) => {
    if (!productId) return;
    const id = productId.toString();
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (getId(item) !== id) return item;
          const current = Number(item.quantity || 0);
          const newQty = setExact ? Math.max(0, Number(deltaOrQty) || 0) : Math.max(0, current + Number(deltaOrQty) || 0);
          return { ...item, quantity: newQty };
        })
        .filter((it) => it.quantity > 0)
    );
  }, []);

  // Clear cart completely
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Derived totals (memoization not necessary for small carts but kept simple)
  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);