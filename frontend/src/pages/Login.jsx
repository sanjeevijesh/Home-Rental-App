// FILE: src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ROLES = [
  { value: 'tenant', label: 'Tenant', icon: '🏠', desc: 'Looking for a house' },
  { value: 'owner', label: 'Owner', icon: '🔑', desc: 'I have a property' },
  { value: 'scout', label: 'Scout', icon: '📸', desc: 'I spot vacancies' },
];

export default function Login() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', role: 'tenant',
  });

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await login({ email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Name is required'); return; }
    if (!form.email || !form.password) { setError('Email & password required'); return; }
    setLoading(true); setError(null);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
      // Auto-login after registration
      await login({ email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 gradient-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-2xl">🏘</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-surface-700/50 mt-1">
            {mode === 'login' ? 'Sign in to continue' : 'Join NearbyRental Tuticorin'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in">{error}</div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com" className="input-field" required id="login-email" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                placeholder="••••••••" className="input-field" required id="login-password" />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5" id="login-submit">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                placeholder="Your name" className="input-field" required id="register-name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com" className="input-field" required id="register-email" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                placeholder="Min 6 characters" className="input-field" required minLength={6} id="register-password" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210" className="input-field" inputMode="tel" id="register-phone" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon, desc }) => (
                  <button key={value} type="button" onClick={() => update('role', value)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      form.role === value ? 'gradient-brand text-white shadow-lg shadow-brand-500/20' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                    }`}>
                    <span className="block text-lg mb-1">{icon}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5" id="register-submit">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggle mode */}
        <p className="text-sm text-center text-surface-700/50 mt-6">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="font-semibold text-brand-600 hover:text-brand-700">
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
