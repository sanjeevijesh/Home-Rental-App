// ============================================================
// FILE: src/components/NotificationBanner.jsx
// Animated notification banner for real-time alerts
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Toast/banner that slides down when a new property is detected.
 * Auto-dismisses after 8 seconds.
 */
export default function NotificationBanner({ property, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (property) {
      setVisible(true);
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDismiss?.(), 300); // Wait for exit animation
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [property, onDismiss]);

  if (!property) return null;

  const formatRent = (rent) => `₹${Number(rent).toLocaleString('en-IN')}`;

  return (
    <div
      className={`fixed top-20 left-4 right-4 z-50 max-w-lg mx-auto transition-all duration-500
        ${visible ? 'animate-slide-down opacity-100' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      id="notification-banner"
    >
      <div className="glass-card rounded-2xl p-4 shadow-2xl border border-brand-200/50">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
            <span className="text-lg">🏠</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-surface-900">
              New listing in {property.area}!
            </p>
            <p className="text-xs text-surface-700/70 mt-0.5">
              {property.type || 'Property'} for {formatRent(property.rent)} just posted
            </p>
            <Link
              to={`/property/${property.id}`}
              onClick={() => {
                setVisible(false);
                onDismiss?.();
              }}
              className="inline-block mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View Details →
            </Link>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(() => onDismiss?.(), 300);
            }}
            className="flex-shrink-0 p-1 hover:bg-surface-100 rounded-lg transition-colors"
            id="notification-dismiss"
          >
            <svg className="w-4 h-4 text-surface-700/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
