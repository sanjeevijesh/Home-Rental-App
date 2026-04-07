// FILE: src/pages/SuperAdmin.jsx
// Full Super Admin Dashboard — analytics, users, properties, ads, logs
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../services/api';

/* ─── GLOBAL STYLES (injected once) ─────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0f0e0c;
    --rust: #c0501a;
    --rust-dk: #9a3c10;
    --rust-glow: rgba(192,80,26,0.25);
    --teal: #0e7c7b;
    --green: #16a34a;
    --red: #dc2626;
    --amber: #d97706;
    --blue: #2563eb;
    --purple: #7c3aed;
    --cream: #faf8f4;
    --paper: #f3efe7;
    --warm: #e8e0d2;
    --muted: #8c7d6e;
    --border: rgba(0,0,0,0.08);
    --card-bg: rgba(255,255,255,0.85);
    --card-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

  .sa-card { animation: fadeUp 0.3s ease both; }
  .sa-tab-btn { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
  .sa-tab-btn:hover { transform: translateY(-1px); }
  .sa-btn { transition: all 0.15s ease; }
  .sa-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.07); }
  .sa-btn:active:not(:disabled) { transform: translateY(0px); }
  .sa-row { transition: background 0.12s ease; }
  .sa-row:hover { background: rgba(192,80,26,0.03) !important; }

  .sa-stat-card {
    position: relative; overflow: hidden;
    background: var(--card-bg); border-radius: 16px;
    border: 1px solid var(--border); box-shadow: var(--card-shadow);
    padding: 18px 20px; cursor: default;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .sa-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .sa-stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent, var(--rust)); border-radius: 16px 16px 0 0;
  }

  .sa-input {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid var(--warm); background: white;
    font-family: 'Outfit', sans-serif; font-size: 0.88rem; color: var(--ink);
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sa-input:focus { border-color: var(--rust); box-shadow: 0 0 0 3px var(--rust-glow); }
  .sa-input::placeholder { color: var(--muted); }

  .sa-select {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid var(--warm); background: white;
    font-family: 'Outfit', sans-serif; font-size: 0.88rem; color: var(--ink);
    outline: none; cursor: pointer;
    transition: border-color 0.15s;
  }
  .sa-select:focus { border-color: var(--rust); }

  .pill-filter {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 99px; font-size: 0.78rem; font-weight: 600;
    font-family: 'Outfit', sans-serif; cursor: pointer; border: 1.5px solid var(--warm);
    background: white; color: var(--muted); transition: all 0.15s ease; white-space: nowrap;
  }
  .pill-filter:hover { border-color: var(--rust); color: var(--rust); }
  .pill-filter.active { background: var(--rust); border-color: var(--rust); color: white; box-shadow: 0 2px 8px var(--rust-glow); }
  .pill-filter.active-danger { background: var(--red); border-color: var(--red); color: white; }

  .badge {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 2px 8px; border-radius: 99px; font-size: 0.65rem;
    font-weight: 700; letter-spacing: 0.05em; font-family: 'DM Mono', monospace;
    text-transform: uppercase;
  }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 300;
    display: flex; align-items: center; justify-content: center;
    background: rgba(15,14,12,0.55); backdrop-filter: blur(8px);
    animation: fadeUp 0.2s ease;
  }
  .modal-box {
    background: white; border-radius: 20px; padding: 28px;
    max-width: 420px; width: 90%; box-shadow: 0 32px 80px rgba(0,0,0,0.25);
    animation: slideIn 0.25s ease;
  }

  .area-bar-wrap { height: 6px; border-radius: 99px; background: var(--warm); overflow: hidden; display: flex; }
  .area-bar-seg { height: 100%; transition: flex 0.4s ease; }

  @media (max-width: 640px) {
    .sa-grid-kpi { grid-template-columns: repeat(2, 1fr) !important; }
    .sa-grid-3 { grid-template-columns: 1fr !important; }
    .sa-grid-2 { grid-template-columns: 1fr !important; }
    .desktop-only { display: none !important; }
  }
`;

/* ─── PALETTE TOKENS ──────────────────────────────────────── */
const C = {
  ink: '#0f0e0c', rust: '#c0501a', rustDk: '#9a3c10',
  rustGlow: 'rgba(192,80,26,0.2)', cream: '#faf8f4',
  paper: '#f3efe7', warm: '#e8e0d2', muted: '#8c7d6e',
  border: 'rgba(0,0,0,0.08)', teal: '#0e7c7b',
  green: '#16a34a', red: '#dc2626', amber: '#d97706',
  blue: '#2563eb', purple: '#7c3aed',
};

