// ============================================================
// FILE: src/pages/Home.jsx
// Landing page with area selector, budget slider, and search
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import BudgetSlider from '../components/BudgetSlider';
import NotificationBanner from '../components/NotificationBanner';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../hooks/useRealtime';
import { propertiesAPI } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedArea, setSelectedArea] = useState('');
  const [budget, setBudget] = useState({ min: 1000, max: 50000 });
  const [areaCount, setAreaCount] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);

  // Realtime subscription — show banner when new property matches prefs
  const { newProperty, clearNotification } = useRealtime({
    preferredAreas: profile?.preferred_areas || [],
  });

  // Fetch listing counts
  useEffect(() => {
    const fetchCounts = async () => {
      setLoadingCount(true);
      try {
        const [totalRes, areaRes] = await Promise.all([
          propertiesAPI.getCount(),
          selectedArea ? propertiesAPI.getCount(selectedArea) : Promise.resolve({ data: { count: null } }),
        ]);
        setTotalCount(totalRes.data.count);
        setAreaCount(selectedArea ? areaRes.data.count : null);
      } catch {
        // Non-critical — silently fail
      } finally {
        setLoadingCount(false);
      }
    };
    fetchCounts();
  }, [selectedArea]);

  // Navigate to listings with search params
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedArea) params.set('area', selectedArea);
    if (budget.min > 1000) params.set('minRent', budget.min);
    if (budget.max < 50000) params.set('maxRent', budget.max);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Notification Banner */}
      <NotificationBanner property={newProperty} onDismiss={clearNotification} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-brand opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative page-container max-w-2xl mx-auto text-center pt-8 sm:pt-16 pb-6">
          {/* Tagline chip */}
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-1.5 
                        rounded-full text-xs font-semibold mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse-soft" />
            Live in Thoothukudi
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-surface-900 leading-tight mb-4 animate-slide-up">
            Find Houses in Tuticorin
            <br />
            <span className="text-gradient">Instantly</span>
          </h1>

          <p className="text-base sm:text-lg text-surface-700/70 max-w-md mx-auto mb-8 animate-slide-up">
            Before anyone else. Community-driven listings updated in real-time by local scouts.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mb-10 animate-fade-in">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600">
                {totalCount !== null ? totalCount : '—'}
              </p>
              <p className="text-xs text-surface-700/50 font-medium">Active Listings</p>
            </div>
            <div className="w-px h-10 bg-surface-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-600">10</p>
              <p className="text-xs text-surface-700/50 font-medium">Areas Covered</p>
            </div>
            <div className="w-px h-10 bg-surface-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">24/7</p>
              <p className="text-xs text-surface-700/50 font-medium">Live Updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Card */}
      <section className="page-container -mt-2 max-w-lg mx-auto">
        <div className="card p-6 sm:p-8 space-y-6 animate-scale-in" id="search-card">
          {/* Area Selector */}
          <AreaSelector
            value={selectedArea}
            onChange={setSelectedArea}
            label="Where are you looking?"
            placeholder="Select an area in Tuticorin"
            id="home-area-selector"
          />

          {/* Count indicator */}
          {selectedArea && areaCount !== null && (
            <div className="flex items-center gap-2 text-sm animate-fade-in">
              <span className="w-2 h-2 bg-accent-500 rounded-full" />
              <span className="text-surface-700/70">
                <strong className="text-surface-900">{areaCount}</strong> listings in {selectedArea}
              </span>
            </div>
          )}

          {/* Budget Slider */}
          <BudgetSlider
            minValue={budget.min}
            maxValue={budget.max}
            onChange={setBudget}
            label="Your budget"
            id="home-budget-slider"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full btn-primary text-base py-4 flex items-center justify-center gap-2"
            id="home-search-btn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Houses
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="page-container max-w-3xl mx-auto py-12">
        <h2 className="text-xl font-bold text-center text-surface-900 mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: '📸',
              title: 'Scouts Spot',
              desc: 'Local scouts photograph "To Let" boards across Tuticorin',
            },
            {
              icon: '⚡',
              title: 'Instant Upload',
              desc: 'Listings go live in seconds — you get notified immediately',
            },
            {
              icon: '📞',
              title: 'Direct Contact',
              desc: 'Call or WhatsApp the owner directly — no middlemen',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-surface-50 hover:bg-white hover:shadow-md
                       transition-all duration-300 group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center
                           text-2xl group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="font-bold text-surface-900 mb-1">{step.title}</h3>
              <p className="text-sm text-surface-700/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-surface-700/40">
        <p>NearbyRental © {new Date().getFullYear()} — Made for Thoothukudi 🏘</p>
      </footer>
    </div>
  );
}
