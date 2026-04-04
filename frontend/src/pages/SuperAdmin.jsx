// FILE: src/pages/SuperAdmin.jsx
// Full Super Admin Dashboard — analytics, users, properties, ads, logs
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../services/api';

// ── Palette (matches the site's CSS variables) ────────────
const C = {
  ink: '#1c1711', charcoal: '#3d3228', muted: '#7a6c5e',
  rust: '#b5541c', rustDk: '#8c3e12', rustLt: 'rgba(181,84,28,0.08)',
  cream: '#faf7f2', paper: '#f4efe7', warm: '#ede5d8',
  divider: '#ddd5c7', teal: '#1d6a6a', tealLt: 'rgba(29,106,106,0.08)',
  green: '#16a34a', greenLt: 'rgba(22,163,74,0.08)',
  red: '#dc2626', redLt: 'rgba(220,38,38,0.08)',
  amber: '#d97706', amberLt: 'rgba(217,119,6,0.08)',
  blue: '#2563eb', blueLt: 'rgba(37,99,235,0.08)',
};

// ── Tiny reusable primitives ──────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, border: `1px solid ${C.divider}`,
      boxShadow: '0 2px 12px rgba(28,23,17,0.06)', ...style,
    }}>
      {children}
    </div>
  );
}

function Badge({ label, color = C.muted, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 9px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
      letterSpacing: '0.04em', background: bg || `${color}18`, color,
    }}>
      {label}
    </span>
  );
}

