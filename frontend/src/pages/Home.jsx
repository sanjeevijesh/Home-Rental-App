// FILE: src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import BudgetSlider from '../components/BudgetSlider';
import NotificationBanner from '../components/NotificationBanner';
import Icon from '../components/Icons';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../hooks/useRealtime';
import { propertiesAPI } from '../services/api';

/* ─── data ─────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    icon: '🔍',
    title: 'Scouts Spot',
    desc: 'Local scouts photograph "To Let" boards across Tuticorin every single day — no listing goes unnoticed.',
    accent: 'var(--c-rust)',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'Instant Upload',
    desc: 'Listings go live within seconds of being spotted. You get notified before anyone else.',
    accent: 'var(--c-teal)',
  },
  {
    num: '03',
    icon: '📞',
    title: 'Direct Contact',
    desc: 'Call or WhatsApp the owner directly. Zero brokerage. Zero delays. Zero middlemen.',
    accent: '#7C5CBF',
  },
];

const HIGHLIGHTS = [
  { icon: '⚡', label: 'Full-Stack Dev' },
  { icon: '🎯', label: 'Hackathon Builder' },
  { icon: '🖥️', label: 'System Admin' },
  { icon: '✦', label: 'UI/UX Focused' },
];

const AREAS = [
  'Meelavittan', 'VOC Port', 'Palayamkottai Rd', 'Millerpuram',
  'Ettayapuram Rd', 'Caldwell Colony', 'Rose Garden', 'Tidal Park',
  'Muthu Nagar', 'Madurai Rd',
];

const WHY_ITEMS = [
  { icon: '🚫', title: 'Zero Brokerage', desc: 'Every rupee goes to the owner, not a middleman.' },
  { icon: '🕐', title: 'Real-Time Listings', desc: 'Updated the moment a scout finds a new board.' },
  { icon: '📍', title: 'Hyperlocal Focus', desc: 'Built exclusively for Thoothukudi — deeply local.' },
  { icon: '💬', title: 'Direct to Owner', desc: 'WhatsApp or call straight from the listing card.' },
  { icon: '🔓', title: 'Free to Browse', desc: 'No sign-up required to explore all listings.' },
  { icon: '📸', title: 'Photo Verified', desc: 'Every listing has a scout photo as proof.' },
];

/* ─── animated counter hook ────────────────────── */
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (target == null || target === '—') return;
    const num = parseInt(target, 10);
    if (isNaN(num)) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * num));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return count;
}

