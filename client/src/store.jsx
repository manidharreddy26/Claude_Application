import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState('');
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api('/auth/me')
      .then((u) => { setUser(u); return api('/wishlist').then(setWishlist); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true));
  }, []);

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    setUser(user);
    api('/wishlist').then(setWishlist).catch(() => {});
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); setWishlist([]); };

  const addToCart = (p, qty = 1) => {
    if (p.stock < 1) return notify('Out of stock');
    setCart((c) => {
      const found = c.find((x) => x._id === p._id);
      if (found) return c.map((x) => (x._id === p._id ? { ...x, qty: Math.min(x.qty + qty, p.stock) } : x));
      return [...c, { _id: p._id, name: p.name, price: p.price, image: p.image, stock: p.stock, qty }];
    });
    notify('Added to cart');
  };
  const setQty = (id, qty) =>
    setCart((c) => c.map((x) => (x._id === id ? { ...x, qty: Math.max(1, Math.min(qty, x.stock)) } : x)));
  const removeFromCart = (id) => setCart((c) => c.filter((x) => x._id !== id));
  const clearCart = () => setCart([]);

  const isWished = (id) => wishlist.some((w) => w._id === id);
  const toggleWish = async (p) => {
    if (!user) return notify('Login to use your wishlist');
    try {
      setWishlist(await api(`/wishlist/${p._id}`, { method: isWished(p._id) ? 'DELETE' : 'POST' }));
      notify(isWished(p._id) ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch (e) { notify(e.message); }
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Ctx.Provider value={{ user, ready, login, logout, cart, cartCount, cartTotal, addToCart, setQty, removeFromCart,
      clearCart, wishlist, isWished, toggleWish, notify }}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </Ctx.Provider>
  );
}
