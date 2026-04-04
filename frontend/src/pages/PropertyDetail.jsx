// FILE: src/pages/PropertyDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { propertiesAPI } from '../services/api';

const DETAIL_ROWS = [
  { key: 'type',        label: 'Type' },
  { key: 'furnished',   label: 'Furnished',  capitalize: true },
  { key: 'tenant_type', label: 'Preferred',  capitalize: true },
  { key: 'area',        label: 'Area' },
];

function SkeletonDetail() {
  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      <div className="skeleton" style={{ height: 320, borderRadius: 16, marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="skeleton" style={{ height: 44, width: 160 }} />
        <div className="skeleton" style={{ height: 22, width: '65%' }} />
        <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 56, borderRadius: 12 }} />
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    propertiesAPI.getById(id)
      .then(({ data }) => {
        setProperty(data.property);
        // Record view asynchronously
        propertiesAPI.recordView(id).catch(() => {});
      })
      .catch(err => setError(err.response?.data?.error || 'Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetail />;

  if (error || !property) {
    return (
      <div className="page-container" style={{ maxWidth: 720, textAlign: 'center', paddingTop: 80 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--c-paper)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--c-sand)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 8 }}>
          {error || 'Property not found'}
        </h2>
        <Link to="/listings" className="btn-secondary" style={{ marginTop: 12, display: 'inline-flex' }}>
          ← Back to listings
        </Link>
      </div>
    );
  }

  const { title, area, rent, type, furnished, tenant_type, status, phone, whatsapp, images, created_at, profiles: owner } = property;

  const whatsappNumber = whatsapp || phone;
  const whatsappLink = `https://wa.me/91${whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I saw your rental listing on NearbyRental — ${type || 'Property'} in ${area} for ₹${Number(rent).toLocaleString('en-IN')}. Is it still available?`
  )}`;
  const callLink = `tel:+91${phone?.replace(/\D/g, '')}`;
  const postedDate = new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      {/* Back */}
      <Link
        to="/listings"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.82rem', fontWeight: 500, color: 'var(--c-muted)',
          textDecoration: 'none', marginBottom: 20,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--c-rust)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All listings
      </Link>

      {/* Gallery */}
      {images?.length > 0 ? (
        <div style={{ marginBottom: 28 }}>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
            <img
              src={images[activeImage]}
              alt={`${title} — ${activeImage + 1}`}
              style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <StatusBadge status={status} createdAt={created_at} />
            </div>
            {images.length > 1 && (
              <div style={{
                position: 'absolute', bottom: 14, right: 14,
                background: 'rgba(28,23,17,0.6)', color: 'white',
                fontSize: '0.7rem', fontWeight: 600,
                padding: '3px 9px', borderRadius: 6,
              }}>
                {activeImage + 1} / {images.length}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{
                    flexShrink: 0,
                    width: 64, height: 64,
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: i === activeImage ? '2.5px solid var(--c-rust)' : '2.5px solid transparent',
                    opacity: i === activeImage ? 1 : 0.55,
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                    padding: 0, background: 'none',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          width: '100%', height: 240, borderRadius: 16,
          background: 'var(--c-paper)', border: '1px solid var(--c-divider)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, marginBottom: 28,
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="var(--c-sand)" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span style={{ fontSize: '0.8rem', color: 'var(--c-sand)' }}>No photos available</span>
        </div>
      )}

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Rent + Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span className="serif" style={{ fontSize: '2.6rem', color: 'var(--c-ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              ₹{Number(rent).toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-muted)', fontWeight: 500 }}>/month</span>
          </div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--c-charcoal)', lineHeight: 1.4 }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginTop: 4 }}>Listed {postedDate}</p>
        </div>

        {/* Details grid */}
        <div
          className="card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 1,
            overflow: 'hidden',
            padding: 0,
          }}
        >
          {DETAIL_ROWS.filter(({ key }) => property[key]).map(({ key, label, capitalize }) => (
            <div
              key={key}
              style={{
                padding: '14px 18px',
                background: 'white',
                borderRight: '1px solid var(--c-divider)',
              }}
            >
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-ink)', textTransform: capitalize ? 'capitalize' : 'none' }}>
                {property[key]}
              </p>
            </div>
          ))}
        </div>

        {/* Owner */}
        {owner && (
          <div
            className="card"
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(181,84,28,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-rust)',
              flexShrink: 0,
            }}>
              {owner.name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-ink)' }}>{owner.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>Property Owner</p>
            </div>
          </div>
        )}

        {/* Sticky CTA bar */}
        <div
          style={{
            position: 'sticky',
            bottom: 16,
            display: 'flex',
            gap: 10,
            zIndex: 40,
          }}
        >
          <a
            href={callLink}
            onClick={() => propertiesAPI.recordTap(id, 'call').catch(() => {})}
            id="detail-call-btn"
            className="btn-primary"
            style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', padding: '14px' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Owner
          </a>
          <a
            href={whatsappLink}
            onClick={() => propertiesAPI.recordTap(id, 'whatsapp').catch(() => {})}
            target="_blank"
            rel="noopener noreferrer"
            id="detail-whatsapp-btn"
            style={{
              flex: 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px',
              borderRadius: 10,
              background: '#16a34a',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
            onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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