/* ─── floating particle ─────────────────────────── */
function Particle({ style }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'floatUp 8s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/* ─── component ─────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedArea, setSelectedArea] = useState('');
  const [budget, setBudget] = useState({ min: 1000, max: 50000 });
  const [areaCount, setAreaCount] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const animCount = useCountUp(totalCount, 2000);

  const { newProperty, clearNotification } = useRealtime({
    preferredAreas: profile?.preferred_areas || [],
  });

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [totalRes, areaRes] = await Promise.all([
          propertiesAPI.getCount(),
          selectedArea
            ? propertiesAPI.getCount(selectedArea)
            : Promise.resolve({ data: { count: null } }),
        ]);
        setTotalCount(totalRes.data.count);
        setAreaCount(selectedArea ? areaRes.data.count : null);
      } catch { /* non-critical */ }
    };
    fetchCounts();
  }, [selectedArea]);

  // auto-cycle step highlights
  useEffect(() => {
    const id = setInterval(() => setActiveStep((s) => (s + 1) % STEPS.length), 3200);
    return () => clearInterval(id);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedArea) params.set('area', selectedArea);
    if (budget.min > 1000) params.set('minRent', budget.min);
    if (budget.max < 50000) params.set('maxRent', budget.max);
    navigate(`/listings?${params.toString()}`);
  };

  /* ── inline styles / keyframes ─────────────────── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --hero-grad: linear-gradient(145deg, #0d1117 0%, #161b27 50%, #1a1200 100%);
    }

    .home-wrap * { box-sizing: border-box; }

    @keyframes floatUp {
      0%   { transform: translateY(0)   scale(1);   opacity: 0.6; }
      50%  { transform: translateY(-28px) scale(1.1); opacity: 1; }
      100% { transform: translateY(0)   scale(1);   opacity: 0.6; }
    }
    @keyframes heroIn {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideRight {
      from { width: 0; }
      to   { width: 100%; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes stepIn {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes cardHover {
      to { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,0.13); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .hero-in { animation: heroIn 0.85s cubic-bezier(0.16,1,0.3,1) forwards; }
    .hero-in-1 { animation: heroIn 0.85s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
    .hero-in-2 { animation: heroIn 0.85s 0.22s cubic-bezier(0.16,1,0.3,1) both; }
    .hero-in-3 { animation: heroIn 0.85s 0.36s cubic-bezier(0.16,1,0.3,1) both; }
    .hero-in-4 { animation: heroIn 0.85s 0.5s cubic-bezier(0.16,1,0.3,1) both; }

    .step-anim { animation: stepIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }

    .why-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .why-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 60px rgba(0,0,0,0.11);
    }

    .area-chip {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .area-chip:hover {
      background: var(--c-rust) !important;
      color: white !important;
      border-color: var(--c-rust) !important;
      transform: scale(1.04);
    }

    .shimmer-btn {
      background: linear-gradient(
        90deg,
        var(--c-rust) 0%,
        #e8763a 40%,
        #ffb07c 50%,
        #e8763a 60%,
        var(--c-rust) 100%
      );
      background-size: 200% auto;
      transition: background-position 0.5s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }
    .shimmer-btn:hover {
      background-position: right center;
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(181,84,28,0.45);
    }
    .shimmer-btn:active {
      transform: translateY(0);
    }

    .ticker-wrap {
      overflow: hidden;
      white-space: nowrap;
    }
    .ticker-inner {
      display: inline-block;
      animation: ticker 26s linear infinite;
    }

    .search-card-glow {
      box-shadow: 0 0 0 1px rgba(181,84,28,0.12),
                  0 32px 80px rgba(0,0,0,0.18),
                  0 8px 20px rgba(181,84,28,0.08);
    }

    .stat-num {
      background: linear-gradient(135deg, var(--c-rust), #e8763a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    @media (max-width: 760px) {
      .hero-grid { grid-template-columns: 1fr !important; }
      .why-grid  { grid-template-columns: 1fr 1fr !important; }
      .steps-layout { flex-direction: column !important; }
      .dev-grid  { grid-template-columns: 1fr !important; } 
    }
    @media (max-width: 480px) {
      .why-grid { grid-template-columns: 1fr !important; }
    }
  `;

  const TICKER_ITEMS = [
    '✦ Zero Brokerage',
    '✦ Real-time Listings',
    '✦ Direct to Owner',
    '✦ Free to Browse',
    '✦ Scout-Verified Photos',
    '✦ Thoothukudi Only',
    '✦ Zero Brokerage',
    '✦ Real-time Listings',
    '✦ Direct to Owner',
    '✦ Free to Browse',
    '✦ Scout-Verified Photos',
    '✦ Thoothukudi Only',
  ];

  return (
    <div className="home-wrap" style={{ minHeight: 'calc(100vh - 4rem)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{css}</style>

      <NotificationBanner property={newProperty} onDismiss={clearNotification} />

      {/* ═══════════════════════════════════════════════ HERO */}
      <section
        style={{
          background: 'var(--hero-grad)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Ambient glow blobs */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '8%', right: '12%',
            width: 420, height: 420, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(181,84,28,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '15%', left: '5%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,106,106,0.15) 0%, transparent 70%)',
            filter: 'blur(32px)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '40%',
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,92,191,0.1) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }} />
        </div>

        {/* Floating particles */}
        {[
          { width: 6, height: 6, background: 'rgba(181,84,28,0.5)', top: '20%', left: '8%', animationDelay: '0s' },
          { width: 4, height: 4, background: 'rgba(29,106,106,0.5)', top: '60%', left: '15%', animationDelay: '2s' },
          { width: 8, height: 8, background: 'rgba(255,176,124,0.3)', top: '35%', right: '8%', animationDelay: '1s' },
          { width: 5, height: 5, background: 'rgba(255,255,255,0.2)', top: '75%', right: '20%', animationDelay: '3s' },
          { width: 3, height: 3, background: 'rgba(181,84,28,0.4)', top: '15%', left: '55%', animationDelay: '1.5s' },
        ].map((p, i) => <Particle key={i} style={p} />)}

        {/* Grid overlay texture */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Main hero content */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', flex: 1, display: 'flex', alignItems: 'center', paddingTop: 80, paddingBottom: 80 }}>
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 440px',
              gap: 64,
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Left — copy */}
            <div>
              {/* Live badge */}
              <div className="hero-in" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(29,106,106,0.18)',
                border: '1px solid rgba(29,106,106,0.35)',
                color: '#4ECDC4',
                padding: '6px 16px', borderRadius: 99,
                fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 28,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#4ECDC4', position: 'relative', flexShrink: 0,
                }}>
                  <span style={{
                    position: 'absolute', inset: -3, borderRadius: '50%',
                    border: '2px solid rgba(78,205,196,0.4)',
                    animation: 'pulse-ring 1.8s ease-out infinite',
                  }} />
                </span>
                Live Updates · Thoothukudi
              </div>

              {/* H1 */}
              <h1
                className="hero-in-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
                  lineHeight: 1.06,
                  color: 'white',
                  marginBottom: 24,
                  letterSpacing: '-0.02em',
                  fontWeight: 700,
                }}
              >
                Find your{' '}
                <em style={{
                  color: 'var(--c-rust)',
                  fontStyle: 'italic',
                  position: 'relative',
                }}>
                  perfect home
                  <span aria-hidden style={{
                    position: 'absolute', bottom: -4, left: 0,
                    height: 3, borderRadius: 99,
                    background: 'linear-gradient(90deg, var(--c-rust), transparent)',
                    animation: 'slideRight 1.2s 0.8s ease-out both',
                    width: '100%',
                  }} />
                </em>
                <br />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>in Tuticorin</span>
              </h1>

              {/* Sub */}
              <p
                className="hero-in-2"
                style={{
                  fontSize: '1.05rem', lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.55)',
                  marginBottom: 44, maxWidth: 460,
                }}
              >
                Community-driven rental listings updated in real-time by local scouts.
                <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}> No middlemen. No brokerage. Direct to owner.</strong>
              </p>

              {/* Stats row */}
              <div
                className="hero-in-3"
                style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 40 }}
              >
                {[
                  { value: totalCount !== null ? animCount : '—', label: 'Active Listings', suffix: '+' },
                  { value: '10', label: 'Areas Covered', suffix: '' },
                  { value: '24/7', label: 'Live Updates', suffix: '' },
                ].map(({ value, label, suffix }) => (
                  <div key={label} style={{ position: 'relative' }}>
                    <div
                      className="serif stat-num"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '2.6rem', fontWeight: 700,
                        lineHeight: 1, marginBottom: 4,
                      }}
                    >
                      {value}{typeof value === 'number' ? suffix : ''}
                    </div>
                    <div style={{
                      fontSize: '0.68rem', fontWeight: 600,
                      letterSpacing: '0.09em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.38)',
                    }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick area chips */}
              <div className="hero-in-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', alignSelf: 'center', marginRight: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Popular:
                </span>
                {AREAS.slice(0, 5).map((area) => (
                  <button
                    key={area}
                    className="area-chip"
                    onClick={() => { setSelectedArea(area); document.getElementById('search-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.65)',
                      padding: '5px 14px', borderRadius: 99,
                      fontSize: '0.75rem', fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — search card */}
            <div
              id="search-card"
              className="search-card-glow"
              style={{
                background: 'rgba(255,255,255,0.97)',
                borderRadius: 24, padding: '36px 32px',
                position: 'relative', overflow: 'hidden',
                animation: heroVisible ? 'heroIn 0.9s 0.4s cubic-bezier(0.16,1,0.3,1) both' : 'none',
              }}
            >
              {/* Card accent strip */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: 'linear-gradient(90deg, var(--c-rust), #ffb07c, var(--c-teal))',
              }} />

              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.5rem', color: 'var(--c-ink)',
                  marginBottom: 6, letterSpacing: '-0.01em',
                }}
              >
                Where are you looking?
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: 28 }}>
                Search across 10 neighbourhoods in Thoothukudi
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                  <label
                    htmlFor="home-area-selector"
                    style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: 8 }}
                  >
                    Area
                  </label>
                  <AreaSelector
                    value={selectedArea}
                    onChange={setSelectedArea}
                    placeholder="Select an area in Tuticorin"
                    id="home-area-selector"
                  />
                  {selectedArea && areaCount !== null && (
                    <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--c-teal)', fontWeight: 600 }}>
                      ✓ {areaCount} listings in {selectedArea}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: 8 }}
                  >
                    Monthly Budget
                  </label>
                  <BudgetSlider
                    minValue={budget.min}
                    maxValue={budget.max}
                    onChange={setBudget}
                    id="home-budget-slider"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="shimmer-btn"
                  id="home-search-btn"
                  style={{
                    width: '100%', padding: '15px',
                    fontSize: '0.95rem', fontWeight: 700,
                    color: 'white', border: 'none',
                    borderRadius: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 10,
                    letterSpacing: '0.02em',
                    marginTop: 4,
                  }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                  </svg>
                  Search Properties
                </button>
              </div>

              {/* Trust note */}
              <div style={{
                marginTop: 20, paddingTop: 18,
                borderTop: '1px solid var(--c-divider)',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: '0.73rem', color: 'var(--c-muted)',
              }}>
                <span style={{ fontSize: '1rem' }}>🔒</span>
                No sign-up required · 100% free to browse
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div aria-hidden style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(transparent, var(--c-cream))',
        }} />
      </section>

      {/* ═══════════════════════════════════════════════ TICKER */}
      <div style={{
        background: 'var(--c-rust)', overflow: 'hidden',
        padding: '12px 0', position: 'relative', zIndex: 2,
      }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {TICKER_ITEMS.map((item, i) => (
              <span key={i} style={{
                display: 'inline-block', marginRight: 48,
                fontSize: '0.8rem', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.9)',
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ HOW IT WORKS */}
      <section style={{ background: 'var(--c-cream)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 64 }}>
            <div>
              <p style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--c-rust)', marginBottom: 10,
              }}>
                The Process
              </p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                color: 'var(--c-ink)', letterSpacing: '-0.02em', lineHeight: 1.1,
              }}>
                How NearbyRental<br />
                <em style={{ color: 'var(--c-rust)', fontStyle: 'italic' }}>actually works</em>
              </h2>
            </div>
            <button
              onClick={() => navigate('/listings')}
              style={{
                padding: '12px 28px', borderRadius: 99,
                border: '2px solid var(--c-ink)',
                background: 'transparent', color: 'var(--c-ink)',
                fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--c-ink)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-ink)'; }}
            >
              Browse all listings →
            </button>
          </div>

          {/* Interactive steps layout */}
          <div className="steps-layout" style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
            {/* Step selector tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
              {STEPS.map((step, i) => (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(i)}
                  style={{
                    textAlign: 'left', padding: '18px 20px', borderRadius: 14,
                    border: `2px solid ${activeStep === i ? step.accent : 'var(--c-divider)'}`,
                    background: activeStep === i ? `${step.accent}12` : 'white',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  <span style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: activeStep === i ? step.accent : 'var(--c-cream)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                    transition: 'all 0.25s',
                  }}>
                    {step.icon}
                  </span>
                  <div>
                    <div style={{
                      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: activeStep === i ? step.accent : 'var(--c-muted)',
                      marginBottom: 2,
                    }}>
                      Step {step.num}
                    </div>
                    <div style={{
                      fontSize: '0.9rem', fontWeight: 600,
                      color: activeStep === i ? 'var(--c-ink)' : 'var(--c-muted)',
                    }}>
                      {step.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Active step panel */}
            <div
              key={activeStep}
              className="step-anim"
              style={{
                flex: 1, borderRadius: 20, overflow: 'hidden',
                background: STEPS[activeStep].accent,
                padding: '52px 48px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: 280, position: 'relative',
              }}
            >
              {/* decorative circle */}
              <div aria-hidden style={{
                position: 'absolute', bottom: -60, right: -60,
                width: 240, height: 240, borderRadius: '50%',
                border: '48px solid rgba(255,255,255,0.08)',
              }} />
              <div aria-hidden style={{
                position: 'absolute', top: -30, left: '60%',
                width: 120, height: 120, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }} />

              <div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '5rem', fontWeight: 700, fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.15)', lineHeight: 1, marginBottom: 24,
                }}>
                  {STEPS[activeStep].num}
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2rem', color: 'white', marginBottom: 16, fontWeight: 700,
                }}>
                  {STEPS[activeStep].title}
                </h3>
                <p style={{
                  fontSize: '1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.78)',
                  maxWidth: 400,
                }}>
                  {STEPS[activeStep].desc}
                </p>
              </div>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 8, marginTop: 40 }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{
                    width: i === activeStep ? 28 : 8,
                    height: 8, borderRadius: 99,
                    background: i === activeStep ? 'white' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ WHY US */}
      <section style={{ background: 'var(--c-paper)', padding: '96px 24px', borderTop: '1px solid var(--c-divider)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--c-rust)', marginBottom: 10,
            }}>
              Why Choose Us
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              color: 'var(--c-ink)', letterSpacing: '-0.02em',
            }}>
              Built different,{' '}
              <em style={{ color: 'var(--c-rust)', fontStyle: 'italic' }}>for Thoothukudi</em>
            </h2>
            <p style={{ color: 'var(--c-muted)', marginTop: 12, fontSize: '0.95rem', maxWidth: 480, margin: '12px auto 0' }}>
              We're not another generic rental site. We're community-powered and hyperlocal.
            </p>
          </div>

          <div
            className="why-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
          >
            {WHY_ITEMS.map((item, i) => (
              <div
                key={item.title}
                className="why-card"
                style={{
                  background: 'white',
                  border: '1px solid var(--c-divider)',
                  borderRadius: 18, padding: '28px 24px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: i % 3 === 0 ? 'rgba(181,84,28,0.1)' : i % 3 === 1 ? 'rgba(29,106,106,0.1)' : 'rgba(124,92,191,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: 18,
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '1rem', fontWeight: 700,
                  color: 'var(--c-ink)', marginBottom: 8,
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--c-muted)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ EXPLORE AREAS */}
      <section style={{ background: 'var(--c-cream)', padding: '80px 24px', borderTop: '1px solid var(--c-divider)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-rust)', marginBottom: 8 }}>
                Explore
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', color: 'var(--c-ink)', letterSpacing: '-0.02em' }}>
                Browse by area
              </h2>
            </div>
            <button
              onClick={() => navigate('/listings')}
              style={{ fontSize: '0.8rem', color: 'var(--c-rust)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}
            >
              View all →
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {AREAS.map((area, i) => (
              <button
                key={area}
                className="area-chip"
                onClick={() => navigate(`/listings?area=${area}`)}
                style={{
                  padding: '10px 22px', borderRadius: 99,
                  border: '1.5px solid var(--c-divider)',
                  background: 'white', color: 'var(--c-ink)',
                  fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer', letterSpacing: '0.01em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                📍 {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ CTA BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, var(--c-ink) 0%, #2a1a00 100%)',
        padding: '80px 24px', position: 'relative', overflow: 'hidden',
        borderTop: '1px solid var(--c-divider)',
      }}>
        <div aria-hidden style={{
          position: 'absolute', top: -80, right: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(181,84,28,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,176,124,0.7)', marginBottom: 12 }}>
            Get Started Today
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
            color: 'white', marginBottom: 16, letterSpacing: '-0.02em',
          }}>
            Ready to find your{' '}
            <em style={{ color: '#ffb07c', fontStyle: 'italic' }}>next home?</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 36, fontSize: '0.95rem', lineHeight: 1.7 }}>
            Join hundreds of Thoothukudi residents who found their rental without a broker.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/listings')}
              className="shimmer-btn"
              style={{
                padding: '15px 36px', borderRadius: 12, border: 'none',
                fontSize: '0.95rem', fontWeight: 700, color: 'white',
                cursor: 'pointer', letterSpacing: '0.02em',
              }}
            >
              Explore all listings
            </button>
            <button
              onClick={() => navigate('/post-property')}
              style={{
                padding: '15px 36px', borderRadius: 12,
                border: '2px solid rgba(255,255,255,0.2)',
                background: 'transparent', color: 'white',
                fontSize: '0.95rem', fontWeight: 600,
                cursor: 'pointer', letterSpacing: '0.02em',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              Post a Property
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ ABOUT DEVELOPER */}
      <section style={{
        background: 'linear-gradient(160deg, var(--c-cream) 0%, var(--c-paper) 100%)',
        borderTop: '1px solid var(--c-divider)', padding: '96px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-rust)', marginBottom: 8 }}>
            The Builder
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--c-ink)', letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1.15 }}>
            About the <em style={{ color: 'var(--c-rust)', fontStyle: 'italic' }}>Developer</em>
          </h2>
          <div style={{ width: 48, height: 3, borderRadius: 99, background: 'var(--c-teal)', margin: '20px 0 48px' }} />

          <div className="dev-grid" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 48, alignItems: 'start' }}
>
            {/* Identity card */}
            <div style={{
              background: 'white', border: '1px solid var(--c-divider)',
              borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
              padding: '32px 28px', position: 'relative', overflow: 'hidden',
            }}>
              <div aria-hidden style={{
                position: 'absolute', top: -40, right: -40,
                width: 180, height: 180, borderRadius: '50%',
                background: 'rgba(181,84,28,0.05)',
              }} />

              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--c-rust) 0%, var(--c-teal) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: 'white', fontStyle: 'italic', lineHeight: 1 }}>S</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: 'var(--c-ink)', marginBottom: 3, letterSpacing: '-0.01em' }}>
                    SanjeeVijesh M
                  </h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--c-teal)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Full-Stack Developer
                  </p>
                </div>
              </div>

              {/* Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
                {HIGHLIGHTS.map(({ icon, label }) => (
                  <span key={label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 99,
                    background: 'var(--c-cream)', border: '1px solid var(--c-divider)',
                    fontSize: '0.73rem', fontWeight: 600, color: 'var(--c-ink)',
                  }}>
                    <span>{icon}</span> {label}
                  </span>
                ))}
              </div>

              <div style={{ height: 1, background: 'var(--c-divider)', marginBottom: 18 }} />
              <p style={{ fontSize: '0.82rem', lineHeight: 1.65, color: 'var(--c-muted)', fontStyle: 'italic' }}>
                "Creativity meets technical precision — building solutions that matter."
              </p>
            </div>

            {/* Text */}
            <div style={{ paddingTop: 8 }}>
              {[
                `NearbyRental is built and maintained by SanjeeVijesh M — a passionate technologist with a strong foundation in full-stack web development and system administration.`,
                `He specialises in building scalable, user-focused digital solutions: from modern web platforms to automation-driven systems, with a keen eye for clean UI/UX and performance optimisation. His portfolio spans hyperlocal rental platforms, DevOps productivity tools, and national-level hackathon projects tackling smart, real-world challenges.`,
                `Committed to continuous learning and staying ahead of industry trends, he aims to empower businesses and individuals through reliable, cost-effective, and impactful technology.`,
              ].map((text, i) => (
                <p key={i} style={{ fontSize: '0.95rem', lineHeight: 1.85, color: 'var(--c-muted)', marginBottom: i < 2 ? 18 : 0 }}>
                  {i === 0 ? (
                    <>
                      NearbyRental is built and maintained by{' '}
                      <strong style={{ color: 'var(--c-ink)', fontWeight: 700 }}>SanjeeVijesh M</strong>
                      {' '}— a passionate technologist with a strong foundation in full-stack web development and system administration.
                    </>
                  ) : text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ FOOTER */}
      <footer style={{
        background: 'var(--c-ink)', color: 'rgba(255,255,255,0.35)',
        textAlign: 'center', padding: '28px 20px',
        fontSize: '0.75rem', letterSpacing: '0.04em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <span style={{ color: 'var(--c-rust)' }}>♥</span>
        NearbyRental © {new Date().getFullYear()} — Crafted for Thoothukudi by SanjeeVijesh
      </footer>
    </div>
  );
}
