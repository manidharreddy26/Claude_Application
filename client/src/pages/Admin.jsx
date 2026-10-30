import { useEffect, useState } from 'react';
import { api, money } from '../api';
import { useApp } from '../store.jsx';

const empty = { name: '', price: '', stock: '', category: '', image: '', description: '' };
const STATUS = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function Admin() {
  const { notify } = useApp();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const loadAll = () => {
    api('/admin/stats').then(setStats).catch((e) => notify(e.message));
    api('/products').then((d) => setProducts(d.products));
    api('/admin/orders').then(setOrders);
    api('/admin/users').then(setUsers);
  };
  useEffect(loadAll, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) || 0 };
    try {
      if (editId) await api('/products/' + editId, { method: 'PUT', body });   // UPDATE
      else await api('/products', { method: 'POST', body });                  // CREATE
      notify(editId ? 'Product updated' : 'Product added');
      setForm(empty); setEditId(null); loadAll();
    } catch (e) { notify(e.message); }
  };
  const edit = (p) => { setEditId(p._id); setForm({ ...empty, ...p }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const del = async (p) => {                                                    // DELETE
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api('/products/' + p._id, { method: 'DELETE' }); notify('Product deleted'); loadAll(); }
    catch (e) { notify(e.message); }
  };
  const setStatus = async (id, status) => {
    try { await api('/admin/orders/' + id, { method: 'PUT', body: { status } }); notify('Order updated'); loadAll(); }
    catch (e) { notify(e.message); }
  };
  const delUser = async (u) => {
    if (!confirm(`Delete ${u.email}?`)) return;
    try { await api('/admin/users/' + u._id, { method: 'DELETE' }); notify('User deleted'); loadAll(); }
    catch (e) { notify(e.message); }
  };
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <section className="wrap">
      <h2>Admin dashboard</h2>
      <div className="tabs">
        {['overview', 'products', 'orders', 'users'].map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="stats">
            <div><b>{money(stats.revenue)}</b>Revenue</div>
            <div><b>{stats.orders}</b>Orders</div>
            <div><b>{stats.products}</b>Products</div>
            <div><b>{stats.users}</b>Customers</div>
          </div>
          <h3>Recent orders</h3>
          {stats.recent.map((o) => (
            <div className="row order" key={o._id}>
              <span>#{o._id.slice(-6).toUpperCase()} · {o.user?.name || 'Deleted user'}</span>
              <span>{money(o.total)}</span><span className={'status ' + o.status}>{o.status}</span>
            </div>
          ))}
        </>
      )}

      {tab === 'products' && (
        <>
          <form className="pform" onSubmit={saveProduct}>
            <h3>{editId ? 'Edit product' : 'Add a product'}</h3>
            <input placeholder="Name" value={form.name} onChange={f('name')} required />
            <div className="row gap">
              <input type="number" min="0" placeholder="Price (₹)" value={form.price} onChange={f('price')} required />
              <input type="number" min="0" placeholder="Stock" value={form.stock} onChange={f('stock')} />
              <input placeholder="Category" value={form.category} onChange={f('category')} />
            </div>
            <input placeholder="Image URL" value={form.image} onChange={f('image')} />
            <textarea placeholder="Description" rows="3" value={form.description} onChange={f('description')} />
            <div className="row gap">
              <button className="btn">{editId ? 'Save changes' : 'Add product'}</button>
              {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
            </div>
          </form>
          <div className="scroll">
            <table>
              <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.image} alt="" className="thumb" /></td>
                    <td>{p.name}</td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td>
                    <td><button className="link" onClick={() => edit(p)}>Edit</button>{' '}
                      <button className="link danger" onClick={() => del(p)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (orders.length === 0 ? <p>No orders yet.</p> : (
        <div className="scroll"><table>
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-6).toUpperCase()}</td>
              <td>{o.user?.name}<br /><small>{o.address?.city}, {o.address?.pincode}</small></td>
              <td>{o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
              <td>{money(o.total)}</td>
              <td><select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
                {STATUS.map((s) => <option key={s}>{s}</option>)}</select></td>
            </tr>))}</tbody>
        </table></div>
      ))}

      {tab === 'users' && (
        <div className="scroll"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>{u.role !== 'admin' && <button className="link danger" onClick={() => delUser(u)}>Delete</button>}</td></tr>))}
          </tbody>
        </table></div>
      )}
    </section>
  );
}