const ROLE_COLORS = { tenant: C.blue, owner: C.teal, scout: C.rust, super_admin: C.purple };
const STATUS_COLORS = { available: C.green, occupied: C.amber, flagged: C.red, deleted: C.muted };
const REPORT_COLORS = { pending: C.amber, approved: C.green, rejected: C.red };

/* ─── PRIMITIVES ──────────────────────────────────────────── */

function Card({ children, style, className = '' }) {
  return (
    <div className={`sa-card ${className}`} style={{
      background: 'rgba(255,255,255,0.9)', borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function Badge({ label, color = C.muted }) {
  return (
    <span className="badge" style={{ background: `${color}18`, color }}>
      {label}
    </span>
  );
}

function Btn({ children, onClick, variant = 'ghost', size = 'sm', disabled, style, title }) {
  const sz = size === 'xs' ? { padding: '5px 11px', fontSize: '0.72rem' }
           : size === 'sm' ? { padding: '8px 16px', fontSize: '0.82rem' }
           :                 { padding: '11px 22px', fontSize: '0.88rem' };
  const vs = {
    primary: { background: C.rust, color: 'white', boxShadow: `0 2px 8px ${C.rustGlow}` },
    danger:  { background: C.red,  color: 'white' },
    success: { background: C.green, color: 'white' },
    ghost:   { background: 'transparent', color: C.muted, border: 'none' },
    outline: { background: 'white', border: `1.5px solid ${C.warm}`, color: '#555' },
  };
  return (
    <button title={title} onClick={onClick} disabled={disabled} className="sa-btn" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: "'Outfit', sans-serif", fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, border: 'none',
      borderRadius: 10, ...sz, ...vs[variant], ...style,
    }}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, style }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      className="sa-input" style={style} />
  );
}

function Spinner({ size = 28 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `3px solid ${C.warm}`, borderTopColor: C.rust,
        animation: 'spin 0.65s linear infinite',
      }} />
    </div>
  );
}

function EmptyState({ message, icon }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 20px', color: C.muted }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }}>{icon || '📭'}</div>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem' }}>{message}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.ink, marginBottom: 14, letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  );
}

