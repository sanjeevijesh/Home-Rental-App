// FILE: src/pages/Login.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES — injected once into <head>
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

  :root {
    --ln-ink:       #0e0c09;
    --ln-rust:      #b5541c;
    --ln-rust2:     #d4692a;
    --ln-rust-glow: rgba(181,84,28,0.30);
    --ln-gold:      #c9a96e;
    --ln-cream:     #faf7f2;
    --ln-warm:      #f2ede4;
    --ln-border:    rgba(181,84,28,0.18);
    --ln-muted:     #7a6b58;
    --ln-panel:     #1a1208;
    --ln-panel2:    #221809;
    --ln-white:     #ffffff;
    --ln-error-bg:  #fff5f5;
    --ln-error:     #c0392b;
    --ln-success:   #2d6a4f;
    --ln-divider:   rgba(201,169,110,0.20);
  }

  /* ── Page shell ── */
  .ln-root {
    min-height: 100vh;
    display: flex;
    background: var(--ln-cream);
    font-family: 'Jost', sans-serif;
    overflow: hidden;
  }

  /* ════════════════════════════════
     LEFT PANEL
  ════════════════════════════════ */
  .ln-left {
    width: 42%;
    background: var(--ln-panel);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 48px;
  }
  @media (max-width: 900px) { .ln-left { display: none; } }

  /* Grain overlay */
  .ln-left::before {
    content: '';
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0;
  }

  /* Animated gold diagonal line accent */
  .ln-left::after {
    content: '';
    position: absolute;
    top: -30%; left: 55%;
    width: 1px; height: 160%;
    background: linear-gradient(to bottom, transparent, rgba(201,169,110,0.25), transparent);
    transform: rotate(12deg);
    animation: slideAccent 8s ease-in-out infinite alternate;
  }
  @keyframes slideAccent {
    from { transform: rotate(12deg) translateX(-20px); opacity: 0.4; }
    to   { transform: rotate(12deg) translateX(20px);  opacity: 0.9; }
  }

  /* Radial glow behind logo */
  .ln-glow {
    position: absolute; top: -100px; left: -100px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(181,84,28,0.18) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
    animation: glowPulse 6s ease-in-out infinite alternate;
  }
  @keyframes glowPulse {
    from { transform: scale(1);   opacity: 0.6; }
    to   { transform: scale(1.2); opacity: 1;   }
  }

  /* Bottom corner glow */
  .ln-glow-b {
    position: absolute; bottom: -120px; right: -80px;
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,169,110,0.10) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .ln-left-content { position: relative; z-index: 1; }
  .ln-left-foot    { position: relative; z-index: 1; }

  /* Logo */
  .ln-logo {
    display: flex; align-items: center; gap: 11px; margin-bottom: 64px;
  }
  .ln-logo-icon {
    width: 38px; height: 38px; border-radius: 10px;
    border: 1px solid rgba(201,169,110,0.35);
    background: rgba(201,169,110,0.08);
    display: flex; align-items: center; justify-content: center;
  }
  .ln-logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem; font-weight: 400; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.85); text-transform: uppercase;
  }

  /* Panel headline */
  .ln-panel-h {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3.2rem; font-weight: 300; line-height: 1.08;
    letter-spacing: -0.01em; color: var(--ln-white);
    margin-bottom: 22px;
  }
  .ln-panel-h em {
    font-style: italic; color: var(--ln-gold);
  }
  .ln-panel-p {
    font-size: 0.84rem; font-weight: 300; color: rgba(255,255,255,0.5);
    line-height: 1.85; max-width: 280px; letter-spacing: 0.02em;
  }

  /* Stats row */
  .ln-stats { display: flex; gap: 36px; }
  .ln-stat-n {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.1rem; font-weight: 300; color: var(--ln-gold); line-height: 1;
  }
  .ln-stat-l {
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(255,255,255,0.38); margin-top: 4px;
  }

  /* Horizontal rule on left panel */
  .ln-panel-rule {
    width: 40px; height: 1px;
    background: linear-gradient(to right, var(--ln-gold), transparent);
    margin: 28px 0;
  }

  /* ════════════════════════════════
     RIGHT FORM PANEL
  ════════════════════════════════ */
  .ln-right {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 24px;
    background: var(--ln-cream);
    position: relative;
  }
  /* Subtle warm noise texture */
  .ln-right::before {
    content: '';
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .ln-form-wrap {
    width: 100%; max-width: 400px;
    position: relative; z-index: 1;
    animation: formReveal 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  @keyframes formReveal {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Mobile logo */
  .ln-mobile-logo {
    text-align: center; margin-bottom: 36px;
  }
  .ln-mobile-logo-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--ln-panel);
    display: inline-flex; align-items: center; justify-content: center;
    margin-bottom: 12px;
    box-shadow: 0 8px 32px rgba(14,12,9,0.18);
  }
  .ln-mobile-logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.3rem; font-weight: 400; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--ln-ink);
    display: block;
  }

  /* Heading */
  .ln-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.5rem; font-weight: 300; letter-spacing: -0.01em;
    color: var(--ln-ink); line-height: 1.1; margin-bottom: 6px;
  }
  .ln-sub {
    font-size: 0.82rem; color: var(--ln-muted); font-weight: 400;
    letter-spacing: 0.02em;
  }

  /* Gold rule under heading */
  .ln-heading-rule {
    width: 32px; height: 1.5px; border-radius: 2px;
    background: var(--ln-rust); margin: 18px 0 28px;
  }

  /* ── Mode toggle tabs ── */
  .ln-tabs {
    display: flex; margin-bottom: 28px;
    background: var(--ln-warm);
    border-radius: 10px; padding: 4px;
    border: 1px solid var(--ln-divider);
  }
  .ln-tab {
    flex: 1; padding: 9px 0;
    font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
    text-transform: uppercase; border: none; cursor: pointer;
    border-radius: 7px; transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    background: transparent; color: var(--ln-muted);
  }
  .ln-tab.active {
    background: var(--ln-panel);
    color: var(--ln-white);
    box-shadow: 0 4px 16px rgba(14,12,9,0.20);
  }

  /* ── Input fields ── */
  .ln-field { margin-bottom: 0; }
  .ln-label {
    display: block; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.09em; text-transform: uppercase;
    color: var(--ln-muted); margin-bottom: 7px;
  }
  .ln-input {
    width: 100%; box-sizing: border-box;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1.5px solid rgba(158,140,120,0.25);
    background: var(--ln-white);
    font-family: 'Jost', sans-serif;
    font-size: 0.9rem; color: var(--ln-ink);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    -webkit-appearance: none;
  }
  .ln-input::placeholder { color: rgba(122,107,88,0.45); }
  .ln-input:focus {
    border-color: var(--ln-rust);
    box-shadow: 0 0 0 3px rgba(181,84,28,0.10);
  }

  /* ── Form grid (gap) ── */
  .ln-form-grid {
    display: flex; flex-direction: column; gap: 14px;
  }

  /* ── Error banner ── */
  .ln-error {
    padding: 11px 15px; border-radius: 9px;
    background: var(--ln-error-bg);
    border: 1px solid rgba(192,57,43,0.20);
    color: var(--ln-error); font-size: 0.8rem; font-weight: 500;
    margin-bottom: 18px; letter-spacing: 0.01em;
    animation: formReveal 0.3s ease forwards;
  }

  /* ── Role selector ── */
  .ln-roles {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 8px;
  }
  .ln-role-btn {
    padding: 13px 6px; border-radius: 11px; cursor: pointer;
    border: 1.5px solid rgba(158,140,120,0.22);
    background: var(--ln-white); text-align: center;
    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    position: relative; overflow: hidden;
  }
  .ln-role-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(181,84,28,0.06), transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .ln-role-btn.active {
    border-color: var(--ln-rust);
    box-shadow: 0 0 0 3px rgba(181,84,28,0.09), 0 4px 16px rgba(181,84,28,0.10);
  }
  .ln-role-btn.active::before { opacity: 1; }
  .ln-role-icon {
    display: flex; justify-content: center; margin-bottom: 7px;
    color: var(--ln-muted); transition: color 0.2s;
  }
  .ln-role-btn.active .ln-role-icon { color: var(--ln-rust); }
  .ln-role-label {
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em;
    color: var(--ln-ink); text-transform: uppercase;
  }
  .ln-role-desc {
    font-size: 0.6rem; color: var(--ln-muted);
    margin-top: 3px; line-height: 1.4;
  }

  /* ════════════════════════════════
     LUXURY SUBMIT BUTTON
  ════════════════════════════════ */
  .ln-btn {
    position: relative; overflow: hidden;
    width: 100%; padding: 15px 20px;
    border-radius: 11px; border: none; cursor: pointer;
    background: var(--ln-panel);
    color: var(--ln-white);
    font-family: 'Jost', sans-serif;
    font-size: 0.85rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    margin-top: 6px;
    box-shadow: 0 6px 28px rgba(14,12,9,0.22), 0 1px 0 rgba(255,255,255,0.04) inset;
    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.22s ease;
    -webkit-tap-highlight-color: transparent;
  }
  /* Shimmer sweep */
  .ln-btn::before {
    content: '';
    position: absolute; top: 0; left: -120%;
    width: 80%; height: 100%;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%);
    transition: left 0.55s ease;
  }
  /* Bottom rust glow line */
  .ln-btn::after {
    content: '';
    position: absolute; bottom: 0; left: 15%; right: 15%; height: 1px;
    background: linear-gradient(to right, transparent, var(--ln-rust2), transparent);
    opacity: 0.6;
    transition: opacity 0.3s;
  }
  .ln-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(14,12,9,0.28), 0 4px 0 rgba(181,84,28,0.18),
                0 1px 0 rgba(255,255,255,0.06) inset;
  }
  .ln-btn:hover:not(:disabled)::before { left: 120%; }
  .ln-btn:hover:not(:disabled)::after  { opacity: 1; }
  .ln-btn:active:not(:disabled) {
    transform: translateY(0px);
    box-shadow: 0 4px 16px rgba(14,12,9,0.22);
  }
  .ln-btn:disabled {
    opacity: 0.55; cursor: not-allowed;
  }

  /* Loading dots inside button */
  .ln-btn-dots {
    display: inline-flex; gap: 4px; align-items: center; justify-content: center;
  }
  .ln-btn-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: rgba(255,255,255,0.7);
    animation: dotBounce 1.2s ease-in-out infinite;
  }
  .ln-btn-dot:nth-child(2) { animation-delay: 0.15s; }
  .ln-btn-dot:nth-child(3) { animation-delay: 0.30s; }
  @keyframes dotBounce {
    0%,80%,100% { transform: translateY(0);    opacity: 0.5; }
    40%          { transform: translateY(-5px); opacity: 1;   }
  }

  /* ── Toggle link ── */
  .ln-toggle {
    text-align: center; font-size: 0.8rem;
    color: var(--ln-muted); margin-top: 22px; letter-spacing: 0.01em;
  }
  .ln-toggle-btn {
    font-weight: 700; color: var(--ln-rust);
    background: none; border: none; cursor: pointer;
    font-size: 0.8rem; font-family: 'Jost', sans-serif;
    letter-spacing: 0.01em; padding: 0;
    text-decoration: underline; text-decoration-color: rgba(181,84,28,0.3);
    text-underline-offset: 2px;
    transition: text-decoration-color 0.2s;
  }
  .ln-toggle-btn:hover { text-decoration-color: var(--ln-rust); }

  /* ── Fade in stagger for form fields ── */
  .ln-field-anim {
    opacity: 0; transform: translateY(10px);
    animation: fieldIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .ln-field-anim:nth-child(1) { animation-delay: 0.05s; }
  .ln-field-anim:nth-child(2) { animation-delay: 0.10s; }
  .ln-field-anim:nth-child(3) { animation-delay: 0.15s; }
  .ln-field-anim:nth-child(4) { animation-delay: 0.20s; }
  .ln-field-anim:nth-child(5) { animation-delay: 0.25s; }
  .ln-field-anim:nth-child(6) { animation-delay: 0.30s; }
  @keyframes fieldIn {
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Thin gold separator ── */
  .ln-sep {
    display: flex; align-items: center; gap: 12px; margin: 4px 0;
  }
  .ln-sep-line {
    flex: 1; height: 1px;
    background: var(--ln-divider);
  }
  .ln-sep-text {
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(122,107,88,0.5);
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   ROLE CONFIG — icons unchanged (original logic preserved)
───────────────────────────────────────────────────────────────────────────── */
const ROLES = [
  {
    value: 'tenant', label: 'Tenant', desc: 'Looking for a house',
    icon: (
      <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    value: 'owner', label: 'Owner', desc: 'I have a property',
    icon: (
      <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    value: 'scout', label: 'Scout', desc: 'I spot vacancies',
    icon: (
      <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
];

/* ─── Reusable input ───────────────────────────────────────────────────────── */
function InputField({ label, id, ...props }) {
  return (
    <div className="ln-field">
      <label className="ln-label" htmlFor={id}>{label}</label>
      <input id={id} className="ln-input" {...props} />
    </div>
  );
}

/* ─── Luxury submit button ─────────────────────────────────────────────────── */
function LuxuryBtn({ loading, label, loadingLabel }) {
  return (
    <button type="submit" disabled={loading} className="ln-btn" id="ln-submit">
      {loading ? (
        <span className="ln-btn-dots">
          <span className="ln-btn-dot" />
          <span className="ln-btn-dot" />
          <span className="ln-btn-dot" />
        </span>
      ) : label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ⚠️  All original logic (register, login, navigate, form state) is untouched.
───────────────────────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [mode, setMode]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const styleRef              = useRef(false);

  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', role: 'tenant',
  });

  /* Inject styles once */
  useEffect(() => {
    if (styleRef.current) return;
    styleRef.current = true;
    const tag = document.createElement('style');
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);

  /* ── Original handlers (untouched) ── */
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
    if (!form.name)                    { setError('Name is required'); return; }
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

  const switchMode = (m) => { setMode(m); setError(null); };

  /* ── House icon SVG ── */
  const HouseIcon = ({ color = 'white', size = 20 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2.1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );

  return (
    <div className="ln-root">

      {/* ══════════════════════════════
          LEFT DECORATIVE PANEL
      ══════════════════════════════ */}
      <div className="ln-left">
        <div className="ln-glow" />
        <div className="ln-glow-b" />

        <div className="ln-left-content">
          {/* Logo */}
          <div className="ln-logo">
            <div className="ln-logo-icon">
              <HouseIcon color="rgba(201,169,110,0.9)" size={17} />
            </div>
            <span className="ln-logo-name">NearbyRental</span>
          </div>

          {/* Headline */}
          <h2 className="ln-panel-h">
            Find your home<br />
            <em>before anyone else.</em>
          </h2>

          <div className="ln-panel-rule" />

          <p className="ln-panel-p">
            Community-driven rental listings updated in real-time by local scouts across Tuticorin.
          </p>
        </div>

        {/* Stats */}
        <div className="ln-left-foot">
          <div className="ln-sep" style={{ marginBottom: 24 }}>
            <div className="ln-sep-line" style={{ background: 'rgba(201,169,110,0.15)' }} />
          </div>
          <div className="ln-stats">
            {[
              { n: '10+',  l: 'Areas covered' },
              { n: '0',    l: 'Brokerage fees' },
              { n: '24/7', l: 'Live listings'  },
            ].map(({ n, l }) => (
              <div key={l}>
                <div className="ln-stat-n">{n}</div>
                <div className="ln-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT FORM PANEL
      ══════════════════════════════ */}
      <div className="ln-right">
        <div className="ln-form-wrap">

          {/* Mobile logo */}
          <div className="ln-mobile-logo" style={{ display: 'none' }}
            ref={el => {
              if (el) {
                const show = window.innerWidth <= 900;
                el.style.display = show ? 'block' : 'none';
              }
            }}
          >
            <div className="ln-mobile-logo-icon">
              <HouseIcon color="rgba(201,169,110,0.9)" size={22} />
            </div>
            <span className="ln-mobile-logo-name">NearbyRental</span>
          </div>

          {/* Heading */}
          <h1 className="ln-heading">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="ln-sub">
            {mode === 'login'
              ? 'Sign in to continue browsing listings'
              : 'Join thousands of house seekers in Tuticorin'}
          </p>
          <div className="ln-heading-rule" />

          {/* Mode tabs */}
          <div className="ln-tabs">
            <button
              type="button"
              className={`ln-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`ln-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && <div className="ln-error">{error}</div>}

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="ln-form-grid">
                <div className="ln-field-anim">
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
                </div>
                <div className="ln-field-anim">
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
                </div>
                <div className="ln-field-anim">
                  <LuxuryBtn loading={loading} label="Sign In" />
                </div>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="ln-form-grid">
                <div className="ln-field-anim">
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
                </div>
                <div className="ln-field-anim">
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
                </div>
                <div className="ln-field-anim">
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
                </div>
                <div className="ln-field-anim">
                  <InputField
                    label="Phone (optional)"
                    id="register-phone"
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    inputMode="tel"
                  />
                </div>

                {/* Role selector */}
                <div className="ln-field-anim">
                  <label className="ln-label">I am a…</label>
                  <div className="ln-roles">
                    {ROLES.map(({ value, label, icon, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update('role', value)}
                        className={`ln-role-btn ${form.role === value ? 'active' : ''}`}
                      >
                        <div className="ln-role-icon">{icon}</div>
                        <div className="ln-role-label">{label}</div>
                        <div className="ln-role-desc">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ln-field-anim">
                  <LuxuryBtn loading={loading} label="Create Account" />
                </div>
              </div>
            </form>
          )}

          {/* Toggle */}
          <p className="ln-toggle">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="ln-toggle-btn"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>

        </div>
      </div>

      {/* Responsive mobile logo reveal */}
      <style>{`
        @media (max-width: 900px) {
          .ln-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
