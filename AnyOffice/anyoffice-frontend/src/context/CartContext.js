import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CART_KEY = 'office_cart';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try { setCartItems(JSON.parse(stored)); } catch { localStorage.removeItem(CART_KEY); }
    }
    const handleLogout = () => {
      setCartItems([]);
      localStorage.removeItem(CART_KEY);
    };
    window.addEventListener('office-user-logout', handleLogout);
    return () => window.removeEventListener('office-user-logout', handleLogout);
  }, []);

  const persist = useCallback((items) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        updated = [...prev, { ...product, quantity }];
      }
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== productId);
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) => {
      const updated = prev.map((i) => i.id === productId ? { ...i, quantity } : i);
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
