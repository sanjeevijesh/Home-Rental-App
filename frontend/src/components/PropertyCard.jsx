// ============================================================
// FILE: src/components/PropertyCard.jsx
// Property listing card with CTAs (Call + WhatsApp)
// ============================================================

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

// Area color map for visual differentiation
const AREA_COLORS = {
  'New Bus Stand': 'bg-blue-50 text-blue-700',
  'Old Bus Stand': 'bg-indigo-50 text-indigo-700',
  'Millerpuram': 'bg-violet-50 text-violet-700',
  '3rd Mile': 'bg-purple-50 text-purple-700',
  'Bryant Nagar': 'bg-pink-50 text-pink-700',
  'Therespuram': 'bg-rose-50 text-rose-700',
  'Harbour Area': 'bg-cyan-50 text-cyan-700',
  'SPIC Nagar': 'bg-teal-50 text-teal-700',
  'Kattur': 'bg-emerald-50 text-emerald-700',
  'VOC Nagar': 'bg-amber-50 text-amber-700',
};

// Placeholder image when no photos are available
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" fill="#f1f5f9">
    <rect width="400" height="240" fill="#f1f5f9"/>
    <text x="200" y="110" fill="#94a3b8" font-size="16" font-family="sans-serif" text-anchor="middle">
      No Photo
    </text>
    <text x="200" y="135" fill="#cbd5e1" font-size="32" text-anchor="middle">🏠</text>
  </svg>
`);

export default function PropertyCard({ property }) {
  const {
    id, title, area, rent, type, furnished, tenant_type,
    status, phone, whatsapp, images, created_at,
  } = property;

  const thumbImage = images?.length > 0 ? images[0] : PLACEHOLDER_IMAGE;
  const areaColor = AREA_COLORS[area] || 'bg-surface-100 text-surface-700';

  // WhatsApp deep link with pre-filled message
  const whatsappNumber = whatsapp || phone;
  const whatsappLink = `https://wa.me/91${whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I saw your rental listing on NearbyRental — ${type || 'Property'} in ${area} for ₹${Number(rent).toLocaleString('en-IN')}. Is it still available?`
  )}`;

  // Phone call link
  const callLink = `tel:+91${phone?.replace(/\D/g, '')}`;

  const formatRent = (r) => `₹${Number(r).toLocaleString('en-IN')}`;

  return (
    <div className="card overflow-hidden animate-fade-in group" id={`property-card-${id}`}>
      {/* Image */}
      <Link to={`/property/${id}`} className="block relative overflow-hidden">
        <img
          src={thumbImage}
          alt={title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Status overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={status} createdAt={created_at} />
        </div>
        {/* Images count badge */}
        {images?.length > 1 && (
          <div className="absolute top-3 right-3 chip bg-black/60 text-white text-[10px]">
            📷 {images.length}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Rent */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-3xl font-bold text-surface-900">
            {formatRent(rent)}
          </span>
          <span className="text-xs text-surface-700/50 font-medium">/month</span>
        </div>

        {/* Title */}
        <Link to={`/property/${id}`}>
          <h3 className="text-sm font-semibold text-surface-800 mb-2 line-clamp-1 hover:text-brand-600 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`chip ${areaColor} text-[11px]`}>
            📍 {area}
          </span>
          {type && (
            <span className="chip bg-surface-100 text-surface-700 text-[11px]">
              🏢 {type}
            </span>
          )}
          {furnished && (
            <span className="chip bg-surface-100 text-surface-700 text-[11px]">
              {furnished === 'furnished' ? '🪑' : furnished === 'semi' ? '🛋' : '📦'} {furnished}
            </span>
          )}
          {tenant_type && (
            <span className="chip bg-surface-100 text-surface-700 text-[11px]">
              {tenant_type === 'family' ? '👨‍👩‍👧' : tenant_type === 'bachelor' ? '🧑' : '👥'} {tenant_type}
            </span>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2">
          <a
            href={callLink}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                     bg-brand-50 text-brand-600 font-semibold text-sm
                     hover:bg-brand-100 active:scale-[0.97] transition-all duration-200"
            id={`property-call-${id}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                     bg-emerald-50 text-emerald-700 font-semibold text-sm
                     hover:bg-emerald-100 active:scale-[0.97] transition-all duration-200"
            id={`property-whatsapp-${id}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
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
