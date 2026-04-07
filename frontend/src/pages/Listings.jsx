// FILE: src/pages/Listings.jsx
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import AreaSelector from '../components/AreaSelector';
import BudgetSlider from '../components/BudgetSlider';
import useProperties from '../hooks/useProperties';

const PROPERTY_TYPES = ['1BHK', '2BHK', '3BHK', 'Single Room', 'Shop'];
const FURNISHED_OPTIONS = ['furnished', 'semi', 'unfurnished'];
const TENANT_TYPES = ['family', 'bachelor', 'any'];

/* ─── Filter Chip ─────────────────────────────────────────── */
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        border: active ? 'none' : '1.5px solid var(--c-divider)',
        background: active
          ? 'linear-gradient(135deg, var(--c-rust) 0%, var(--c-rust-lt) 100%)'
          : 'transparent',
        color: active ? 'white' : 'var(--c-muted)',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: active ? '0 4px 12px rgba(181,84,28,0.3)' : 'none',
        transform: active ? 'scale(1.04)' : 'scale(1)',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--c-warm)';
          e.currentTarget.style.color = 'var(--c-rust)';
          e.currentTarget.style.borderColor = 'var(--c-rust)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--c-muted)';
          e.currentTarget.style.borderColor = 'var(--c-divider)';
        }
      }}
    >
      {label}
    </button>
  );
}

