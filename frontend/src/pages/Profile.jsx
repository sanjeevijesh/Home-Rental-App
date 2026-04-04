// FILE: src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import BudgetSlider from '../components/BudgetSlider';
import { useAuth } from '../hooks/useAuth';
import { usersAPI, scoutsAPI } from '../services/api';

const ROLE_LABELS = { tenant: 'Tenant', owner: 'Property Owner', scout: 'Scout', super_admin: 'Super Admin' }; // ← ADDED super_admin

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [prefs, setPrefs] = useState({ preferred_areas: [], budget_min: 1000, budget_max: 50000 });

  useEffect(() => {
    if (profile) {
      setPrefs({
        preferred_areas: profile.preferred_areas || [],
        budget_min: profile.budget_min || 1000,
        budget_max: profile.budget_max || 50000,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'scout') {
      scoutsAPI.getLeaderboard().then(({ data }) => setLeaderboard(data.leaderboard || [])).catch(() => {});
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      await usersAPI.updatePreferences(prefs);
      await fetchProfile();
      setSuccess('Preferences saved!');
      setEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="var(--c-sand)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 8 }}>Not signed in</h2>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop: 8 }}>Sign in</button>
      </div>
    );
  }

  const scoutRank = leaderboard.findIndex(s => s.id === profile?.id) + 1;
  const initials = profile?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="page-container" style={{ maxWidth: 520 }}>

      {/* Profile card */}
      <div
        className="card"
        style={{
          padding: '32px 28px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: 'var(--c-rust)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 700,
          boxShadow: '0 6px 20px rgba(181,84,28,0.3)',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 3 }}>
            {profile?.name}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: profile?.phone ? 3 : 0 }}>
            {ROLE_LABELS[profile?.role] || profile?.role}
          </p>
          {profile?.phone && (
            <p style={{ fontSize: '0.75rem', color: 'var(--c-sand)' }}>+91 {profile.phone}</p>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ marginBottom: 16, padding: '11px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="animate-fade-in" style={{ marginBottom: 16, padding: '11px 16px', borderRadius: 10, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: '#15803d', fontSize: '0.85rem' }}>
          {success}
        </div>
      )}

      {/* Tenant: Preferences */}
      {profile?.role === 'tenant' && (
        <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-ink)' }}>Alert preferences</h2>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                fontSize: '0.78rem', fontWeight: 700, color: editing ? 'var(--c-muted)' : 'var(--c-rust)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="field-label">Preferred areas</label>
                <AreaSelector
                  value={prefs.preferred_areas}
                  onChange={areas => setPrefs(p => ({ ...p, preferred_areas: areas }))}
                  multiple
                />
              </div>
              <div>
                <label className="field-label">Budget range</label>
                <BudgetSlider
                  minValue={prefs.budget_min}
                  maxValue={prefs.budget_max}
                  onChange={({ min, max }) => setPrefs(p => ({ ...p, budget_min: min, budget_max: max }))}
                />
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '12px' }}>
                {saving ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p className="field-label">Watching areas</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {prefs.preferred_areas.length > 0
                    ? prefs.preferred_areas.map(a => (
                        <span key={a} className="chip" style={{ background: 'rgba(181,84,28,0.08)', color: 'var(--c-rust)' }}>{a}</span>
                      ))
                    : <span style={{ fontSize: '0.85rem', color: 'var(--c-muted)', fontStyle: 'italic' }}>Not set — edit to add areas</span>
                  }
                </div>
              </div>
              <div>
                <p className="field-label">Budget range</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--c-ink)', marginTop: 4 }}>
                  ₹{prefs.budget_min.toLocaleString('en-IN')} – ₹{prefs.budget_max.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scout: Stats & Leaderboard */}
      {profile?.role === 'scout' && (
        <>
          <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 16 }}>
              Your stats
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total points', value: profile.points || 0, color: 'var(--c-rust)' },
                { label: 'Leaderboard rank', value: scoutRank ? `#${scoutRank}` : '—', color: 'var(--c-teal)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  padding: '20px 16px', borderRadius: 12,
                  background: 'var(--c-paper)', textAlign: 'center',
                }}>
                  <div className="serif" style={{ fontSize: '2.2rem', color, lineHeight: 1, marginBottom: 4 }}>
                    {value}
                  </div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--c-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {leaderboard.length > 0 && (
            <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 16 }}>
                Leaderboard
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {leaderboard.map((scout, idx) => {
                  const isMe = scout.id === profile.id;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div
                      key={scout.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10,
                        background: isMe ? 'rgba(181,84,28,0.06)' : 'var(--c-paper)',
                        border: isMe ? '1.5px solid rgba(181,84,28,0.2)' : '1.5px solid transparent',
                      }}
                    >
                      <span style={{ width: 24, fontSize: idx < 3 ? '1.1rem' : '0.8rem', fontWeight: 700, color: 'var(--c-muted)', flexShrink: 0 }}>
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </span>
                      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--c-rust)' : 'var(--c-ink)' }}>
                        {scout.name}{isMe ? ' (you)' : ''}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--c-charcoal)' }}>
                        {scout.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Super Admin: Dashboard shortcut ── */}
      {profile?.role === 'super_admin' && (
        <button
          onClick={() => navigate('/admin')}
          style={{
            width: '100%', padding: '13px', marginBottom: 12,
            borderRadius: 10, border: '1.5px solid rgba(181,84,28,0.3)',
            background: 'rgba(181,84,28,0.06)', color: 'var(--c-rust)',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(181,84,28,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(181,84,28,0.06)'}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Admin Dashboard
        </button>
      )}

      {/* Logout */}
      <button
        onClick={async () => { await logout(); navigate('/'); }}
        id="logout-btn"
        style={{
          width: '100%', padding: '13px',
          borderRadius: 10, border: '1.5px solid #fecaca',
          background: 'transparent', color: '#dc2626',
          fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
          transition: 'background 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign out
      </button>
    </div>
  );
}