// FILE: src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import BudgetSlider from '../components/BudgetSlider';
import { useAuth } from '../hooks/useAuth';
import { usersAPI, scoutsAPI } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // Editable preferences
  const [prefs, setPrefs] = useState({
    preferred_areas: [],
    budget_min: 1000,
    budget_max: 50000,
  });

  useEffect(() => {
    if (profile) {
      setPrefs({
        preferred_areas: profile.preferred_areas || [],
        budget_min: profile.budget_min || 1000,
        budget_max: profile.budget_max || 50000,
      });
    }
  }, [profile]);

  // Fetch leaderboard for scouts
  useEffect(() => {
    if (profile?.role === 'scout') {
      scoutsAPI.getLeaderboard().then(({ data }) => {
        setLeaderboard(data.leaderboard || []);
      }).catch(() => {});
    }
  }, [profile]);

  const handleSavePreferences = async () => {
    setSaving(true);
    setError(null);
    try {
      await usersAPI.updatePreferences(prefs);
      await fetchProfile();
      setSuccess('Preferences saved!');
      setEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container text-center py-20">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-xl font-bold mb-2">Not logged in</h2>
        <button onClick={() => navigate('/login')} className="btn-primary mt-4">Login</button>
      </div>
    );
  }

  const scoutRank = leaderboard.findIndex((s) => s.id === profile?.id) + 1;

  return (
    <div className="page-container max-w-lg mx-auto">
      {/* Profile header */}
      <div className="card p-6 mb-6 text-center">
        <div className="w-20 h-20 mx-auto mb-4 gradient-brand rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
          <span className="text-3xl font-bold text-white">
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <h1 className="text-xl font-bold text-surface-900">{profile?.name}</h1>
        <p className="text-sm text-surface-700/50 capitalize mt-1">{profile?.role}</p>
        {profile?.phone && (
          <p className="text-xs text-surface-700/40 mt-1">📞 +91 {profile.phone}</p>
        )}
      </div>

      {/* Alerts */}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 text-sm animate-fade-in">{success}</div>}

      {/* Tenant: Preferences */}
      {profile?.role === 'tenant' && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Alert Preferences</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-sm font-semibold text-brand-500 hover:text-brand-600"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-5">
              <AreaSelector
                value={prefs.preferred_areas}
                onChange={(areas) => setPrefs((p) => ({ ...p, preferred_areas: areas }))}
                multiple
                label="Preferred Areas"
              />
              <BudgetSlider
                minValue={prefs.budget_min}
                maxValue={prefs.budget_max}
                onChange={({ min, max }) => setPrefs((p) => ({ ...p, budget_min: min, budget_max: max }))}
                label="Budget Range"
              />
              <button onClick={handleSavePreferences} disabled={saving} className="w-full btn-primary">
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-surface-700/50 mb-1">Watching areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {prefs.preferred_areas.length > 0
                    ? prefs.preferred_areas.map((a) => (
                        <span key={a} className="chip bg-brand-50 text-brand-600 text-xs">{a}</span>
                      ))
                    : <span className="text-sm text-surface-700/40">Not set</span>
                  }
                </div>
              </div>
              <div>
                <p className="text-xs text-surface-700/50 mb-1">Budget range</p>
                <p className="text-sm font-semibold">
                  ₹{prefs.budget_min.toLocaleString('en-IN')} – ₹{prefs.budget_max.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scout: Stats & Leaderboard */}
      {profile?.role === 'scout' && (
        <>
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Scout Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-brand-50 rounded-xl">
                <p className="text-3xl font-bold text-brand-600">{profile.points || 0}</p>
                <p className="text-xs text-surface-700/50 mt-1">Total Points</p>
              </div>
              <div className="text-center p-4 bg-accent-50 rounded-xl">
                <p className="text-3xl font-bold text-accent-600">#{scoutRank || '—'}</p>
                <p className="text-xs text-surface-700/50 mt-1">Your Rank</p>
              </div>
            </div>
          </div>

          {leaderboard.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">🏆 Leaderboard</h2>
              <div className="space-y-2">
                {leaderboard.map((scout) => (
                  <div key={scout.id} className={`flex items-center justify-between p-3 rounded-xl ${
                    scout.id === profile.id ? 'bg-brand-50 border border-brand-200' : 'bg-surface-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-surface-700/50 w-6">
                        {scout.rank <= 3 ? ['🥇', '🥈', '🥉'][scout.rank - 1] : `#${scout.rank}`}
                      </span>
                      <span className="text-sm font-semibold">{scout.name}</span>
                    </div>
                    <span className="text-sm font-bold text-brand-600">{scout.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Logout */}
      <button onClick={handleLogout} className="w-full py-4 rounded-xl text-red-600 font-semibold bg-red-50 hover:bg-red-100 transition-all" id="logout-btn">
        🚪 Logout
      </button>
    </div>
  );
}
