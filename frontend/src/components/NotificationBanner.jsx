// FILE: src/components/NotificationBanner.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function NotificationBanner({ property, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (property) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDismiss?.(), 400);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [property, onDismiss]);

  if (!property) return null;

  const formatRent = (r) => `₹${Number(r).toLocaleString('en-IN')}`;

  return (
    <div
      id="notification-banner"
      style={{
        position: 'fixed',
        top: 76,
        left: 16,
        right: 16,
        maxWidth: 420,
        margin: '0 auto',
        zIndex: 50,
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          background: 'white',
          border: '1px solid var(--c-divider)',
          borderRadius: 14,
          padding: '14px 16px',
          boxShadow: '0 12px 40px rgba(28,23,17,0.14)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--c-rust)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 2 }}>
            New listing in {property.area}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: 8 }}>
            {property.type || 'Property'} · {formatRent(property.rent)}/mo just posted
          </p>
          <Link
            to={`/property/${property.id}`}
            onClick={() => { setVisible(false); onDismiss?.(); }}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--c-rust)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            View listing
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Close */}
        <button
          id="notification-dismiss"
          onClick={() => { setVisible(false); setTimeout(() => onDismiss?.(), 400); }}
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: 6,
            border: 'none',
            background: 'var(--c-paper)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--c-muted)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--c-warm)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--c-paper)'}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}