// FILE: src/components/AdPopup.jsx
// Displays the active promoted property as a popup overlay
// when the user first opens the site (controlled by frequency setting)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

const STORAGE_KEY = 'nr_ad_last_seen';

function shouldShow(frequency) {
  if (frequency === 'always') return true;
  const lastSeen = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
  if (!lastSeen) return true;
  if (frequency === 'once_per_session') {
    // sessionStorage handles this — if it's there, don't show
    return !sessionStorage.getItem(STORAGE_KEY);
  }
  if (frequency === 'once_per_day') {
    const elapsed = Date.now() - parseInt(lastSeen, 10);
    return elapsed > 24 * 60 * 60 * 1000;
  }
  return true;
}

function markSeen(frequency) {
  const ts = Date.now().toString();
  sessionStorage.setItem(STORAGE_KEY, ts);
  if (frequency === 'once_per_day') {
    localStorage.setItem(STORAGE_KEY, ts);
  }
}

export default function AdPopup() {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Small delay so the site renders first
    const timer = setTimeout(async () => {
      try {
        const { data } = await adminAPI.getActiveAd();
        if (data?.ad && shouldShow(data.ad.frequency)) {
          setAd(data.ad);
          setVisible(true);
          markSeen(data.ad.frequency);
        }
      } catch { /* non-critical */ }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!ad || !visible) return null;

  const prop = ad.properties;
  if (!prop) return null;

  const formatRent = (r) => `₹${Number(r).toLocaleString('en-IN')}`;
  const whatsappNumber = prop.whatsapp || prop.phone;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/91${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi, I saw your rental listing on NearbyRental — ${prop.type || 'Property'} in ${prop.area} for ${formatRent(prop.rent)}. Is it still available?`
      )}`
    : null;

  const close = () => setVisible(false);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(28,23,17,0.55)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed', zIndex: 1001,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: 400,
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(28,23,17,0.25)',
          animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative' }}>
          {prop.images?.[0] ? (
            <img
              src={prop.images[0]}
              alt={prop.title}
              onLoad={() => setLoaded(true)}
              style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: 180, background: '#f4efe7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#c9b99a" strokeWidth="1.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            </div>
          )}

          {/* Sponsored badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(181,84,28,0.92)', color: 'white',
            padding: '3px 10px', borderRadius: 99,
            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Featured
          </div>

          {/* Close button */}
          <button
            onClick={close}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(28,23,17,0.6)', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(28,23,17,0.85)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(28,23,17,0.6)'}
            aria-label="Close ad"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px 22px' }}>
          {/* Rent + title */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.9rem', color: '#1c1711', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {formatRent(prop.rent)}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#7a6c5e', fontWeight: 500 }}>/month</span>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3d3228', lineHeight: 1.4, marginBottom: 6 }}>
              {prop.title}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: 'rgba(181,84,28,0.08)', color: '#b5541c' }}>
                {prop.area}
              </span>
              {prop.type && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: '#f4efe7', color: '#7a6c5e' }}>
                  {prop.type}
                </span>
              )}
            </div>
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              to={`/property/${prop.id}`}
              onClick={close}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '11px', borderRadius: 10,
                background: '#b5541c', color: 'white',
                fontWeight: 600, fontSize: '0.85rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(181,84,28,0.3)',
              }}
            >
              View Details
            </Link>

            {prop.phone && (
              <a
                href={`tel:+91${prop.phone.replace(/\D/g, '')}`}
                style={{
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10, border: '1.5px solid #ddd5c7',
                  color: '#b5541c', textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </a>
            )}

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10, border: '1.5px solid #ddd5c7',
                  color: '#16a34a', textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.546 4.095 1.504 5.82L0 24l6.335-1.652A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.89 0-3.69-.478-5.289-1.393l-.377-.224-3.91 1.02 1.044-3.808-.247-.393A9.786 9.786 0 012.182 12 9.818 9.818 0 0112 2.182 9.818 9.818 0 0121.818 12 9.818 9.818 0 0112 21.818z"/>
                </svg>
              </a>
            )}
          </div>

          {/* Dismiss small link */}
          <button
            onClick={close}
            style={{
              display: 'block', width: '100%', textAlign: 'center', marginTop: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', color: '#7a6c5e',
            }}
          >
            Close and continue browsing
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn  { from { opacity: 0; transform: translate(-50%, -46%) scale(0.92); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
      `}</style>
    </>
  );
}