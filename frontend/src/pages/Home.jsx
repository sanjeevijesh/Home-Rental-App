// FILE: src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import BudgetSlider from '../components/BudgetSlider';
import NotificationBanner from '../components/NotificationBanner';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../hooks/useRealtime';
import { propertiesAPI } from '../services/api';

const STEPS = [
  {
    num: '01',
    title: 'Scouts Spot',
    desc: 'Local scouts photograph "To Let" boards across Tuticorin daily.',
  },
  {
    num: '02',
    title: 'Instant Upload',
    desc: 'Listings go live within seconds — you get notified immediately.',
  },
  {
    num: '03',
    title: 'Direct Contact',
    desc: 'Call or WhatsApp the owner directly. No brokerage. No delays.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedArea, setSelectedArea] = useState('');
  const [budget, setBudget] = useState({ min: 1000, max: 50000 });
  const [areaCount, setAreaCount] = useState(null);
  const [totalCount, setTotalCount] = useState(null);

  const { newProperty, clearNotification } = useRealtime({
    preferredAreas: profile?.preferred_areas || [],
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [totalRes, areaRes] = await Promise.all([
          propertiesAPI.getCount(),
          selectedArea ? propertiesAPI.getCount(selectedArea) : Promise.resolve({ data: { count: null } }),
        ]);
        setTotalCount(totalRes.data.count);
        setAreaCount(selectedArea ? areaRes.data.count : null);
      } catch { /* non-critical */ }
    };
    fetchCounts();
  }, [selectedArea]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedArea) params.set('area', selectedArea);
    if (budget.min > 1000) params.set('minRent', budget.min);
    if (budget.max < 50000) params.set('maxRent', budget.max);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <NotificationBanner property={newProperty} onDismiss={clearNotification} />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(160deg, var(--c-cream) 0%, var(--c-paper) 100%)',
          borderBottom: '1px solid var(--c-divider)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative arch */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '-80px',
            top: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '60px solid',
            borderColor: 'rgba(181,84,28,0.06)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '-60px',
            bottom: '-100px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: '40px solid',
            borderColor: 'rgba(29,106,106,0.05)',
            pointerEvents: 'none',
          }}
        />

        <div className="page-container" style={{ maxWidth: 1100, paddingTop: 72, paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48 }}>

            {/* Heading block */}
            <div className="animate-fade-up" style={{ maxWidth: 560 }}>
              {/* Live badge */}
              <div
                className="animate-fade-up"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--c-teal-lt)',
                  color: 'var(--c-teal)',
                  padding: '5px 14px',
                  borderRadius: 99,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 24,
                }}
              >
                <span className="live-dot" style={{ background: 'var(--c-teal)', '--ring-color': 'var(--c-teal)' }} />
                Live Updates · Thoothukudi
              </div>

              <h1
                className="serif animate-fade-up anim-delay-1"
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                  lineHeight: 1.1,
                  color: 'var(--c-ink)',
                  marginBottom: 20,
                  letterSpacing: '-0.02em',
                }}
              >
                Find your
                <br />
                <em style={{ color: 'var(--c-rust)', fontStyle: 'italic' }}>perfect home</em>
                <br />
                in Tuticorin
              </h1>

              <p
                className="animate-fade-up anim-delay-2"
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'var(--c-muted)',
                  marginBottom: 40,
                  maxWidth: 440,
                }}
              >
                Community-driven listings updated in real-time by local scouts.
                No middlemen. No brokerage. Direct to owner.
              </p>

              {/* Stats */}
              <div
                className="animate-fade-up anim-delay-3"
                style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}
              >
                {[
                  { value: totalCount !== null ? totalCount : '—', label: 'Active listings' },
                  { value: '10', label: 'Areas covered' },
                  { value: '24/7', label: 'Live updates' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div
                      className="serif"
                      style={{
                        fontSize: '2rem',
                        fontWeight: 400,
                        color: 'var(--c-ink)',
                        lineHeight: 1,
                        marginBottom: 2,
                      }}
                    >
                      {value}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-muted)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search card */}
            <div
              className="card animate-fade-up anim-delay-2"
              id="search-card"
              style={{ padding: '32px', maxWidth: 480 }}
            >
              <h2
                className="serif"
                style={{ fontSize: '1.4rem', color: 'var(--c-ink)', marginBottom: 24, letterSpacing: '-0.01em' }}
              >
                Where are you looking?
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="field-label">Area</label>
                  <AreaSelector
                    value={selectedArea}
                    onChange={setSelectedArea}
                    placeholder="Select an area in Tuticorin"
                    id="home-area-selector"
                  />
                  {selectedArea && areaCount !== null && (
                    <p
                      className="animate-fade-in"
                      style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--c-teal)', fontWeight: 500 }}
                    >
                      {areaCount} listings available in {selectedArea}
                    </p>
                  )}
                </div>

                <div>
                  <label className="field-label">Monthly Budget</label>
                  <BudgetSlider
                    minValue={budget.min}
                    maxValue={budget.max}
                    onChange={setBudget}
                    id="home-budget-slider"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="btn-primary"
                  id="home-search-btn"
                  style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: 4 }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                  </svg>
                  Search Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="page-container" style={{ maxWidth: 1100, paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-rust)', marginBottom: 8 }}>
              The Process
            </p>
            <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--c-ink)', letterSpacing: '-0.02em' }}>
              How it works
            </h2>
          </div>
          <button
            onClick={() => navigate('/listings')}
            className="btn-secondary"
          >
            Browse all listings
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="animate-fade-up"
              style={{
                animationDelay: `${i * 0.12}s`,
                padding: '32px',
                borderRadius: 16,
                background: i === 0 ? 'var(--c-rust)' : 'white',
                border: '1px solid var(--c-divider)',
                boxShadow: i === 0 ? '0 8px 40px rgba(181,84,28,0.25)' : 'var(--shadow-card)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {i === 0 && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    bottom: -40,
                    right: -40,
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />
              )}
              <div
                className="serif"
                style={{
                  fontSize: '3rem',
                  fontWeight: 400,
                  lineHeight: 1,
                  color: i === 0 ? 'rgba(255,255,255,0.25)' : 'var(--c-warm)',
                  marginBottom: 20,
                  fontStyle: 'italic',
                }}
              >
                {step.num}
              </div>
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: i === 0 ? 'white' : 'var(--c-ink)',
                  marginBottom: 10,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.65,
                  color: i === 0 ? 'rgba(255,255,255,0.75)' : 'var(--c-muted)',
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--c-paper)',
          borderTop: '1px solid var(--c-divider)',
          borderBottom: '1px solid var(--c-divider)',
        }}
      >
        <div
          className="page-container"
          style={{
            maxWidth: 1100,
            paddingTop: 60,
            paddingBottom: 60,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--c-muted)',
              marginBottom: 12,
            }}
          >
            Get started today
          </p>
          <h2
            className="serif"
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              color: 'var(--c-ink)',
              marginBottom: 24,
              letterSpacing: '-0.02em',
            }}
          >
            Ready to find your next home?
          </h2>
          <button
            onClick={() => navigate('/listings')}
            className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '0.95rem' }}
          >
            Explore all listings
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        style={{
          textAlign: 'center',
          padding: '28px 20px',
          fontSize: '0.75rem',
          color: 'var(--c-sand)',
          letterSpacing: '0.03em',
        }}
      >
        NearbyRental © {new Date().getFullYear()} — Crafted for Thoothukudi
      </footer>
    </div>
  );
}