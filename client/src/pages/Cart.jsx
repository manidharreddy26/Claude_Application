import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api';
import { useApp } from '../store.jsx';

export function CartPage() {
  const { cart, setQty, removeFromCart, cartTotal } = useApp();
  if (!cart.length)
    return <p className="center">Your cart is empty. <Link to="/">Find something you like</Link></p>;
  return (
    <section className="wrap narrow">
      <h2>Your cart</h2>
      {cart.map((i) => (
        <div className="line" key={i._id}>
          <img src={i.image} alt="" />
          <div className="grow"><strong>{i.name}</strong><br />{money(i.price)}</div>
          <input type="number" min="1" max={i.stock} value={i.qty} className="qty"
            onChange={(e) => setQty(i._id, +e.target.value || 1)} />
          <strong>{money(i.price * i.qty)}</strong>
          <button className="link" onClick={() => removeFromCart(i._id)}>Remove</button>
        </div>
      ))}
      <div className="total"><span>Subtotal</span><strong>{money(cartTotal)}</strong></div>
      <Link to="/checkout" className="btn block">Go to checkout</Link>
    </section>
  );
}

export function CheckoutPage() {
  const { cart, cartTotal, clearCart, user, notify } = useApp();
  const nav = useNavigate();
  const [a, setA] = useState({ fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [pay, setPay] = useState('COD');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setA({ ...a, [k]: e.target.value });

  if (done)
    return (
      <section className="wrap narrow center">
        <h2>Order placed 🎉</h2>
        <p>Order #{done._id.slice(-6).toUpperCase()} · {money(done.total)}</p>
        <Link to="/dashboard" className="btn">View my orders</Link>
      </section>
    );
  if (!cart.length) return <p className="center">Your cart is empty. <Link to="/">Back to shop</Link></p>;

  const place = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const order = await api('/orders', { method: 'POST', body: { items: cart, address: a, paymentMethod: pay } });
      clearCart(); setDone(order); notify('Order placed');
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <form className="wrap checkout" onSubmit={place}>
      <div>
        <h2>Delivery address</h2>
        <input placeholder="Full name" value={a.fullName} onChange={set('fullName')} required />
        <input placeholder="Phone number" value={a.phone} onChange={set('phone')} required />
        <input placeholder="Street address" value={a.street} onChange={set('street')} required />
        <div className="row gap">
          <input placeholder="City" value={a.city} onChange={set('city')} required />
          <input placeholder="State" value={a.state} onChange={set('state')} />
          <input placeholder="Pincode" value={a.pincode} onChange={set('pincode')} required />
        </div>
        <h2>Payment</h2>
        {[['COD', 'Cash on delivery'], ['UPI', 'UPI (demo)'], ['CARD', 'Card (demo)']].map(([v, l]) => (
          <label className="radio" key={v}><input type="radio" checked={pay === v} onChange={() => setPay(v)} /> {l}</label>
        ))}
      </div>
      <aside className="summary">
        <h2>Order summary</h2>
        {cart.map((i) => <div className="row" key={i._id}><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
        <div className="total"><span>Total</span><strong>{money(cartTotal)}</strong></div>
        {err && <p className="error">{err}</p>}
        <button className="btn block" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
      </aside>
    </form>
  );
}