/* ─── STAT CARD ───────────────────────────────────────────── */
function Stat({ label, value, sub, accent = C.rust, icon }) {
  return (
    <div className="sa-stat-card" style={{ '--accent': accent }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
            {label}
          </p>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color: C.ink, lineHeight: 1 }}>
            {value ?? '—'}
          </p>
          {sub && <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', color: C.muted, marginTop: 4 }}>{sub}</p>}
        </div>
        {icon && (
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TABS CONFIG ─────────────────────────────────────────── */
const TABS = [
  { key: 'dashboard', label: 'Overview', emoji: '⚡' },
  { key: 'users', label: 'Users', emoji: '👥' },
  { key: 'properties', label: 'Listings', emoji: '🏠' },
  { key: 'ads', label: 'Ads', emoji: '📢' },
  { key: 'scouts', label: 'Scouts', emoji: '📸' },
  { key: 'logs', label: 'Logs', emoji: '📋' },
];

/* ─── DASHBOARD TAB ───────────────────────────────────────── */
function DashboardTab({ analytics, areaBreakdown }) {
  if (!analytics) return <Spinner />;
  const a = analytics;

  const topAreas = Object.entries(areaBreakdown || {})
    .map(([area, stats]) => ({ area, total: (stats.available || 0) + (stats.occupied || 0), ...stats }))
    .sort((x, y) => y.total - x.total);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Grid */}
      <div className="sa-grid-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <Stat label="Total Users"     value={a.total_users}          sub={`+${a.new_users_today} today`}       accent={C.rust}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={C.rust} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>} />
        <Stat label="Properties"      value={a.total_properties}     sub={`+${a.new_properties_today} today`}  accent={C.teal}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={C.teal} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>} />
        <Stat label="Scout Reports"   value={a.total_scout_reports}  sub={`${a.pending_reports} pending`}      accent={C.blue}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={C.blue} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>} />
        <Stat label="Active Ads"      value={a.active_ads}           accent={C.purple}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={C.purple} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>} />
      </div>

      {/* Status Row */}
      <div className="sa-grid-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <Stat label="Available"       value={a.available_properties}  accent={C.green}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={C.green} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>} />
        <Stat label="Occupied"        value={a.occupied_properties}   accent={C.amber}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={C.amber} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4l3 3"/></svg>} />
        <Stat label="Flagged"         value={a.flagged_properties}    accent={C.red}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={C.red} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-5 9 5v13"/></svg>} />
        <Stat label="Suspended Users" value={a.suspended_users}       accent={C.red}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={C.red} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>} />
      </div>

      {/* Growth Strip */}
      <div className="sa-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'New Today',    value: a.new_properties_today, color: C.green },
          { label: 'This Week',    value: a.new_properties_week,  color: C.teal },
          { label: 'This Month',   value: a.new_properties_month, color: C.rust },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 4 }}>
                Listings · {label}
              </p>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Breakdown Row */}
      <div className="sa-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* User breakdown */}
        <Card style={{ padding: '22px' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 18 }}>
            User Breakdown
          </p>
          {[
            { label: 'Tenants', value: a.total_tenants, color: C.blue },
            { label: 'Owners',  value: a.total_owners,  color: C.teal },
            { label: 'Scouts',  value: a.total_scouts,  color: C.rust },
          ].map(({ label, value, color }) => {
            const total = (a.total_tenants || 0) + (a.total_owners || 0) + (a.total_scouts || 0);
            const pct = total ? Math.round(((value || 0) / total) * 100) : 0;
            return (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: '#444' }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: C.muted }}>{pct}%</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: C.ink }}>{value ?? '—'}</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: C.warm, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Area breakdown */}
        <Card style={{ padding: '22px', overflowY: 'auto', maxHeight: 280 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 18 }}>
            Area Breakdown
          </p>
          {topAreas.length === 0 && <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: C.muted }}>No area data</p>}
          {topAreas.map(({ area, available, occupied, flagged }) => (
            <div key={area} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: '#444', fontWeight: 500 }}>{area}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: C.muted }}>{(available||0)+(occupied||0)} total</span>
              </div>
              <div className="area-bar-wrap">
                <div className="area-bar-seg" style={{ flex: available||0, background: C.green }} />
                <div className="area-bar-seg" style={{ flex: occupied||0, background: C.amber }} />
                {(flagged||0) > 0 && <div className="area-bar-seg" style={{ flex: flagged, background: C.red }} />}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ─── USERS TAB ───────────────────────────────────────────── */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [suspFilter, setSuspFilter] = useState('');
  const [actionId, setActionId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.listUsers({ search, role: roleFilter, suspended: suspFilter });
      setUsers(data.users || []);
    } finally { setLoading(false); }
  }, [search, roleFilter, suspFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSuspend = async (userId, suspend, reason) => {
    setActionId(userId);
    try {
      await adminAPI.suspendUser(userId, suspend, reason);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, suspended: suspend } : u));
    } finally { setActionId(null); setConfirmModal(null); }
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 260 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.muted} strokeWidth="2"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone…"
            className="sa-input" style={{ paddingLeft: 34 }} />
        </div>
        {[
          { val: '', label: 'All' },
          { val: 'tenant', label: 'Tenants' },
          { val: 'owner', label: 'Owners' },
          { val: 'scout', label: 'Scouts' },
        ].map(({ val, label }) => (
          <button key={val} className={`pill-filter ${roleFilter === val ? 'active' : ''}`}
            onClick={() => setRoleFilter(val)}>{label}</button>
        ))}
        <button
          className={`pill-filter ${suspFilter === 'true' ? 'active-danger' : ''}`}
          onClick={() => setSuspFilter(s => s === 'true' ? '' : 'true')}
          style={{ borderColor: suspFilter === 'true' ? C.red : undefined }}>
          🚫 Suspended
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.length === 0 && <EmptyState message="No users match your filters" icon="👤" />}
          {users.map((u, i) => {
            const roleColor = ROLE_COLORS[u.role] || C.muted;
            return (
              <Card key={u.id} className="sa-row" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 0.04}s` }}>
                {/* Avatar */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: `${roleColor}20`, border: `2px solid ${roleColor}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1rem', color: roleColor,
                }}>
                  {u.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>{u.name}</span>
                    <Badge label={u.role} color={roleColor} />
                    {u.suspended && <Badge label="suspended" color={C.red} />}
                  </div>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.phone ? `+91 ${u.phone}` : 'No phone'} · {new Date(u.created_at).toLocaleDateString('en-IN')}
                  </p>
                  {u.suspended && u.suspend_reason && (
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.7rem', color: C.red, marginTop: 2 }}>⚠️ {u.suspend_reason}</p>
                  )}
                </div>
                {/* Action */}
                <div style={{ flexShrink: 0 }}>
                  {u.suspended ? (
                    <Btn variant="success" size="xs" disabled={actionId === u.id}
                      onClick={() => setConfirmModal({ type: 'reactivate', user: u })}>
                      ✓ Reactivate
                    </Btn>
                  ) : u.role !== 'super_admin' ? (
                    <Btn variant="danger" size="xs" disabled={actionId === u.id}
                      onClick={() => setConfirmModal({ type: 'suspend', user: u })}>
                      Suspend
                    </Btn>
                  ) : (
                    <Badge label="admin" color={C.purple} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.type === 'suspend' ? `Suspend ${confirmModal.user.name}?` : `Reactivate ${confirmModal.user.name}?`}
          desc={confirmModal.type === 'suspend' ? 'This user will be blocked from logging in.' : 'This user will regain full access.'}
          withReason={confirmModal.type === 'suspend'}
          confirmLabel={confirmModal.type === 'suspend' ? 'Suspend' : 'Reactivate'}
          confirmVariant={confirmModal.type === 'suspend' ? 'danger' : 'success'}
          onCancel={() => setConfirmModal(null)}
          onConfirm={(reason) => handleSuspend(confirmModal.user.id, confirmModal.type === 'suspend', reason)}
        />
      )}
    </div>
  );
}

