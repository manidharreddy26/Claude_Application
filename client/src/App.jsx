import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useApp } from './store.jsx';
import { Home, ProductPage } from './pages/Shop.jsx';
import { CartPage, CheckoutPage } from './pages/Cart.jsx';
import { LoginPage, RegisterPage } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Admin from './pages/Admin.jsx';

function Guard({ admin, children }) {
  const { user, ready } = useApp();
  if (!ready) return <p className="center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, logout, cartCount, wishlist } = useApp();
  const nav = useNavigate();
  return (
    <>
      <header className="nav">
        <Link to="/" className="logo">mani<span>.co</span></Link>
        <nav>
          <NavLink to="/">Shop</NavLink>
          <NavLink to="/wishlist">Wishlist{wishlist.length > 0 && <b className="pill">{wishlist.length}</b>}</NavLink>
          <NavLink to="/cart">Cart{cartCount > 0 && <b className="pill">{cartCount}</b>}</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/dashboard">{user.name.split(' ')[0]}</NavLink>
              <button className="link" onClick={() => { logout(); nav('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn small">Sign up</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/wishlist" element={<Guard><Dashboard tab="wishlist" /></Guard>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Guard><CheckoutPage /></Guard>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
          <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
          <Route path="*" element={<p className="center">Page not found. <Link to="/">Back to shop</Link></p>} />
        </Routes>
      </main>
      <footer className="foot">© {new Date().getFullYear()} mani.co · Everyday gems, delivered.</footer>
    </>
  );
}
