// ============================================================
// FILE: src/pages/Listings.jsx
// Property listings grid with sidebar filters and load more
// ============================================================

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import AreaSelector from '../components/AreaSelector';
import BudgetSlider from '../components/BudgetSlider';
import useProperties from '../hooks/useProperties';

const PROPERTY_TYPES = ['1BHK', '2BHK', '3BHK', 'Single Room', 'Shop'];
const FURNISHED_OPTIONS = ['furnished', 'semi', 'unfurnished'];
const TENANT_TYPES = ['family', 'bachelor', 'any'];

export default function Listings() {
  const [searchParams] = useSearchParams();

  // Initialize filters from URL query params
  const initialFilters = useMemo(() => ({
    area: searchParams.get('area') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    type: searchParams.get('type') || '',
  }), [searchParams]);

  const {
    properties,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    resetFilters,
    loadMore,
  } = useProperties(initialFilters);

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="card overflow-hidden animate-pulse">
      <div className="w-full h-44 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-8 w-24 skeleton" />
        <div className="h-4 w-3/4 skeleton" />
        <div className="flex gap-2">
          <div className="h-6 w-20 skeleton rounded-full" />
          <div className="h-6 w-16 skeleton rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 flex-1 skeleton rounded-xl" />
          <div className="h-10 flex-1 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar Filters ──────────────────────────────── */}
        <aside className="w-full lg:w-72 flex-shrink-0" id="listing-filters">
          <div className="card p-5 space-y-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-900">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-brand-500 hover:text-brand-600"
                id="filter-reset-btn"
              >
                Reset all
              </button>
            </div>

            {/* Area filter */}
            <AreaSelector
              value={filters.area}
              onChange={(val) => updateFilters({ area: val })}
              label="Area"
              id="filter-area"
            />

            {/* Budget filter */}
            <BudgetSlider
              minValue={filters.minRent ? Number(filters.minRent) : 1000}
              maxValue={filters.maxRent ? Number(filters.maxRent) : 50000}
              onChange={({ min, max }) =>
                updateFilters({ minRent: min, maxRent: max })
              }
              label="Rent Range"
              id="filter-budget"
            />

            {/* Type filter */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Property Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      updateFilters({ type: filters.type === t ? '' : t })
                    }
                    className={`chip text-[11px] cursor-pointer transition-all
                      ${filters.type === t
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Furnished filter */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Furnished
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FURNISHED_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      updateFilters({ furnished: filters.furnished === f ? '' : f })
                    }
                    className={`chip text-[11px] cursor-pointer transition-all capitalize
                      ${filters.furnished === f
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Tenant type filter */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Tenant Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TENANT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      updateFilters({ tenant_type: filters.tenant_type === t ? '' : t })
                    }
                    className={`chip text-[11px] cursor-pointer transition-all capitalize
                      ${filters.tenant_type === t
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Listing Grid ─────────────────────────────────── */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-surface-900">
                {filters.area ? `Rentals in ${filters.area}` : 'All Rentals in Tuticorin'}
              </h1>
              <p className="text-sm text-surface-700/50 mt-0.5">
                {pagination.total} {pagination.total === 1 ? 'listing' : 'listings'} found
              </p>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="card p-6 text-center text-red-600 bg-red-50 border-red-200">
              <p className="font-semibold">Something went wrong</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && properties.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && properties.length === 0 && !error && (
            <div className="card p-12 text-center" id="empty-state">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">
                No listings found
              </h3>
              <p className="text-sm text-surface-700/50 max-w-sm mx-auto">
                Try adjusting your filters or search in a different area.
                New listings are added every day!
              </p>
              <button
                onClick={resetFilters}
                className="btn-secondary mt-6 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Grid */}
          {properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Load More */}
              {pagination.hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-secondary inline-flex items-center gap-2"
                    id="load-more-btn"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path fill="currentColor" className="opacity-75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load more
                        <span className="text-xs text-surface-700/50">
                          ({pagination.page * pagination.limit} of {pagination.total})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