/* ─── PROPERTIES TAB ──────────────────────────────────────── */
function PropertiesTab() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [adMsg, setAdMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.listProperties({ search, status: statusFilter });
      setProperties(data.properties || []);
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete  = async (id) => { setActionId(id); try { await adminAPI.deleteProperty(id); setProperties(prev => prev.filter(p => p.id !== id)); } finally { setActionId(null); setConfirmModal(null); } };
  const handleFlag    = async (id) => { setActionId(id); try { await adminAPI.flagProperty(id, 'Flagged by admin'); setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'flagged' } : p)); } finally { setActionId(null); } };
  const handleUnflag  = async (id) => { setActionId(id); try { await adminAPI.updateProperty(id, { status: 'available' }); setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'available' } : p)); } finally { setActionId(null); } };
  const handleEdit    = async (id, updates) => { try { await adminAPI.updateProperty(id, updates); setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); setEditModal(null); } catch {} };
  const handleSetAd   = async (property) => { try { await adminAPI.createAd({ property_id: property.id, frequency: 'always' }); setAdMsg(`"${property.title}" is now the active ad!`); setTimeout(() => setAdMsg(''), 4000); } catch {} };

  return (
    <div>
      {adMsg && (
        <div style={{ marginBottom: 14, padding: '12px 16px', borderRadius: 12, background: `${C.green}10`, border: `1px solid ${C.green}30`, color: C.green, fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          🎉 {adMsg}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 260 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.muted} strokeWidth="2"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title…"
            className="sa-input" style={{ paddingLeft: 34 }} />
        </div>
        {['', 'available', 'occupied', 'flagged', 'deleted'].map(s => (
          <button key={s} className={`pill-filter ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {properties.length === 0 && <EmptyState message="No properties found" icon="🏠" />}
          {properties.map((p, i) => {
            const sc = { color: STATUS_COLORS[p.status] || C.muted, label: p.status };
            return (
              <Card key={p.id} className="sa-row" style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', animationDelay: `${i * 0.035}s` }}>
                {/* Thumbnail */}
                <div style={{ width: 62, height: 50, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: C.paper }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🏠</div>
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{p.title}</span>
                    <Badge label={sc.label} color={sc.color} />
                    {p.profiles?.suspended && <Badge label="owner-suspended" color={C.red} />}
                  </div>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: C.muted }}>
                    {p.area} · ₹{Number(p.rent).toLocaleString('en-IN')}/mo
                    {p.profiles?.name ? ` · ${p.profiles.name}` : ''}
                  </p>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <Btn variant="outline" size="xs" onClick={() => setEditModal(p)}>✏️</Btn>
                  <Btn variant="outline" size="xs" onClick={() => handleSetAd(p)} title="Set as popup ad" style={{ fontSize: '0.8rem' }}>📢</Btn>
                  {p.status === 'flagged'
                    ? <Btn variant="outline" size="xs" disabled={actionId === p.id} onClick={() => handleUnflag(p.id)} style={{ color: C.green }}>Unflag</Btn>
                    : p.status !== 'deleted'
                    ? <Btn variant="outline" size="xs" disabled={actionId === p.id} onClick={() => handleFlag(p.id)} style={{ color: C.amber }}>Flag</Btn>
                    : null}
                  {p.status !== 'deleted' && (
                    <Btn variant="danger" size="xs" disabled={actionId === p.id}
                      onClick={() => setConfirmModal({ type: 'delete', property: p })}>
                      Delete
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editModal && <EditPropertyModal property={editModal} onClose={() => setEditModal(null)} onSave={(updates) => handleEdit(editModal.id, updates)} />}
      {confirmModal && (
        <ConfirmModal
          title={`Delete "${confirmModal.property?.title}"?`}
          desc="This will remove the listing permanently. This cannot be undone."
          confirmLabel="Delete" confirmVariant="danger"
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => handleDelete(confirmModal.property.id)}
        />
      )}
    </div>
  );
}

/* ─── ADS TAB ─────────────────────────────────────────────── */
function AdsTab() {
  const [ads, setAds] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropId, setSelectedPropId] = useState('');
  const [frequency, setFrequency] = useState('always');
  const [creating, setCreating] = useState(false);

  const loadAds = useCallback(async () => {
    setLoading(true);
    try {
      const [adsRes, propsRes] = await Promise.all([
        adminAPI.listAds(),
        adminAPI.listProperties({ status: 'available', limit: 100 }),
      ]);
      setAds(adsRes.data.ads || []);
      setProperties(propsRes.data.properties || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAds(); }, [loadAds]);

  const handleCreate = async () => {
    if (!selectedPropId) return;
    setCreating(true);
    try { await adminAPI.createAd({ property_id: selectedPropId, frequency }); await loadAds(); setSelectedPropId(''); }
    finally { setCreating(false); }
  };

  const handleToggle = async (id) => { await adminAPI.toggleAd(id); await loadAds(); };
  const handleDelete = async (id) => { await adminAPI.deleteAd(id); setAds(prev => prev.filter(a => a.id !== id)); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Create Ad Card */}
      <Card style={{ padding: '24px', background: `linear-gradient(135deg, ${C.rust}08 0%, white 100%)`, borderColor: `${C.rust}20` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: C.ink }}>Promote a Property</h3>
        </div>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: C.muted, marginBottom: 20 }}>
          The selected property will appear as a popup when users open the site. Only one ad is active at a time.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 220px' }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>Property</label>
            <select value={selectedPropId} onChange={e => setSelectedPropId(e.target.value)} className="sa-select">
              <option value="">Select a property…</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title} — {p.area} (₹{Number(p.rent).toLocaleString('en-IN')})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)} className="sa-select" style={{ width: 'auto', minWidth: 160 }}>
              <option value="always">Every visit</option>
              <option value="once_per_session">Once per session</option>
              <option value="once_per_day">Once per day</option>
            </select>
          </div>
          <Btn variant="primary" size="sm" onClick={handleCreate} disabled={!selectedPropId || creating}>
            {creating ? 'Creating…' : '📢 Set as Ad'}
          </Btn>
        </div>
      </Card>

      <SectionTitle>All Advertisements</SectionTitle>
      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ads.length === 0 && <EmptyState message="No advertisements yet" icon="📢" />}
          {ads.map((ad, i) => (
            <Card key={ad.id} className="sa-row" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 0.04}s` }}>
              <div style={{ width: 62, height: 50, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: C.paper }}>
                {ad.properties?.images?.[0]
                  ? <img src={ad.properties.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🏠</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: C.ink }}>{ad.properties?.title || '—'}</span>
                  <Badge label={ad.active ? 'active' : 'inactive'} color={ad.active ? C.green : C.muted} />
                </div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: C.muted }}>
                  {ad.properties?.area} · ₹{Number(ad.properties?.rent || 0).toLocaleString('en-IN')}/mo · {ad.frequency}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant={ad.active ? 'outline' : 'success'} size="xs" onClick={() => handleToggle(ad.id)}>
                  {ad.active ? 'Pause' : 'Activate'}
                </Btn>
                <Btn variant="danger" size="xs" onClick={() => handleDelete(ad.id)}>Remove</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SCOUTS TAB ──────────────────────────────────────────── */
function ScoutsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.listReports({ status: statusFilter });
      setReports(data.reports || []);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, status) => {
    setActionId(id);
    try { await adminAPI.updateReport(id, status); setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r)); }
    finally { setActionId(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { val: '', label: 'All' },
          { val: 'pending', label: '⏳ Pending' },
          { val: 'approved', label: '✓ Approved' },
          { val: 'rejected', label: '✗ Rejected' },
        ].map(({ val, label }) => (
          <button key={val} className={`pill-filter ${statusFilter === val ? 'active' : ''}`}
            onClick={() => setStatusFilter(val)}>{label}</button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reports.length === 0 && <EmptyState message="No reports found" icon="📸" />}
          {reports.map((r, i) => (
            <Card key={r.id} className="sa-row" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 0.04}s` }}>
              <div style={{ width: 62, height: 50, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: C.paper }}>
                {r.image_url
                  ? <img src={r.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '1.4rem' }}>📸</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: C.ink }}>{r.profiles?.name || 'Unknown scout'}</span>
                  <Badge label={r.status} color={REPORT_COLORS[r.status] || C.muted} />
                </div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: C.muted }}>
                  {r.area} · {new Date(r.created_at).toLocaleDateString('en-IN')} · +{r.reward_points} pts
                </p>
              </div>
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Btn variant="success" size="xs" disabled={actionId === r.id} onClick={() => handleAction(r.id, 'approved')}>✓</Btn>
                  <Btn variant="danger" size="xs" disabled={actionId === r.id} onClick={() => handleAction(r.id, 'rejected')}>✗</Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── LOGS TAB ────────────────────────────────────────────── */
const ACTION_META = {
  delete_property:         { color: C.red,    emoji: '🗑️' },
  flag_property:           { color: C.amber,  emoji: '🚩' },
  suspend_user:            { color: C.red,    emoji: '🚫' },
  reactivate_user:         { color: C.green,  emoji: '✅' },
  create_ad:               { color: C.rust,   emoji: '📢' },
  activate_ad:             { color: C.green,  emoji: '▶️' },
  deactivate_ad:           { color: C.muted,  emoji: '⏸️' },
  update_property:         { color: C.blue,   emoji: '✏️' },
  approved_scout_report:   { color: C.green,  emoji: '📸' },
  rejected_scout_report:   { color: C.red,    emoji: '❌' },
};

function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getLogs({ limit: 100 }).then(({ data }) => setLogs(data.logs || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.length === 0 && <EmptyState message="No audit logs yet" icon="📋" />}
          {logs.map((log, i) => {
            const meta = ACTION_META[log.action] || { color: C.muted, emoji: '·' };
            return (
              <div key={log.id} className="sa-card" style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.85)', borderRadius: 12,
                border: `1px solid ${C.border}`,
                animationDelay: `${i * 0.02}s`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: `${meta.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                }}>
                  {meta.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', fontWeight: 500, color: meta.color }}>{log.action}</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', color: C.muted }}>by {log.profiles?.name || 'Admin'}</span>
                  </div>
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(log.meta).slice(0, 90)}
                    </p>
                  )}
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: C.muted, flexShrink: 0 }}>
                  {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── MODALS ──────────────────────────────────────────────── */
function ConfirmModal({ title, desc, confirmLabel, confirmVariant, onCancel, onConfirm, withReason }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: C.ink, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: C.muted, marginBottom: withReason ? 16 : 24 }}>{desc}</p>
        {withReason && (
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>
              Reason (optional)
            </label>
            <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Spam, fake listing, etc." />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="outline" size="sm" onClick={onCancel}>Cancel</Btn>
          <Btn variant={confirmVariant} size="sm" onClick={() => onConfirm(reason)}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

function EditPropertyModal({ property, onClose, onSave }) {
  const [form, setForm] = useState({ title: property.title, rent: property.rent, status: property.status });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: C.ink, marginBottom: 20 }}>Edit Property</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[{ label: 'Title', key: 'title', type: 'text' }, { label: 'Rent (₹)', key: 'rent', type: 'number' }].map(({ label, key }) => (
            <div key={key}>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>{label}</label>
              <Input value={form[key]} onChange={e => update(key, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>Status</label>
            <select value={form.status} onChange={e => update('status', e.target.value)} className="sa-select">
              {['available', 'occupied', 'flagged'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
          <Btn variant="outline" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" size="sm" onClick={() => onSave({ title: form.title, rent: parseInt(form.rent), status: form.status })}>
            Save changes
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
export default function SuperAdmin() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [areaBreakdown, setAreaBreakdown] = useState({});

  useEffect(() => {
    if (!authLoading && profile?.role !== 'super_admin') navigate('/');
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      adminAPI.getAnalytics().then(({ data }) => {
        setAnalytics(data.analytics);
        setAreaBreakdown(data.areaBreakdown || {});
      }).catch(() => {});
    }
  }, [profile]);

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Spinner /></div>;
  }
  if (profile?.role !== 'super_admin') return null;

  const TAB_CONTENT = {
    dashboard:  <DashboardTab analytics={analytics} areaBreakdown={areaBreakdown} />,
    users:      <UsersTab />,
    properties: <PropertiesTab />,
    ads:        <AdsTab />,
    scouts:     <ScoutsTab />,
    logs:       <LogsTab />,
  };

  const activeTabMeta = TABS.find(t => t.key === activeTab);

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: '#f1ede6', fontFamily: "'Outfit', sans-serif" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.rust} 0%, ${C.rustDk} 100%)`,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 24px rgba(192,80,26,0.3)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0 0' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
            }}>
              🛡️
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.01em' }}>
                Super Admin
              </h1>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                NearbyRental · Full Control
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 8,
              padding: '4px 10px', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.85)',
            }}>
              {activeTabMeta?.emoji} {activeTabMeta?.label}
            </div>
          </div>

          {/* Tab Strip */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 0, marginTop: 12, scrollbarWidth: 'none' }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="sa-tab-btn" style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '9px 14px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontWeight: isActive ? 700 : 500, fontSize: '0.8rem',
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? C.rust : 'rgba(255,255,255,0.72)',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  boxShadow: isActive ? '0 -4px 12px rgba(0,0,0,0.08)' : 'none',
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{tab.emoji}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 48px' }}>
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}
