import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const C = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('nexa_user') || 'null'));
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);

  const save = (u, t) => {
    setUser(u);
    if (u) localStorage.setItem('nexa_user', JSON.stringify(u));
    else localStorage.removeItem('nexa_user');
    if (t) localStorage.setItem('nexa_token', t);
  };

  async function refresh() {
    if (!user) return;
    try {
      const [c, w] = await Promise.all([api.get('/cart'), api.get('/wishlist')]);
      setCart(c.data);
      setWishlist(w.data);
    } catch {}
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function login(email, password) {
    const r = await api.post('/auth/login', {
      email: String(email).trim().toLowerCase(),
      password
    });
    save(r.data.user, r.data.token);
    toast.success('Welcome back!');
  }

  async function register(name, email, password) {
    const r = await api.post('/auth/register', {
      name,
      email: String(email).trim().toLowerCase(),
      password
    });
    save(r.data.user, r.data.token);
    toast.success('Account ready');
  }

  function logout() {
    localStorage.removeItem('nexa_token');
    save(null);
    setCart(null);
    setWishlist(null);
    toast.success('Logged out');
  }

  async function addCart(productId) {
    try {
      const r = await api.post('/cart', { productId, quantity: 1 });
      setCart(r.data);
      toast.success('Added to cart');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not add to cart');
    }
  }

  async function toggleWish(productId) {
    try {
      const r = await api.post('/wishlist/toggle', { productId });
      setWishlist(r.data);
      toast.success('Wishlist updated');
    } catch {
      toast.error('Please login first');
    }
  }

  return (
    <C.Provider value={{ user, cart, wishlist, login, register, logout, refresh, addCart, toggleWish }}>
      {children}
    </C.Provider>
  );
}

export const useApp = () => useContext(C);
