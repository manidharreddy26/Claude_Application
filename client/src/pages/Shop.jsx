import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, money } from '../api';
import { useApp } from '../store.jsx';

export function ProductCard({ p }) {
  const { addToCart, toggleWish, isWished } = useApp();
  return (
    <article className="card">
      <Link to={`/product/${p._id}`} className="imgbox">
        <img src={p.image} alt={p.name} loading="lazy" />
        {p.stock < 1 && <span className="tag">Sold out</span>}
      </Link>
      <button className={'heart' + (isWished(p._id) ? ' on' : '')} onClick={() => toggleWish(p)}
        aria-label={isWished(p._id) ? 'Remove from wishlist' : 'Add to wishlist'}>
        {isWished(p._id) ? '♥' : '♡'}
      </button>
      <div className="info">
        <small>{p.category}</small>
        <Link to={`/product/${p._id}`}><h3>{p.name}</h3></Link>
        <div className="row">
          <strong>{money(p.price)}</strong>
          <button className="btn small" disabled={p.stock < 1} onClick={() => addToCart(p)}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}

export function Home() {
  const [data, setData] = useState({ products: [], categories: [] });
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api(`/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&sort=${sort}`)
        .then(setData).catch(() => {}).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, sort]);

  return (
    <>
      <section className="hero">
        <h1>Small things worth keeping.</h1>
        <p>Headphones, shoes, lamps and mugs — picked for people who like their everyday things to be good.</p>
      </section>
      <section className="wrap">
        <div className="filters">
          <input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>All</option>
            {data.categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>
        {loading ? <p className="center">Loading products…</p> :
          data.products.length === 0 ? <p className="center">No products match your search. Try another word.</p> :
          <div className="grid">{data.products.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
      </section>
    </>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');
  const { addToCart, toggleWish, isWished } = useApp();

  useEffect(() => { api('/products/' + id).then(setP).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <p className="center">{err}</p>;
  if (!p) return <p className="center">Loading…</p>;

  return (
    <section className="wrap detail">
      <img src={p.image} alt={p.name} />
      <div>
        <small>{p.category}</small>
        <h1>{p.name}</h1>
        <p className="price">{money(p.price)}</p>
        <p>{p.description}</p>
        <p className={p.stock > 0 ? 'ok' : 'bad'}>{p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}</p>
        <div className="row gap">
          <input type="number" min="1" max={p.stock} value={qty} className="qty"
            onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} />
          <button className="btn" disabled={p.stock < 1} onClick={() => addToCart(p, qty)}>Add to cart</button>
          <button className="btn ghost" onClick={() => toggleWish(p)}>
            {isWished(p._id) ? '♥ Saved' : '♡ Save to wishlist'}
          </button>
        </div>
      </div>
    </section>
  );
}
