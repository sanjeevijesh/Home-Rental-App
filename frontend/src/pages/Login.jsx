// FILE: src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ROLES = [
  { value: 'tenant', label: 'Tenant', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ), desc: 'Looking for a house' },
  { value: 'owner', label: 'Owner', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ), desc: 'I have a property' },
  { value: 'scout', label: 'Scout', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ), desc: 'I spot vacancies' },
];

function InputField({ label, id, ...props }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} className="input-field" {...props} />
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', role: 'tenant',
  });

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }));

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
    if (!form.name)                { setError('Name is required'); return; }
    if (!form.email || !form.password) { setError('Email & password required'); return; }
    setLoading(true); setError(null);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
      await login({ email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 4rem)',
        display: 'flex',
        background: 'var(--c-cream)',
      }}
    >
      {/* Left decorative panel – desktop only */}
      <div
        className="hidden lg:flex"
        style={{
          width: '42%',
          background: 'var(--c-rust)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 52px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        {[
          { size: 400, top: -120, right: -120, opacity: 0.08 },
          { size: 240, bottom: 60, left: -80, opacity: 0.1 },
          { size: 160, top: '50%', left: '60%', opacity: 0.06 },
        ].map((c, i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              width: c.size, height: c.size,
              borderRadius: '50%',
              border: `${c.size / 10}px solid white`,
              opacity: c.opacity,
              top: c.top, bottom: c.bottom,
              left: c.left, right: c.right,
            }}
          />
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <span className="serif" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>NearbyRental</span>
          </div>

          <h2
            className="serif"
            style={{
              fontSize: '2.6rem',
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            Find your home
            <br />
            <em>before anyone else.</em>
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 320 }}>
            Community-driven rental listings updated in real-time by local scouts across Tuticorin.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 32 }}>
          {[
            { n: '10+', l: 'Areas covered' },
            { n: '0', l: 'Brokerage fees' },
            { n: '24/7', l: 'Live listings' },
          ].map(({ n, l }) => (
            <div key={l}>
              <div className="serif" style={{ fontSize: '1.8rem', color: 'white', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 52, height: 52,
                borderRadius: 12,
                background: 'var(--c-rust)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <div className="serif" style={{ fontSize: '1.4rem', color: 'var(--c-ink)' }}>NearbyRental</div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1
              className="serif"
              style={{ fontSize: '2rem', color: 'var(--c-ink)', letterSpacing: '-0.02em', marginBottom: 6 }}
            >
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)' }}>
              {mode === 'login'
                ? 'Sign in to continue browsing listings'
                : 'Join thousands of house seekers in Tuticorin'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="animate-fade-in"
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {/* ── Login form ── */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputField
                label="Email address"
                id="login-email"
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              <InputField
                label="Password"
                id="login-password"
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                id="login-submit"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: 4 }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            /* ── Register form ── */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputField
                label="Full name"
                id="register-name"
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
              <InputField
                label="Email address"
                id="register-email"
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              <InputField
                label="Password"
                id="register-password"
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <InputField
                label="Phone (optional)"
                id="register-phone"
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                inputMode="tel"
              />

              {/* Role selector */}
              <div>
                <label className="field-label">I am a…</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
                  {ROLES.map(({ value, label, icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update('role', value)}
                      style={{
                        padding: '14px 8px',
                        borderRadius: 12,
                        border: form.role === value ? '2px solid var(--c-rust)' : '2px solid var(--c-divider)',
                        background: form.role === value ? 'rgba(181,84,28,0.06)' : 'transparent',
                        color: form.role === value ? 'var(--c-rust)' : 'var(--c-charcoal)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, opacity: form.role === value ? 1 : 0.5 }}>
                        {icon}
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--c-muted)', marginTop: 2 }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                id="register-submit"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: 4 }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          {/* Toggle */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--c-muted)',
              marginTop: 24,
            }}
          >
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              style={{
                fontWeight: 700,
                color: 'var(--c-rust)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}