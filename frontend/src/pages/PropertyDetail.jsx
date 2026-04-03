// ============================================================
// FILE: src/pages/PropertyDetail.jsx
// Full property detail view with image gallery
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { propertiesAPI } from '../services/api';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await propertiesAPI.getById(id);
        setProperty(data.property);
      } catch (err) {
        setError(err.response?.data?.error || 'Property not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-64 skeleton rounded-2xl" />
        <div className="h-10 w-40 skeleton" />
        <div className="h-6 w-3/4 skeleton" />
        <div className="h-20 skeleton rounded-2xl" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="page-container text-center py-20">
        <div className="text-5xl mb-4">🏚️</div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">
          {error || 'Property not found'}
        </h2>
        <Link to="/listings" className="btn-secondary text-sm mt-4 inline-block">
          ← Back to listings
        </Link>
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
  const callLink = `tel:+91${phone?.replace(/\D/g, '')}`;

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        to="/listings"
        className="inline-flex items-center gap-2 text-sm text-surface-700/60 hover:text-surface-900 
                 font-medium mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to listings
      </Link>

      {/* Image Gallery */}
      {images && images.length > 0 ? (
        <div className="mb-6">
          {/* Main image */}
          <div className="relative rounded-2xl overflow-hidden mb-3">
            <img
              src={images[activeImage]}
              alt={`${title} — photo ${activeImage + 1}`}
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="absolute top-4 left-4">
              <StatusBadge status={status} createdAt={created_at} />
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 chip bg-black/60 text-white text-xs">
                {activeImage + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                    ${i === activeImage
                      ? 'border-brand-500 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-surface-100 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-5xl">🏠</span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* Rent + Title */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-extrabold text-surface-900">
              ₹{Number(rent).toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-surface-700/50">/month</span>
          </div>
          <h1 className="text-xl font-bold text-surface-800">{title}</h1>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-brand-50 text-brand-700">📍 {area}</span>
          {type && <span className="chip bg-surface-100 text-surface-700">🏢 {type}</span>}
          {furnished && (
            <span className="chip bg-surface-100 text-surface-700 capitalize">
              {furnished === 'furnished' ? '🪑' : furnished === 'semi' ? '🛋' : '📦'} {furnished}
            </span>
          )}
          {tenant_type && (
            <span className="chip bg-surface-100 text-surface-700 capitalize">
              {tenant_type === 'family' ? '👨‍👩‍👧' : tenant_type === 'bachelor' ? '🧑' : '👥'} {tenant_type}
            </span>
          )}
        </div>

        {/* Owner info */}
        {owner && (
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-xl font-bold text-brand-600">
                {owner.name?.charAt(0)?.toUpperCase() || 'O'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-surface-900">{owner.name}</p>
              <p className="text-sm text-surface-700/50">Owner</p>
            </div>
          </div>
        )}

        {/* Posted date */}
        <p className="text-xs text-surface-700/40">
          Posted {new Date(created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>

        {/* CTA buttons — sticky on mobile */}
        <div className="flex gap-3 sm:gap-4 sticky bottom-4 z-40">
          <a
            href={callLink}
            className="flex-1 btn-primary text-center flex items-center justify-center gap-2"
            id="detail-call-btn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Owner
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-success text-center flex items-center justify-center gap-2"
            id="detail-whatsapp-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
