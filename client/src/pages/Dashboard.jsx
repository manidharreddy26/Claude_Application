import { useEffect, useState } from 'react';
import { api, money } from '../api';
import { useApp } from '../store.jsx';
import { ProductCard } from './Shop.jsx';

export default function Dashboard({ tab: initial = 'orders' }) {
  const { user, wishlist, notify } = useApp();
  const [tab, setTab] = useState(initial);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');

  const load = () => api('/orders/mine').then(setOrders).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => setTab(initial), [initial]);

  const cancel = async (id) => {
    try { await api(`/orders/${id}/cancel`, { method: 'PUT' }); notify('Order cancelled'); load(); }
    catch (e) { notify(e.message); }
  };
  const save = async (e) => {
    e.preventDefault();
    try { await api('/auth/me', { method: 'PUT', body: { name, password: password || undefined } }); setPassword(''); notify('Profile saved'); }
    catch (e) { notify(e.message); }
  };

  return (
    <section className="wrap">
      <h2>Hi, {user.name}</h2>
      <div className="stats">
        <div><b>{orders.length}</b>Orders</div>
        <div><b>{wishlist.length}</b>Wishlist items</div>
        <div><b>{money(orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0))}</b>Total spent</div>
      </div>
      <div className="tabs">
        {['orders', 'wishlist', 'profile'].map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {tab === 'orders' && (orders.length === 0 ? <p>No orders yet.</p> : orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="row">
            <strong>#{o._id.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString()}</strong>
            <span className={'status ' + o.status}>{o.status}</span>
          </div>
          {o.items.map((i, k) => <div key={k} className="row"><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
          <div className="row"><strong>Total {money(o.total)}</strong>
            {o.status === 'Placed' && <button className="link" onClick={() => cancel(o._id)}>Cancel order</button>}</div>
        </div>
      )))}

      {tab === 'wishlist' && (wishlist.length === 0 ? <p>Tap the heart on any product to save it here.</p> :
        <div className="grid">{wishlist.map((p) => <ProductCard key={p._id} p={p} />)}</div>)}

      {tab === 'profile' && (
        <form className="authbox" onSubmit={save}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
          <input value={user.email} disabled />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (optional)" />
          <button className="btn">Save changes</button>
        </form>
      )}
    </section>
  );
}
