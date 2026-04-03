// ============================================================
// FILE: src/components/Navbar.jsx
// Mobile-first navigation bar with responsive design
// ============================================================

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/listings', label: 'Listings', icon: '📋' },
  ];

  // Role-specific links
  if (isAuthenticated && profile) {
    if (profile.role === 'owner') {
      navLinks.push({ path: '/post-property', label: 'Post', icon: '➕' });
    }
    if (profile.role === 'scout') {
      navLinks.push({ path: '/scout-upload', label: 'Scout', icon: '📸' });
    }
    navLinks.push({ path: '/profile', label: 'Profile', icon: '👤' });
  }

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-surface-200/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center
                           shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <span className="text-white text-lg">🏘</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-surface-900 leading-tight">
                NearbyRental
              </span>
              <span className="text-[10px] text-surface-700/60 font-medium -mt-0.5 hidden sm:block">
                Tuticorin
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                id={`nav-${label.toLowerCase()}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(path)
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-surface-700 hover:bg-surface-100 hover:text-surface-900'
                  }`}
              >
                <span className="mr-1.5">{icon}</span>
                {label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                id="nav-logout"
                className="ml-2 px-4 py-2 rounded-xl text-sm font-medium
                          text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                id="nav-login"
                className="ml-2 btn-primary text-sm !py-2 !px-5"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            id="nav-mobile-menu-toggle"
            className="md:hidden btn-icon hover:bg-surface-100"
          >
            <svg className="w-6 h-6 text-surface-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden animate-slide-down border-t border-surface-200/50 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive(path)
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-surface-700 hover:bg-surface-100'
                  }`}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </Link>
            ))}

            <div className="pt-2 border-t border-surface-200">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium
                            text-red-600 hover:bg-red-50 transition-all"
                >
                  <span className="text-lg">🚪</span>
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center btn-primary text-sm !py-3"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
