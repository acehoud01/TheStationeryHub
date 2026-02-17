import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * Cart Context
 * 
 * Manages shopping cart state with localStorage persistence.
 * 
 * Features:
 * - Add items to cart
 * - Update item quantities
 * - Remove items from cart
 * - Calculate subtotal, VAT, and total
 * - Persist cart in localStorage
 * - Clear cart
 * 
 * Cart item schema:
 * {
 *   id: number,
 *   name: string,
 *   price: number,
 *   quantity: number,
 *   category: string,
 *   brand: string,
 *   imageUrl: string
 * }
 */

const CartContext = createContext();

// VAT rate (15%)
const VAT_RATE = 0.15;

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  // Listen for storage changes (e.g., cart cleared in another tab or on logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart' && e.newValue === null) {
        // Cart was removed from localStorage (logout)
        setCartItems([]);
      }
    };

    const handleLogout = () => {
      // Clear cart state when user logs out
      setCartItems([]);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-logout', handleLogout);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-logout', handleLogout);
    };
  }, []);

  /**
   * Load cart from localStorage
   */
  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate it's an array
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('cart');
    }
  };

  /**
   * Save cart to localStorage
   */
  const saveCart = (items) => {
    try {
      if (items.length === 0) {
        // Remove cart from localStorage if empty
        localStorage.removeItem('cart');
      } else {
        localStorage.setItem('cart', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  /**
   * Add item to cart
   * If item already exists, increment quantity
   */
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === item.id);

      if (existingIndex > -1) {
        // Item exists, increment quantity
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += 1;
        return updatedItems;
      } else {
        // New item, add with quantity 1
        return [
          ...prevItems,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            category: item.category || '',
            brand: item.brand || '',
            imageUrl: item.imageUrl || null,
          },
        ];
      }
    });
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  /**
   * Update item quantity
   * If quantity becomes 0, remove item
   */
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 0) return;

    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  /**
   * Increment item quantity
   */
  const incrementQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  /**
   * Decrement item quantity
   * If quantity becomes 0, remove item
   */
  const decrementQuantity = (itemId) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.id === itemId);
      if (!item) return prevItems;

      if (item.quantity <= 1) {
        // Remove item if quantity would become 0
        return prevItems.filter((i) => i.id !== itemId);
      }

      return prevItems.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  /**
   * Get total number of items in cart
   */
  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Calculate subtotal (before VAT)
   */
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  /**
   * Calculate VAT amount
   */
  const getVAT = () => {
    return getSubtotal() * VAT_RATE;
  };

  /**
   * Calculate total (subtotal + VAT)
   */
  const getTotal = () => {
    return getSubtotal() + getVAT();
  };

  /**
   * Check if item is in cart
   */
  const isInCart = (itemId) => {
    return cartItems.some((item) => item.id === itemId);
  };

  /**
   * Get item quantity in cart
   */
  const getItemQuantity = (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getVAT,
    getTotal,
    isInCart,
    getItemQuantity,
    VAT_RATE,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