function Stat({ label, value, sub, accent = C.rust, icon }) {
  return (
    <Card style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>
            {label}
          </p>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: C.ink, lineHeight: 1, marginBottom: sub ? 4 : 0 }}>
            {value ?? '—'}
          </p>
          {sub && <p style={{ fontSize: '0.72rem', color: C.muted }}>{sub}</p>}
        </div>
        {icon && (
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

function Btn({ children, onClick, variant = 'ghost', size = 'sm', disabled, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1, border: 'none', borderRadius: 8, transition: 'all 0.15s',
    fontSize: size === 'xs' ? '0.72rem' : '0.82rem',
    padding: size === 'xs' ? '4px 10px' : size === 'sm' ? '7px 14px' : '10px 20px',
    ...style,
  };
  const variants = {
    primary: { background: C.rust, color: 'white', boxShadow: `0 3px 10px ${C.rust}40` },
    danger:  { background: C.red,  color: 'white' },
    ghost:   { background: 'transparent', color: C.charcoal },
    outline: { background: 'transparent', border: `1.5px solid ${C.divider}`, color: C.charcoal },
    success: { background: C.green, color: 'white' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, style }) {
  return (
    <input
      value={value} onChange={onChange} placeholder={placeholder}
      style={{
        padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${C.divider}`,
        background: C.cream, fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif",
        color: C.ink, outline: 'none', width: '100%', ...style,
      }}
      onFocus={e => e.target.style.borderColor = C.rust}
      onBlur={e => e.target.style.borderColor = C.divider}
    />
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', color: C.ink, letterSpacing: '-0.01em', marginBottom: 16 }}>
      {children}
    </h2>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: '0.85rem' }}>
      {message}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: `3px solid ${C.warm}`, borderTopColor: C.rust,
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

// ── NAV TABS ──────────────────────────────────────────────
const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { key: 'users', label: 'Users', icon: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
  )},
  { key: 'properties', label: 'Properties', icon: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
  )},
  { key: 'ads', label: 'Ads', icon: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
  )},
  { key: 'scouts', label: 'Scout Reports', icon: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
  )},
  { key: 'logs', label: 'Audit Logs', icon: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
  )},
];

// ── DASHBOARD TAB ─────────────────────────────────────────
function DashboardTab({ analytics, areaBreakdown }) {
  if (!analytics) return <Spinner />;
  const a = analytics;

  const topAreas = Object.entries(areaBreakdown || {})
    .map(([area, stats]) => ({ area, total: (stats.available || 0) + (stats.occupied || 0), ...stats }))
    .sort((x, y) => y.total - x.total);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        <Stat label="Total Users"      value={a.total_users}           sub={`${a.new_users_today} today`}       accent={C.rust} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.rust} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} />
        <Stat label="Properties"       value={a.total_properties}      sub={`${a.new_properties_today} today`} accent={C.teal} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.teal} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>} />
        <Stat label="Available"        value={a.available_properties}  accent={C.green} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.green} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>} />
        <Stat label="Occupied"         value={a.occupied_properties}   accent={C.amber} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.amber} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>} />
        <Stat label="Flagged"          value={a.flagged_properties}    accent={C.red}   icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.red} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-4l2 4"/></svg>} />
        <Stat label="Suspended Users"  value={a.suspended_users}       accent={C.red}   icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.red} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>} />
        <Stat label="Scout Reports"    value={a.total_scout_reports}   sub={`${a.pending_reports} pending`}    accent={C.blue} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.blue} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>} />
        <Stat label="Active Ads"       value={a.active_ads}            accent={C.rust}  icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.rust} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>} />
      </div>

      {/* Growth row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'New listings today',      value: a.new_properties_today },
          { label: 'New listings this week',   value: a.new_properties_week },
          { label: 'New listings this month',  value: a.new_properties_month },
        ].map(({ label, value }) => (
          <Card key={label} style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{label}</p>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: C.ink, lineHeight: 1 }}>{value ?? '—'}</p>
          </Card>
        ))}
      </div>

      {/* Role breakdown + Area breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card style={{ padding: '22px' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 14 }}>User breakdown</p>
          {[
            { label: 'Tenants', value: a.total_tenants,  color: C.blue },
            { label: 'Owners',  value: a.total_owners,   color: C.teal },
            { label: 'Scouts',  value: a.total_scouts,   color: C.rust },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '0.85rem', color: C.charcoal }}>{label}</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: C.ink }}>{value ?? '—'}</span>
            </div>
          ))}
        </Card>

        <Card style={{ padding: '22px', overflowY: 'auto', maxHeight: 240 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 14 }}>Area breakdown</p>
          {topAreas.map(({ area, available, occupied, flagged }) => (
            <div key={area} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '0.78rem', color: C.charcoal, fontWeight: 500 }}>{area}</span>
                <span style={{ fontSize: '0.75rem', color: C.muted }}>{(available || 0) + (occupied || 0)} total</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: C.warm, overflow: 'hidden', display: 'flex' }}>
                <div style={{ height: '100%', background: C.green, flex: available || 0 }} />
                <div style={{ height: '100%', background: C.amber, flex: occupied || 0 }} />
                {flagged > 0 && <div style={{ height: '100%', background: C.red, flex: flagged }} />}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── USERS TAB ─────────────────────────────────────────────
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

  const ROLE_COLORS = { tenant: C.blue, owner: C.teal, scout: C.rust, super_admin: '#7c3aed' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone…" style={{ maxWidth: 240 }} />
        {['', 'tenant', 'owner', 'scout'].map(r => (
          <Btn key={r} variant={roleFilter === r ? 'primary' : 'outline'} size="sm" onClick={() => setRoleFilter(r)}>
            {r || 'All roles'}
          </Btn>
        ))}
        <Btn variant={suspFilter === 'true' ? 'danger' : 'outline'} size="sm" onClick={() => setSuspFilter(s => s === 'true' ? '' : 'true')}>
          Suspended only
        </Btn>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.length === 0 && <EmptyState message="No users found" />}
          {users.map(u => (
            <Card key={u.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: ROLE_COLORS[u.role] || C.muted, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                {u.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: C.ink }}>{u.name}</span>
                  <Badge label={u.role} color={ROLE_COLORS[u.role] || C.muted} />
                  {u.suspended && <Badge label="Suspended" color={C.red} />}
                </div>
                <p style={{ fontSize: '0.75rem', color: C.muted }}>
                  {u.phone ? `+91 ${u.phone}` : 'No phone'} · Joined {new Date(u.created_at).toLocaleDateString('en-IN')}
                </p>
                {u.suspended && u.suspend_reason && (
                  <p style={{ fontSize: '0.72rem', color: C.red, marginTop: 2 }}>Reason: {u.suspend_reason}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {u.suspended ? (
                  <Btn variant="success" size="xs" disabled={actionId === u.id}
                    onClick={() => setConfirmModal({ type: 'reactivate', user: u })}>
                    Reactivate
                  </Btn>
                ) : u.role !== 'super_admin' ? (
                  <Btn variant="danger" size="xs" disabled={actionId === u.id}
                    onClick={() => setConfirmModal({ type: 'suspend', user: u })}>
                    Suspend
                  </Btn>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm modal */}
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

// ── PROPERTIES TAB ────────────────────────────────────────
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

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      await adminAPI.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } finally { setActionId(null); setConfirmModal(null); }
  };

  const handleFlag = async (id) => {
    setActionId(id);
    try {
      await adminAPI.flagProperty(id, 'Flagged by admin');
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'flagged' } : p));
    } finally { setActionId(null); }
  };

  const handleEdit = async (id, updates) => {
    try {
      await adminAPI.updateProperty(id, updates);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      setEditModal(null);
    } catch { /* handled */ }
  };

  const handleSetAd = async (property) => {
    try {
      await adminAPI.createAd({ property_id: property.id, frequency: 'always' });
      setAdMsg(`"${property.title}" is now the active ad popup!`);
      setTimeout(() => setAdMsg(''), 4000);
    } catch { /* handled */ }
  };

  const STATUS_COLOR = {
    available: { color: C.green, label: 'Available' },
    occupied:  { color: C.amber, label: 'Occupied' },
    flagged:   { color: C.red,   label: 'Flagged' },
    deleted:   { color: C.muted, label: 'Deleted' },
  };

  return (
    <div>
      {adMsg && (
        <div style={{ marginBottom: 14, padding: '10px 16px', borderRadius: 10, background: C.greenLt, border: `1px solid ${C.green}30`, color: C.green, fontSize: '0.85rem', fontWeight: 600 }}>
          {adMsg}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title…" style={{ maxWidth: 240 }} />
        {['', 'available', 'occupied', 'flagged', 'deleted'].map(s => (
          <Btn key={s} variant={statusFilter === s ? 'primary' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
            {s || 'All status'}
          </Btn>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {properties.length === 0 && <EmptyState message="No properties found" />}
          {properties.map(p => {
            const sc = STATUS_COLOR[p.status] || { color: C.muted, label: p.status };
            return (
              <Card key={p.id} style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" style={{ width: 60, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 60, height: 48, borderRadius: 8, background: C.paper, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.sand} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: C.ink }}>{p.title}</span>
                    <Badge label={sc.label} color={sc.color} />
                    {p.profiles?.suspended && <Badge label="Owner Suspended" color={C.red} />}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: C.muted }}>
                    {p.area} · ₹{Number(p.rent).toLocaleString('en-IN')}/mo · {p.type || 'No type'}
                    {p.profiles?.name ? ` · by ${p.profiles.name}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Btn variant="outline" size="xs" onClick={() => setEditModal(p)}>Edit</Btn>
                  <Btn variant="outline" size="xs" onClick={() => handleSetAd(p)} title="Set as popup ad" style={{ color: C.rust }}>📢 Ad</Btn>
                  {p.status !== 'flagged' && p.status !== 'deleted' && (
                    <Btn variant="outline" size="xs" disabled={actionId === p.id} onClick={() => handleFlag(p.id)} style={{ color: C.amber }}>Flag</Btn>
                  )}
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

      {editModal && (
        <EditPropertyModal
          property={editModal}
          onClose={() => setEditModal(null)}
          onSave={(updates) => handleEdit(editModal.id, updates)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          title={`Delete "${confirmModal.property?.title}"?`}
          desc="This will remove the listing from the platform. This action cannot be undone."
          confirmLabel="Delete"
          confirmVariant="danger"
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => handleDelete(confirmModal.property.id)}
        />
      )}
    </div>
  );
}

// ── ADS TAB ───────────────────────────────────────────────
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
    try {
      await adminAPI.createAd({ property_id: selectedPropId, frequency });
      await loadAds();
      setSelectedPropId('');
    } finally { setCreating(false); }
  };

  const handleToggle = async (id) => {
    await adminAPI.toggleAd(id);
    await loadAds();
  };

  const handleDelete = async (id) => {
    await adminAPI.deleteAd(id);
    setAds(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Create ad */}
      <Card style={{ padding: '22px' }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: C.ink, marginBottom: 14 }}>
          Promote a property
        </p>
        <p style={{ fontSize: '0.8rem', color: C.muted, marginBottom: 16 }}>
          The selected property will appear as a popup when users open the site. Only one ad is active at a time.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>
              Property
            </label>
            <select
              value={selectedPropId}
              onChange={e => setSelectedPropId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.divider}`, background: C.cream, fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", color: C.ink, outline: 'none' }}
            >
              <option value="">Select a property…</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title} — {p.area} (₹{Number(p.rent).toLocaleString('en-IN')})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>
              Frequency
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.divider}`, background: C.cream, fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", color: C.ink, outline: 'none' }}
            >
              <option value="always">Every visit</option>
              <option value="once_per_session">Once per session</option>
              <option value="once_per_day">Once per day</option>
            </select>
          </div>
          <Btn variant="primary" size="sm" onClick={handleCreate} disabled={!selectedPropId || creating}>
            {creating ? 'Creating…' : 'Set as Ad'}
          </Btn>
        </div>
      </Card>

      {/* Existing ads */}
      <SectionTitle>All Advertisements</SectionTitle>
      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ads.length === 0 && <EmptyState message="No advertisements yet" />}
          {ads.map(ad => (
            <Card key={ad.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              {ad.properties?.images?.[0] ? (
                <img src={ad.properties.images[0]} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <div style={{ width: 64, height: 48, borderRadius: 8, background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.sand} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: C.ink }}>{ad.properties?.title || '—'}</span>
                  {ad.active
                    ? <Badge label="Active" color={C.green} />
                    : <Badge label="Inactive" color={C.muted} />}
                </div>
                <p style={{ fontSize: '0.75rem', color: C.muted }}>
                  {ad.properties?.area} · ₹{Number(ad.properties?.rent || 0).toLocaleString('en-IN')}/mo · {ad.frequency}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant={ad.active ? 'outline' : 'success'} size="xs" onClick={() => handleToggle(ad.id)}>
                  {ad.active ? 'Deactivate' : 'Activate'}
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

// ── SCOUTS TAB ────────────────────────────────────────────
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
    try {
      await adminAPI.updateReport(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } finally { setActionId(null); }
  };

  const STATUS_COLOR = { pending: C.amber, approved: C.green, rejected: C.red };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <Btn key={s} variant={statusFilter === s ? 'primary' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </Btn>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reports.length === 0 && <EmptyState message="No reports found" />}
          {reports.map(r => (
            <Card key={r.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <img src={r.image_url} alt="" style={{ width: 64, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: C.ink }}>{r.profiles?.name || 'Unknown scout'}</span>
                  <Badge label={r.status} color={STATUS_COLOR[r.status] || C.muted} />
                </div>
                <p style={{ fontSize: '0.75rem', color: C.muted }}>
                  {r.area} · {new Date(r.created_at).toLocaleDateString('en-IN')} · +{r.reward_points} pts
                </p>
              </div>
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn variant="success" size="xs" disabled={actionId === r.id} onClick={() => handleAction(r.id, 'approved')}>Approve</Btn>
                  <Btn variant="danger"  size="xs" disabled={actionId === r.id} onClick={() => handleAction(r.id, 'rejected')}>Reject</Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LOGS TAB ──────────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getLogs({ limit: 100 }).then(({ data }) => setLogs(data.logs || [])).finally(() => setLoading(false));
  }, []);

  const ACTION_COLOR = {
    delete_property: C.red, flag_property: C.amber, suspend_user: C.red,
    reactivate_user: C.green, create_ad: C.rust, activate_ad: C.green,
    deactivate_ad: C.muted, update_property: C.blue, approved_scout_report: C.green,
    rejected_scout_report: C.red,
  };

  return (
    <div>
      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.length === 0 && <EmptyState message="No audit logs yet" />}
          {logs.map(log => (
            <Card key={log.id} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACTION_COLOR[log.action] || C.muted, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: C.ink, marginRight: 8 }}>{log.action}</span>
                <span style={{ fontSize: '0.75rem', color: C.muted }}>by {log.profiles?.name || 'Admin'}</span>
                {log.meta && Object.keys(log.meta).length > 0 && (
                  <p style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2 }}>
                    {JSON.stringify(log.meta).slice(0, 80)}…
                  </p>
                )}
              </div>
              <span style={{ fontSize: '0.72rem', color: C.muted, flexShrink: 0 }}>
                {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MODALS ────────────────────────────────────────────────
function ConfirmModal({ title, desc, confirmLabel, confirmVariant, onCancel, onConfirm, withReason }) {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(28,23,17,0.4)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '28px 28px 24px', maxWidth: 380, width: '90%', boxShadow: '0 24px 60px rgba(28,23,17,0.2)' }}>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: C.ink, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: '0.85rem', color: C.muted, marginBottom: withReason ? 14 : 24 }}>{desc}</p>
        {withReason && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>Reason (optional)</label>
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
  const [form, setForm] = useState({ title: property.title, rent: property.rent, status: property.status, type: property.type || '', area: property.area });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(28,23,17,0.4)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '28px', maxWidth: 420, width: '90%', boxShadow: '0 24px 60px rgba(28,23,17,0.2)' }}>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: C.ink, marginBottom: 20 }}>Edit property</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Title', key: 'title', type: 'text' },
            { label: 'Rent (₹)', key: 'rent', type: 'number' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>{label}</label>
              <Input value={form[key]} onChange={e => update(key, e.target.value)} style={{}} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>Status</label>
            <select value={form.status} onChange={e => update('status', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${C.divider}`, background: C.cream, fontSize: '0.85rem' }}>
              {['available', 'occupied', 'flagged'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <Btn variant="outline" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" size="sm" onClick={() => onSave({ title: form.title, rent: parseInt(form.rent), status: form.status })}>Save changes</Btn>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function SuperAdmin() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [areaBreakdown, setAreaBreakdown] = useState({});

  useEffect(() => {
    if (!authLoading && profile?.role !== 'super_admin') {
      navigate('/');
    }
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

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: '#f6f3ee' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: C.rust, color: 'white', padding: '0 0 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: 400, color: 'white', letterSpacing: '-0.01em' }}>
                Super Admin
              </h1>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>
                NearbyRental · Full platform control
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.82rem',
                  background: activeTab === tab.key ? 'white' : 'transparent',
                  color: activeTab === tab.key ? C.rust : 'rgba(255,255,255,0.75)',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}