import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store.jsx';

function AuthForm({ mode }) {
  const reg = mode === 'register';
  const { login } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const data = await api(reg ? '/auth/register' : '/auth/login', { method: 'POST', body: f });
      login(data);
      nav(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <form className="authbox" onSubmit={submit}>
      <h2>{reg ? 'Create your account' : 'Welcome back'}</h2>
      {reg && <input placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />}
      <input type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
      <input type="password" placeholder="Password (min 6 characters)" value={f.password}
        onChange={(e) => setF({ ...f, password: e.target.value })} required />
      {err && <p className="error">{err}</p>}
      <button className="btn block" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Sign up' : 'Login'}</button>
      <p>{reg ? <>Already a member? <Link to="/login">Login</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
    </form>
  );
}

export const LoginPage = () => <AuthForm mode="login" />;
export const RegisterPage = () => <AuthForm mode="register" />;