/* ─── Skeleton Card ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton" style={{ height: 32, width: 100 }} />
        <div className="skeleton" style={{ height: 14, width: '75%' }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 99 }} />
          <div className="skeleton" style={{ height: 22, width: 55, borderRadius: 99 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="skeleton" style={{ flex: 1, height: 36, borderRadius: 8 }} />
          <div className="skeleton" style={{ flex: 1, height: 36, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Section Label ────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    }}>
      <span style={{
        display: 'block',
        width: 3,
        height: 14,
        borderRadius: 99,
        background: 'linear-gradient(180deg, var(--c-rust), var(--c-rust-lt))',
        flexShrink: 0,
      }} />
      <label className="field-label" style={{ margin: 0 }}>{children}</label>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function Listings() {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const initialFilters = useMemo(() => ({
    area: searchParams.get('area') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    type: searchParams.get('type') || '',
  }), [searchParams]);

  const {
    properties, loading, error, pagination,
    filters, updateFilters, resetFilters, loadMore,
  } = useProperties(initialFilters);

  const activeFilterCount = [
    filters.area, filters.type, filters.furnished, filters.tenant_type,
  ].filter(Boolean).length;

  /* ─── Filter Panel ──────────────────────────────────────── */
  const FilterPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--c-rust) 0%, var(--c-rust-lt) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(181,84,28,0.25)',
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--c-ink)', letterSpacing: '-0.01em' }}>
            Refine Search
          </h2>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            style={{
              fontSize: '0.72rem', fontWeight: 700,
              color: 'var(--c-rust)', background: 'rgba(181,84,28,0.08)',
              border: 'none', cursor: 'pointer',
              padding: '4px 10px', borderRadius: 8,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              transition: 'background 0.2s',
            }}
          >
            Clear {activeFilterCount}
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, var(--c-divider), transparent)' }} />

      {/* Area */}
      <div>
        <SectionLabel>Area</SectionLabel>
        <AreaSelector
          value={filters.area}
          onChange={(val) => updateFilters({ area: val })}
          id="filter-area"
        />
      </div>

      {/* Budget */}
      <div>
        <SectionLabel>Rent Range</SectionLabel>
        <BudgetSlider
          minValue={filters.minRent ? Number(filters.minRent) : 1000}
          maxValue={filters.maxRent ? Number(filters.maxRent) : 50000}
          onChange={({ min, max }) => updateFilters({ minRent: min, maxRent: max })}
          id="filter-budget"
        />
      </div>

      {/* Type */}
      <div>
        <SectionLabel>Property Type</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PROPERTY_TYPES.map(t => (
            <FilterChip
              key={t} label={t}
              active={filters.type === t}
              onClick={() => updateFilters({ type: filters.type === t ? '' : t })}
            />
          ))}
        </div>
      </div>

      {/* Furnished */}
      <div>
        <SectionLabel>Furnished</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FURNISHED_OPTIONS.map(f => (
            <FilterChip
              key={f} label={f}
              active={filters.furnished === f}
              onClick={() => updateFilters({ furnished: filters.furnished === f ? '' : f })}
            />
          ))}
        </div>
      </div>

      {/* Tenant */}
      <div>
        <SectionLabel>Preferred Tenant</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TENANT_TYPES.map(t => (
            <FilterChip
              key={t} label={t}
              active={filters.tenant_type === t}
              onClick={() => updateFilters({ tenant_type: filters.tenant_type === t ? '' : t })}
            />
          ))}
        </div>
      </div>

      {/* Results summary at bottom of panel */}
      {!loading && pagination.total > 0 && (
        <div style={{
          marginTop: 4,
          padding: '14px 16px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(181,84,28,0.06) 0%, rgba(181,84,28,0.02) 100%)',
          border: '1px solid rgba(181,84,28,0.12)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c-rust)', fontFamily: 'DM Serif Display, serif' }}>
            {pagination.total}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', display: 'block', marginTop: 2, fontWeight: 500 }}>
            {pagination.total === 1 ? 'property found' : 'properties found'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Page Hero Banner ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--c-ink) 0%, #2d2419 60%, #3d2c1a 100%)',
        padding: '40px 0 0',
        marginBottom: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 280, height: 280, borderRadius: '50%',
          border: '1px solid rgba(181,84,28,0.15)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 160, height: 160, borderRadius: '50%',
          border: '1px solid rgba(181,84,28,0.25)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: '30%',
          width: 320, height: 320, borderRadius: '50%',
          border: '1px solid rgba(201,185,154,0.08)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 36px' }}>
          {/* Breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 20, opacity: 0.6,
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--c-sand)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Home
            </span>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--c-sand)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span style={{ fontSize: '0.72rem', color: 'var(--c-rust-lt)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {filters.area || 'All Rentals'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="serif" style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 10,
              }}>
                {filters.area ? (
                  <>Rentals in <span style={{ color: 'var(--c-rust-lt)' }}>{filters.area}</span></>
                ) : (
                  <>All <span style={{ color: 'var(--c-rust-lt)' }}>Rentals</span></>
                )}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.85rem', color: 'rgba(250,247,242,0.55)', fontWeight: 400 }}>
                  {loading && pagination.total === 0
                    ? 'Searching...'
                    : `${pagination.total} ${pagination.total === 1 ? 'listing' : 'listings'} available`
                  }
                  {!loading && ' · Tuticorin'}
                </p>
                {activeFilterCount > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 8,
                    background: 'rgba(181,84,28,0.25)', border: '1px solid rgba(181,84,28,0.4)',
                  }}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="var(--c-rust-lt)" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    <span style={{ fontSize: '0.7rem', color: 'var(--c-rust-lt)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* View toggle + mobile filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* View mode toggle */}
              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.08)',
                borderRadius: 10, padding: 3, border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {[
                  { mode: 'grid', icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></> },
                  { mode: 'list', icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></> },
                ].map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', cursor: 'pointer',
                      background: viewMode === mode ? 'rgba(181,84,28,0.7)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <svg width="14" height="14" fill={mode === 'grid' ? (viewMode === mode ? 'white' : 'rgba(250,247,242,0.5)') : 'none'} viewBox="0 0 24 24" stroke={mode === 'list' ? (viewMode === mode ? 'white' : 'rgba(250,247,242,0.5)') : 'none'} strokeWidth="2">
                      {icon}
                    </svg>
                  </button>
                ))}
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px', borderRadius: 10,
                  background: 'var(--c-rust)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.02em',
                  boxShadow: '0 4px 16px rgba(181,84,28,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span style={{
                    background: 'white', color: 'var(--c-rust)',
                    borderRadius: 99, width: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800,
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div style={{
          height: 28,
          background: 'var(--c-cream)',
          borderRadius: '28px 28px 0 0',
          marginTop: 0,
        }} />
      </div>

      {/* ── Page Body ────────────────────────────────────── */}
      <div className="page-container" style={{ maxWidth: 1200, paddingTop: 8 }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* ── Sidebar ────────────────────────────────── */}
          <aside
            id="listing-filters"
            style={{
              width: 268,
              flexShrink: 0,
              position: 'sticky',
              top: 84,
            }}
            className="hidden lg:block"
          >
            <div style={{
              background: '#fff',
              borderRadius: 20,
              border: '1px solid var(--c-divider)',
              boxShadow: '0 4px 32px rgba(28,23,17,0.06), 0 1px 4px rgba(28,23,17,0.04)',
              padding: '24px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Top accent stripe */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 3,
                background: 'linear-gradient(90deg, var(--c-rust), var(--c-rust-lt), var(--c-sand))',
                borderRadius: '20px 20px 0 0',
              }} />
              <FilterPanel />
            </div>
          </aside>

          {/* ── Main Content ───────────────────────────── */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Error */}
            {error && (
              <div style={{
                padding: '16px 20px',
                borderRadius: 14,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.875rem',
                marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Skeleton */}
            {loading && properties.length === 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid'
                  ? 'repeat(auto-fill, minmax(280px, 1fr))'
                  : '1fr',
                gap: 20,
              }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Empty state */}
            {!loading && properties.length === 0 && !error && (
              <div style={{
                padding: '72px 40px',
                textAlign: 'center',
                background: '#fff',
                borderRadius: 20,
                border: '1px solid var(--c-divider)',
                boxShadow: '0 4px 24px rgba(28,23,17,0.05)',
              }} id="empty-state">
                <div style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--c-warm), var(--c-paper))',
                  border: '2px solid var(--c-divider)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--c-sand)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9,22 9,12 15,12 15,22" />
                  </svg>
                </div>
                <h3 className="serif" style={{ fontSize: '1.5rem', color: 'var(--c-ink)', marginBottom: 10 }}>
                  No listings found
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', maxWidth: 340, margin: '0 auto 28px', lineHeight: 1.6 }}>
                  Try adjusting your filters or exploring a different area. New properties are added every day!
                </p>
                <button onClick={resetFilters} className="btn-primary" style={{ padding: '11px 28px' }}>
                  Clear all filters
                </button>
              </div>
            )}

            {/* Property Grid / List */}
            {properties.length > 0 && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid'
                    ? 'repeat(auto-fill, minmax(280px, 1fr))'
                    : '1fr',
                  gap: viewMode === 'grid' ? 20 : 14,
                }}>
                  {properties.map((p, i) => (
                    <div
                      key={p.id}
                      style={{
                        animation: 'fadeUp 0.5s ease both',
                        animationDelay: `${Math.min(i * 0.06, 0.4)}s`,
                      }}
                    >
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>

                {/* Load more */}
                {pagination.hasMore && (
                  <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <div style={{
                      display: 'inline-flex', flexDirection: 'column',
                      alignItems: 'center', gap: 12,
                    }}>
                      <div style={{
                        height: 1,
                        width: 200,
                        background: 'linear-gradient(90deg, transparent, var(--c-divider), transparent)',
                      }} />
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        id="load-more-btn"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                          padding: '13px 32px',
                          borderRadius: 12,
                          background: loading
                            ? 'var(--c-warm)'
                            : 'linear-gradient(135deg, var(--c-ink) 0%, var(--c-charcoal) 100%)',
                          color: loading ? 'var(--c-muted)' : 'white',
                          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em',
                          boxShadow: loading ? 'none' : '0 6px 24px rgba(28,23,17,0.2)',
                          transition: 'all 0.25s',
                          minWidth: 200,
                        }}
                      >
                        {loading ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}>
                              <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                            Loading more...
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            Load more listings
                            <span style={{
                              background: 'rgba(255,255,255,0.15)',
                              padding: '2px 8px', borderRadius: 99,
                              fontSize: '0.72rem', fontWeight: 700,
                            }}>
                              {pagination.page * pagination.limit} / {pagination.total}
                            </span>
                          </>
                        )}
                      </button>
                      <p style={{ fontSize: '0.72rem', color: 'var(--c-sand)', fontWeight: 500 }}>
                        Showing {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ──────────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(28,23,17,0.5)',
              zIndex: 100,
              backdropFilter: 'blur(6px)',
            }}
          />
          <div
            className="lg:hidden animate-fade-up"
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              background: 'white',
              borderRadius: '24px 24px 0 0',
              zIndex: 101,
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '0 20px 40px',
              boxShadow: '0 -12px 60px rgba(28,23,17,0.2)',
            }}
          >
            {/* Handle */}
            <div style={{
              position: 'sticky', top: 0,
              background: 'white',
              padding: '14px 0 18px',
              zIndex: 1,
              borderBottom: '1px solid var(--c-divider)',
              marginBottom: 24,
            }}>
              <div style={{
                width: 40, height: 4, borderRadius: 99,
                background: 'var(--c-divider)',
                margin: '0 auto 14px',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--c-ink)' }}>
                  Filters
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'var(--c-warm)', border: 'none',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--c-charcoal)" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <FilterPanel />
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-primary"
              style={{ width: '100%', marginTop: 28, padding: '14px', borderRadius: 14, fontSize: '0.9rem' }}
            >
              View {pagination.total} {pagination.total === 1 ? 'result' : 'results'}
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
