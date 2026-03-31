import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'belimaa-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        return current.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateItem = (_id, quantity) => {
    setItems((current) => current.map((item) => item._id === _id ? { ...item, quantity } : item).filter((item) => item.quantity > 0));
  };

  const removeItem = (_id) => setItems((current) => current.filter((item) => item._id !== _id));
  const clearCart = () => setItems([]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  return <CartContext.Provider value={{ items, addItem, updateItem, removeItem, clearCart, count, subtotal, shipping, total }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
