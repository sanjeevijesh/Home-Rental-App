// ============================================================
// FILE: src/hooks/useProperties.js
// Hook for fetching and managing property listings
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { propertiesAPI } from '../services/api';

/**
 * Fetch properties with filters and pagination.
 * @param {object} initialFilters - Initial filter values
 */
export function useProperties(initialFilters = {}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [filters, setFilters] = useState({
    area: '',
    minRent: '',
    maxRent: '',
    type: '',
    furnished: '',
    tenant_type: '',
    status: 'available',
    ...initialFilters,
  });

  // Fetch properties with current filters
  const fetchProperties = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      // Build params — only include non-empty values
      const params = { page, limit: 20 };
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          params[key] = value;
        }
      });

      const { data } = await propertiesAPI.list(params);

      if (append) {
        setProperties((prev) => [...prev, ...data.properties]);
      } else {
        setProperties(data.properties);
      }
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch properties');
      console.error('Fetch properties error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load more (next page)
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      fetchProperties(pagination.page + 1, true);
    }
  }, [pagination, loading, fetchProperties]);

  // Update filters (resets to page 1)
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      area: '',
      minRent: '',
      maxRent: '',
      type: '',
      furnished: '',
      tenant_type: '',
      status: 'available',
    });
  }, []);

  // Add a new property to the top of the list (for realtime updates)
  const addProperty = useCallback((property) => {
    setProperties((prev) => {
      // Avoid duplicates
      if (prev.some((p) => p.id === property.id)) return prev;
      return [property, ...prev];
    });
  }, []);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchProperties(1, false);
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    pagination,
    filters,
    fetchProperties,
    loadMore,
    updateFilters,
    resetFilters,
    addProperty,
  };
}

export default useProperties;
