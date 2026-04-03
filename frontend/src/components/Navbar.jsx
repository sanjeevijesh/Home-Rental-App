// FILE: src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/listings', label: 'Listings' },
  ];

  if (isAuthenticated && profile) {
    if (profile.role === 'owner')  navLinks.push({ path: '/post-property', label: 'Post' });
    if (profile.role === 'scout')  navLinks.push({ path: '/scout-upload', label: 'Scout' });
    navLinks.push({ path: '/profile', label: 'Profile' });
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 nav-glass transition-shadow duration-300"
        style={{ boxShadow: scrolled ? '0 2px 20px rgba(28,23,17,0.08)' : 'none' }}
      >
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" id="nav-logo">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--c-rust)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <div>
                <span className="serif text-base font-normal" style={{ color: 'var(--c-ink)', letterSpacing: '-0.01em' }}>
                  NearbyRental
                </span>
                <span
                  className="hidden sm:block text-[10px] font-medium tracking-widest uppercase"
                  style={{ color: 'var(--c-muted)', marginTop: '-1px' }}
                >
                  Tuticorin
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  id={`nav-${label.toLowerCase()}`}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive(path) ? 'var(--c-rust)' : 'var(--c-charcoal)',
                    background: isActive(path) ? 'rgba(181,84,28,0.08)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isActive(path)) e.currentTarget.style.background = 'var(--c-warm)'; }}
                  onMouseLeave={e => { if (!isActive(path)) e.currentTarget.style.background = 'transparent'; }}
                >
                  {label}
                </Link>
              ))}

              <div className="w-px h-5 mx-2" style={{ background: 'var(--c-divider)' }} />

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  id="nav-logout"
                  className="btn-ghost text-sm"
                  style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}
                >
                  Sign out
                </button>
              ) : (
                <Link to="/login" id="nav-login" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              id="nav-mobile-menu-toggle"
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--c-charcoal)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--c-warm)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden animate-fade-in"
            style={{
              borderTop: '1px solid var(--c-divider)',
              background: 'rgba(250,247,242,0.98)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="px-5 py-4 space-y-1">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    color: isActive(path) ? 'var(--c-rust)' : 'var(--c-charcoal)',
                    background: isActive(path) ? 'rgba(181,84,28,0.08)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--c-divider)' }}>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ color: 'var(--c-muted)' }}
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary w-full justify-center"
                    style={{ width: '100%' }}
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}