// FILE: src/pages/ScoutUpload.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import { scoutsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function ScoutUpload() {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [area, setArea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!image) { setError('Please capture or select a photo'); return; }
    if (!area)  { setError('Please select an area'); return; }
    setSubmitting(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('image', image);
      fd.append('area', area);
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
          fd.append('lat', pos.coords.latitude);
          fd.append('lng', pos.coords.longitude);
        } catch { /* optional */ }
      }
      const { data } = await scoutsAPI.submitReport(fd);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally { setSubmitting(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="var(--c-sand)" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 8 }}>Login required</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', marginBottom: 24 }}>Sign in as a scout to submit reports.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Sign in</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page-container animate-fade-in" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 60 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(22,163,74,0.1)', border: '2px solid rgba(22,163,74,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="serif" style={{ fontSize: '2rem', color: 'var(--c-ink)', marginBottom: 10, letterSpacing: '-0.02em' }}>
          Report submitted!
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', marginBottom: 28 }}>
          {result.message || 'Thanks for contributing to the community.'}
        </p>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
          {[
            { label: 'Total points', value: result.scout?.points || 0 },
            { label: 'Your rank', value: result.scout?.rank ? `#${result.scout.rank}` : '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--c-divider)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>{label}</span>
              <span className="serif" style={{ fontSize: '1.5rem', color: 'var(--c-ink)' }}>{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setResult(null); setImage(null); setPreview(null); setArea(''); }}
          className="btn-primary"
          style={{ padding: '12px 28px' }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 480 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="serif" style={{ fontSize: '1.9rem', color: 'var(--c-ink)', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Scout report
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)' }}>
          Photograph a "To Let" board and earn points for the community.
        </p>
      </div>

      {/* Points card */}
      {profile && (
        <div
          className="card"
          style={{ padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--c-rust)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-muted)' }}>
                Your points
              </p>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--c-ink)', lineHeight: 1.2 }}>
                {profile.points || 0}
              </p>
            </div>
          </div>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700,
            color: '#15803d', background: 'rgba(22,163,74,0.1)',
            padding: '4px 10px', borderRadius: 99,
          }}>
            +10 per report
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 16, padding: '11px 16px', borderRadius: 10,
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.85rem',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Camera */}
        <label style={{ display: 'block', cursor: 'pointer' }}>
          <div style={{
            border: `2px dashed ${preview ? 'var(--c-rust)' : 'var(--c-divider)'}`,
            borderRadius: 16, overflow: 'hidden',
            background: preview ? 'transparent' : 'var(--c-paper)',
            transition: 'border-color 0.2s',
          }}>
            {preview ? (
              <div style={{ position: 'relative' }}>
                <img src={preview} alt="Preview" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(28,23,17,0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(28,23,17,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(28,23,17,0)'}
                >
                  <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, opacity: 0 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    Tap to change
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '44px 32px', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, background: 'white',
                  border: '1px solid var(--c-divider)', boxShadow: 'var(--shadow-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--c-rust)" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-charcoal)', marginBottom: 4 }}>
                  Photograph the "To Let" board
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--c-muted)' }}>
                  Use camera or select from gallery
                </p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
        </label>

        {/* Area selector */}
        <div>
          <label className="field-label">Where is this board located?</label>
          <AreaSelector value={area} onChange={setArea} placeholder="Select area in Tuticorin" />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', marginTop: 4 }}
        >
          {submitting ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Submitting…
            </span>
          ) : 'Submit report'}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}