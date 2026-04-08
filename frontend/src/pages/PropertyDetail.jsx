// FILE: src/pages/PropertyDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { propertiesAPI } from '../services/api';

/* ─── Inline styles injected once ─────────────────────────────────────────── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

  .pd-root {
    --rust:      #b5541c;
    --rust-lite: rgba(181,84,28,0.10);
    --ink:       #1a1208;
    --charcoal:  #2e2014;
    --sand:      #9e8c78;
    --paper:     #faf7f3;
    --divider:   rgba(158,140,120,0.20);
    --white:     #ffffff;
    --green:     #16a34a;
    --green-d:   #15803d;
    font-family: 'Outfit', sans-serif;
    background: var(--paper);
    min-height: 100vh;
  }

  /* ── Back link ── */
  .pd-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--sand);
    text-decoration: none; margin-bottom: 32px;
    transition: color 0.2s;
  }
  .pd-back:hover { color: var(--rust); }

  /* ── Hero image ── */
  .pd-hero-wrap {
    position: relative; border-radius: 24px; overflow: hidden;
    margin-bottom: 10px; background: var(--ink);
    box-shadow: 0 24px 64px rgba(26,18,8,0.18);
  }
  .pd-hero-img {
    width: 100%; height: 420px; object-fit: cover;
    display: block; transition: transform 0.6s ease; opacity: 0;
    animation: fadeIn 0.5s forwards;
  }
  @keyframes fadeIn { to { opacity: 1; } }
  .pd-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(26,18,8,0.55) 0%, transparent 50%);
    pointer-events: none;
  }
  .pd-badge-wrap { position: absolute; top: 18px; left: 18px; }
  .pd-img-counter {
    position: absolute; bottom: 18px; right: 18px;
    background: rgba(26,18,8,0.55); backdrop-filter: blur(8px);
    color: #fff; font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.05em; padding: 4px 12px; border-radius: 99px;
  }

  /* arrow nav */
  .pd-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255,255,255,0.18); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #fff; transition: background 0.2s;
    z-index: 2;
  }
  .pd-arrow:hover { background: rgba(255,255,255,0.32); }
  .pd-arrow-l { left: 14px; }
  .pd-arrow-r { right: 14px; }

  /* thumbnails */
  .pd-thumbs {
    display: flex; gap: 8px; overflow-x: auto;
    padding-bottom: 4px; scrollbar-width: none; margin-bottom: 32px;
  }
  .pd-thumbs::-webkit-scrollbar { display: none; }
  .pd-thumb {
    flex-shrink: 0; width: 68px; height: 68px; border-radius: 12px;
    overflow: hidden; cursor: pointer; padding: 0; background: none;
    border: 2.5px solid transparent; transition: all 0.2s;
    opacity: 0.5;
  }
  .pd-thumb.active { border-color: var(--rust); opacity: 1; }
  .pd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* no-photo placeholder */
  .pd-nophoto {
    width: 100%; height: 260px; border-radius: 24px;
    background: var(--white); border: 1.5px dashed var(--divider);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px; margin-bottom: 32px;
    color: var(--sand); font-size: 0.8rem;
  }

  /* ── Price badge ── */
  .pd-price-block {
    display: flex; align-items: flex-end; gap: 10px; margin-bottom: 6px;
  }
  .pd-price {
    font-family: 'DM Serif Display', serif;
    font-size: 3.2rem; color: var(--rust);
    letter-spacing: -0.03em; line-height: 1;
  }
  .pd-price-month {
    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em;
    color: var(--sand); text-transform: uppercase; padding-bottom: 6px;
  }
  .pd-title {
    font-family: 'DM Serif Display', serif; font-style: italic;
    font-size: 1.45rem; color: var(--charcoal); line-height: 1.35;
    margin-bottom: 6px;
  }
  .pd-posted {
    font-size: 0.72rem; color: var(--sand); font-weight: 500;
    letter-spacing: 0.03em;
  }

  /* ── Details pill row ── */
  .pd-pills {
    display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0;
  }
  .pd-pill {
    background: var(--white);
    border: 1px solid var(--divider);
    border-radius: 12px; padding: 10px 18px;
    display: flex; flex-direction: column; gap: 3px;
    transition: box-shadow 0.2s, transform 0.2s;
    box-shadow: 0 2px 8px rgba(26,18,8,0.05);
  }
  .pd-pill:hover {
    box-shadow: 0 6px 20px rgba(181,84,28,0.12);
    transform: translateY(-2px);
  }
  .pd-pill-label {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.09em;
    text-transform: uppercase; color: var(--sand);
  }
  .pd-pill-value {
    font-size: 0.9rem; font-weight: 700; color: var(--ink);
    text-transform: capitalize;
  }

  /* ── Owner card ── */
  .pd-owner {
    background: var(--white);
    border: 1px solid var(--divider);
    border-radius: 18px; padding: 18px 22px;
    display: flex; align-items: center; gap: 16px;
    box-shadow: 0 2px 12px rgba(26,18,8,0.06);
    margin-bottom: 24px;
  }
  .pd-owner-avatar {
    width: 50px; height: 50px; border-radius: 50%;
    background: linear-gradient(135deg, var(--rust), #e07030);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.25rem; font-weight: 800; color: #fff;
    flex-shrink: 0; font-family: 'DM Serif Display', serif;
  }
  .pd-owner-name {
    font-size: 0.95rem; font-weight: 700; color: var(--ink);
  }
  .pd-owner-role {
    font-size: 0.72rem; color: var(--sand); font-weight: 500;
    letter-spacing: 0.04em; text-transform: uppercase; margin-top: 2px;
  }
  .pd-owner-tag {
    margin-left: auto; background: var(--rust-lite);
    border-radius: 8px; padding: 4px 10px;
    font-size: 0.68rem; font-weight: 700; color: var(--rust);
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ── CTA bar ── */
  .pd-cta {
    position: sticky; bottom: 16px; z-index: 40;
    display: flex; gap: 10px;
  }
  .pd-btn-call {
    flex: 1; display: inline-flex; align-items: center;
    justify-content: center; gap: 9px;
    padding: 15px 20px; border-radius: 14px;
    background: var(--rust);
    color: #fff; font-weight: 700; font-size: 0.9rem;
    text-decoration: none; letter-spacing: 0.02em;
    box-shadow: 0 8px 24px rgba(181,84,28,0.35);
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .pd-btn-call:hover {
    background: #9a4315; transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(181,84,28,0.4);
  }
  .pd-btn-wa {
    flex: 1; display: inline-flex; align-items: center;
    justify-content: center; gap: 9px;
    padding: 15px 20px; border-radius: 14px;
    background: var(--green);
    color: #fff; font-weight: 700; font-size: 0.9rem;
    text-decoration: none; letter-spacing: 0.02em;
    box-shadow: 0 8px 24px rgba(22,163,74,0.30);
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .pd-btn-wa:hover {
    background: var(--green-d); transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(22,163,74,0.38);
  }

  /* ── Divider rule ── */
  .pd-rule {
    border: none; border-top: 1px solid var(--divider); margin: 4px 0 24px;
  }

  /* ── Skeleton ── */
  .pd-skel {
    border-radius: 16px; background: linear-gradient(90deg,#ede8e0 25%,#f5f1ec 50%,#ede8e0 75%);
    background-size: 400% 100%; animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* ── Error state ── */
  .pd-error {
    text-align: center; padding-top: 100px;
  }
  .pd-error-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--white); border: 1.5px solid var(--divider);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
  }

  /* ── Enter animation ── */
  .pd-animate {
    opacity: 0; transform: translateY(20px);
    animation: slideUp 0.5s ease forwards;
  }
  @keyframes slideUp {
    to { opacity: 1; transform: translateY(0); }
  }
  .pd-animate:nth-child(1) { animation-delay: 0.05s; }
  .pd-animate:nth-child(2) { animation-delay: 0.12s; }
  .pd-animate:nth-child(3) { animation-delay: 0.19s; }
  .pd-animate:nth-child(4) { animation-delay: 0.26s; }
  .pd-animate:nth-child(5) { animation-delay: 0.33s; }
`;

/* ─── Detail rows config ───────────────────────────────────────────────────── */
const DETAIL_ROWS = [
  { key: 'type',        label: 'Type',      icon: '🏠' },
  { key: 'furnished',   label: 'Furnished',  icon: '🛋️' },
  { key: 'tenant_type', label: 'Preferred',  icon: '👥' },
  { key: 'area',        label: 'Area',       icon: '📍' },
];

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */
function SkeletonDetail() {
  return (
    <div className="pd-root" style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px' }}>
      <div className="pd-skel" style={{ height: 32, width: 120, marginBottom: 32, borderRadius: 8 }} />
      <div className="pd-skel" style={{ height: 420, borderRadius: 24, marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[1,2,3].map(i => <div key={i} className="pd-skel" style={{ width: 68, height: 68, borderRadius: 12 }} />)}
      </div>
      <div className="pd-skel" style={{ height: 54, width: 200, marginBottom: 12, borderRadius: 10 }} />
      <div className="pd-skel" style={{ height: 28, width: '70%', marginBottom: 8, borderRadius: 8 }} />
      <div className="pd-skel" style={{ height: 16, width: 120, marginBottom: 28, borderRadius: 6 }} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {[1,2,3,4].map(i => <div key={i} className="pd-skel" style={{ flex: 1, height: 72, borderRadius: 12 }} />)}
      </div>
      <div className="pd-skel" style={{ height: 80, borderRadius: 18, marginBottom: 24 }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="pd-skel" style={{ flex: 1, height: 52, borderRadius: 14 }} />
        <div className="pd-skel" style={{ flex: 1, height: 52, borderRadius: 14 }} />
      </div>
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const styleInjected = useRef(false);

  /* inject global styles once */
  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const tag = document.createElement('style');
    tag.textContent = GLOBAL_STYLE;
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    propertiesAPI.getById(id)
      .then(({ data }) => {
        setProperty(data.property);
        propertiesAPI.recordView(id).catch(() => {});
      })
      .catch(err => setError(err.response?.data?.error || 'Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  /* arrow nav */
  const prev = () => setActiveImage(i => (i - 1 + property.images.length) % property.images.length);
  const next = () => setActiveImage(i => (i + 1) % property.images.length);

  if (loading) return <SkeletonDetail />;

  if (error || !property) {
    return (
      <div className="pd-root" style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px' }}>
        <div className="pd-error">
          <div className="pd-error-icon">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9e8c78" strokeWidth="1.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#1a1208', marginBottom: 10 }}>
            {error || 'Property not found'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#9e8c78', marginBottom: 28 }}>
            This listing may have been removed or is no longer available.
          </p>
          <Link to="/listings" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#b5541c', color: '#fff', textDecoration: 'none',
            padding: '12px 24px', borderRadius: 12,
            fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em',
          }}>
            ← Browse all listings
          </Link>
        </div>
      </div>
    );
  }

  const {
    title, area, rent, type, furnished, tenant_type,
    status, phone, whatsapp, images, created_at, profiles: owner,
  } = property;

  const whatsappNumber = whatsapp || phone;
  const whatsappLink = `https://wa.me/91${whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I saw your rental listing on NearbyRental — ${type || 'Property'} in ${area} for ₹${Number(rent).toLocaleString('en-IN')}. Is it still available?`
  )}`;
  const callLink   = `tel:+91${phone?.replace(/\D/g, '')}`;
  const postedDate = new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const details    = DETAIL_ROWS.filter(({ key }) => property[key]);

  return (
    <div className="pd-root" style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px' }}>

      {/* ── Back ── */}
      <Link to="/listings" className="pd-back">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All listings
      </Link>

      {/* ── Gallery ── */}
      {images?.length > 0 ? (
        <>
          <div className="pd-hero-wrap">
            <img
              key={activeImage}
              src={images[activeImage]}
              alt={`${title} — photo ${activeImage + 1}`}
              className="pd-hero-img"
            />
            <div className="pd-hero-overlay" />
            <div className="pd-badge-wrap">
              <StatusBadge status={status} createdAt={created_at} />
            </div>
            {images.length > 1 && (
              <>
                <button className="pd-arrow pd-arrow-l" onClick={prev} aria-label="Previous">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="pd-arrow pd-arrow-r" onClick={next} aria-label="Next">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="pd-img-counter">{activeImage + 1} / {images.length}</div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${i === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="pd-nophoto">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          No photos available
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Price + Title */}
        <div className="pd-animate">
          <div className="pd-price-block">
            <span className="pd-price">₹{Number(rent).toLocaleString('en-IN')}</span>
            <span className="pd-price-month">/ month</span>
          </div>
          <h1 className="pd-title">{title}</h1>
          <p className="pd-posted">
            <span style={{ marginRight: 6 }}>📅</span> Listed on {postedDate}
          </p>
          <hr className="pd-rule" style={{ marginTop: 20 }} />
        </div>

        {/* Detail pills */}
        {details.length > 0 && (
          <div className="pd-animate pd-pills">
            {details.map(({ key, label, icon }) => (
              <div key={key} className="pd-pill">
                <span className="pd-pill-label">{icon} {label}</span>
                <span className="pd-pill-value">{property[key]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Owner */}
        {owner && (
          <div className="pd-animate pd-owner">
            <div className="pd-owner-avatar">
              {owner.name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <div>
              <p className="pd-owner-name">{owner.name}</p>
              <p className="pd-owner-role">Property Owner</p>
            </div>
            <div className="pd-owner-tag">Verified</div>
          </div>
        )}

        {/* ── What to expect blurb (if area exists) ── */}
        {area && (
          <div className="pd-animate" style={{
            background: 'linear-gradient(135deg, rgba(181,84,28,0.07), rgba(181,84,28,0.02))',
            border: '1px solid rgba(181,84,28,0.15)',
            borderRadius: 16, padding: '16px 20px', marginBottom: 24,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>📍</span>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b5541c', marginBottom: 4 }}>
                Location
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1208' }}>{area}</p>
              <p style={{ fontSize: '0.75rem', color: '#9e8c78', marginTop: 3 }}>
                Trichy, Tamil Nadu
              </p>
            </div>
          </div>
        )}

        {/* ── CTA Sticky bar ── */}
        <div className="pd-animate pd-cta">
          <a
            href={callLink}
            onClick={() => propertiesAPI.recordTap(id, 'call').catch(() => {})}
            id="detail-call-btn"
            className="pd-btn-call"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Owner
          </a>
          <a
            href={whatsappLink}
            onClick={() => propertiesAPI.recordTap(id, 'whatsapp').catch(() => {})}
            target="_blank"
            rel="noopener noreferrer"
            id="detail-whatsapp-btn"
            className="pd-btn-wa"
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
