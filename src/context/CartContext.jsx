import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const cartKey = user ? `freshmart_cart_${user.id}` : null;

  const [items, setItems] = useState([]);

  // Load cart whenever user changes (login/logout/switch)
  useEffect(() => {
    if (cartKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(cartKey) || '[]');
        setItems(saved);
      } catch {
        setItems([]);
      }
    } else {
      // No user logged in — clear cart from memory but don't touch storage
      setItems([]);
    }
  }, [cartKey]);

  // Save cart to user-specific key whenever items change
  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, cartKey]);

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};