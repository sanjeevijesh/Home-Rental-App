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

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 99,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        cursor: 'pointer',
        border: active ? 'none' : '1.5px solid var(--c-divider)',
        background: active ? 'var(--c-rust)' : 'transparent',
        color: active ? 'white' : 'var(--c-charcoal)',
        transition: 'all 0.15s',
        textTransform: 'capitalize',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--c-warm)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {label}
    </button>
  );
}

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

export default function Listings() {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const FilterPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--c-ink)' }}>Filters</h2>
        <button
          onClick={resetFilters}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--c-rust)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          Clear all
        </button>
      </div>

      {/* Area */}
      <div>
        <label className="field-label">Area</label>
        <AreaSelector
          value={filters.area}
          onChange={(val) => updateFilters({ area: val })}
          id="filter-area"
        />
      </div>

      {/* Budget */}
      <div>
        <label className="field-label">Rent Range</label>
        <BudgetSlider
          minValue={filters.minRent ? Number(filters.minRent) : 1000}
          maxValue={filters.maxRent ? Number(filters.maxRent) : 50000}
          onChange={({ min, max }) => updateFilters({ minRent: min, maxRent: max })}
          id="filter-budget"
        />
      </div>

      {/* Type */}
      <div>
        <label className="field-label">Property Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {PROPERTY_TYPES.map(t => (
            <FilterChip
              key={t}
              label={t}
              active={filters.type === t}
              onClick={() => updateFilters({ type: filters.type === t ? '' : t })}
            />
          ))}
        </div>
      </div>

      {/* Furnished */}
      <div>
        <label className="field-label">Furnished</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {FURNISHED_OPTIONS.map(f => (
            <FilterChip
              key={f}
              label={f}
              active={filters.furnished === f}
              onClick={() => updateFilters({ furnished: filters.furnished === f ? '' : f })}
            />
          ))}
        </div>
      </div>

      {/* Tenant */}
      <div>
        <label className="field-label">Preferred Tenant</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {TENANT_TYPES.map(t => (
            <FilterChip
              key={t}
              label={t}
              active={filters.tenant_type === t}
              onClick={() => updateFilters({ tenant_type: filters.tenant_type === t ? '' : t })}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* ── Sidebar ──────────────────────────────────── */}
        <aside
          id="listing-filters"
          style={{
            width: 260,
            flexShrink: 0,
            position: 'sticky',
            top: 84,
          }}
          className="hidden lg:block"
        >
          <div className="card" style={{ padding: '24px 20px' }}>
            <FilterPanel />
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Page header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                className="serif"
                style={{ fontSize: '1.7rem', color: 'var(--c-ink)', letterSpacing: '-0.02em', marginBottom: 2 }}
              >
                {filters.area ? `Rentals in ${filters.area}` : 'All Rentals'}
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)' }}>
                {pagination.total} {pagination.total === 1 ? 'listing' : 'listings'} found
                {filters.area ? ` · ${filters.area}, Tuticorin` : ' · Tuticorin'}
              </p>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span style={{
                  background: 'var(--c-rust)', color: 'white',
                  borderRadius: 99, width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.875rem',
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Skeleton */}
          {loading && properties.length === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && properties.length === 0 && !error && (
            <div className="card" id="empty-state" style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--c-paper)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--c-sand)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--c-ink)', marginBottom: 8 }}>
                No listings found
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--c-muted)', maxWidth: 320, margin: '0 auto 24px' }}>
                Try adjusting your filters or search in a different area. New listings are added daily!
              </p>
              <button onClick={resetFilters} className="btn-secondary">
                Clear filters
              </button>
            </div>
          )}

          {/* Grid */}
          {properties.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {properties.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>

              {pagination.hasMore && (
                <div style={{ textAlign: 'center', marginTop: 36 }}>
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-secondary"
                    id="load-more-btn"
                    style={{ minWidth: 180 }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}>
                          <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      `Load more · ${pagination.page * pagination.limit} of ${pagination.total}`
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(28,23,17,0.4)',
              zIndex: 100,
              backdropFilter: 'blur(4px)',
            }}
          />
          <div
            className="lg:hidden animate-fade-up"
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              background: 'white',
              borderRadius: '20px 20px 0 0',
              zIndex: 101,
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '24px 20px 40px',
              boxShadow: '0 -8px 40px rgba(28,23,17,0.15)',
            }}
          >
            <div
              style={{
                width: 40, height: 4, borderRadius: 99,
                background: 'var(--c-divider)',
                margin: '0 auto 24px',
              }}
            />
            <FilterPanel />
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-primary"
              style={{ width: '100%', marginTop: 24, padding: '13px' }}
            >
              Show {pagination.total} results
            </button>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}