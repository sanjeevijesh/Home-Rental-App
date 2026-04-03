// FILE: src/components/PropertyCard.jsx
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const AREA_ACCENTS = {
  'New Bus Stand':  '#2563eb',
  'Old Bus Stand':  '#4f46e5',
  'Millerpuram':    '#7c3aed',
  '3rd Mile':       '#9333ea',
  'Bryant Nagar':   '#db2777',
  'Therespuram':    '#e11d48',
  'Harbour Area':   '#0891b2',
  'SPIC Nagar':     '#0d9488',
  'Kattur':         '#059669',
  'VOC Nagar':      '#d97706',
};

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" fill="none">
    <rect width="400" height="220" fill="#f4efe7"/>
    <rect x="160" y="70" width="80" height="70" rx="4" fill="#ddd5c7"/>
    <polygon points="150,70 200,40 250,70" fill="#c9b99a"/>
    <rect x="180" y="100" width="40" height="40" rx="2" fill="#f4efe7"/>
  </svg>
`);

export default function PropertyCard({ property }) {
  const {
    id, title, area, rent, type, furnished, tenant_type,
    status, phone, whatsapp, images, created_at,
  } = property;

  const thumbImage = images?.length > 0 ? images[0] : PLACEHOLDER_IMAGE;
  const accentColor = AREA_ACCENTS[area] || 'var(--c-rust)';

  const whatsappNumber = whatsapp || phone;
  const whatsappLink = `https://wa.me/91${whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I saw your rental listing on NearbyRental — ${type || 'Property'} in ${area} for ₹${Number(rent).toLocaleString('en-IN')}. Is it still available?`
  )}`;
  const callLink = `tel:+91${phone?.replace(/\D/g, '')}`;
  const formatRent = (r) => `₹${Number(r).toLocaleString('en-IN')}`;

  return (
    <div
      className="card card-hover animate-fade-in"
      id={`property-card-${id}`}
      style={{ overflow: 'hidden' }}
    >
      {/* Image */}
      <Link to={`/property/${id}`} style={{ display: 'block', position: 'relative', overflow: 'hidden' }}>
        <img
          src={thumbImage}
          alt={title}
          loading="lazy"
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Status */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <StatusBadge status={status} createdAt={created_at} />
        </div>
        {/* Image count */}
        {images?.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(28,23,17,0.65)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            {images.length}
          </div>
        )}
        {/* Colored bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: accentColor,
            opacity: 0.8,
          }}
        />
      </Link>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px' }}>
        {/* Rent */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <span
              className="serif"
              style={{ fontSize: '1.8rem', color: 'var(--c-ink)', letterSpacing: '-0.02em', lineHeight: 1 }}
            >
              {formatRent(rent)}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--c-muted)', fontWeight: 500, marginLeft: 4 }}>/mo</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/property/${id}`}>
          <h3
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--c-charcoal)',
              marginBottom: 12,
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-rust)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-charcoal)'}
          >
            {title}
          </h3>
        </Link>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
          <span
            className="chip"
            style={{ background: `${accentColor}15`, color: accentColor, fontSize: '0.68rem' }}
          >
            {area}
          </span>
          {type && (
            <span className="chip" style={{ background: 'var(--c-paper)', color: 'var(--c-muted)' }}>
              {type}
            </span>
          )}
          {furnished && (
            <span className="chip" style={{ background: 'var(--c-paper)', color: 'var(--c-muted)', textTransform: 'capitalize' }}>
              {furnished}
            </span>
          )}
          {tenant_type && tenant_type !== 'any' && (
            <span className="chip" style={{ background: 'var(--c-paper)', color: 'var(--c-muted)', textTransform: 'capitalize' }}>
              {tenant_type}
            </span>
          )}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={callLink}
            id={`property-call-${id}`}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 0',
              borderRadius: 8,
              background: 'rgba(181,84,28,0.08)',
              color: 'var(--c-rust)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(181,84,28,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(181,84,28,0.08)'}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            id={`property-whatsapp-${id}`}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 0',
              borderRadius: 8,
              background: 'rgba(22,163,74,0.08)',
              color: '#16a34a',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(22,163,74,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(22,163,74,0.08)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.546 4.095 1.504 5.82L0 24l6.335-1.652A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.89 0-3.69-.478-5.289-1.393l-.377-.224-3.91 1.02 1.044-3.808-.247-.393A9.786 9.786 0 012.182 12 9.818 9.818 0 0112 2.182 9.818 9.818 0 0121.818 12 9.818 9.818 0 0112 21.818z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}