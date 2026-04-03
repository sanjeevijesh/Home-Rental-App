// FILE: src/pages/ScoutUpload.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import { scoutsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function ScoutUpload() {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [area, setArea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!image) { setError('Please capture or select a photo'); return; }
    if (!area) { setError('Please select an area'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('area', area);

      // Try to get geolocation
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          formData.append('lat', pos.coords.latitude);
          formData.append('lng', pos.coords.longitude);
        } catch { /* Geolocation optional */ }
      }

      const { data } = await scoutsAPI.submitReport(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">Login Required</h2>
        <p className="text-sm text-surface-700/50 mb-6">Login as a scout to upload reports.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Login</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page-container max-w-lg mx-auto text-center py-12 animate-scale-in">
        <div className="w-20 h-20 mx-auto mb-6 gradient-accent rounded-full flex items-center justify-center shadow-lg shadow-accent-500/30">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Report Submitted!</h2>
        <p className="text-sm text-surface-700/50 mb-4">{result.message}</p>
        <div className="card p-6 mb-6 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold">Your Points</span>
            <span className="text-2xl font-bold text-brand-600">{result.scout?.points || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Your Rank</span>
            <span className="text-2xl font-bold text-accent-600">#{result.scout?.rank || '—'}</span>
          </div>
        </div>
        <button onClick={() => { setResult(null); setImage(null); setPreview(null); setArea(''); }} className="btn-primary">
          Upload Another
        </button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Scout Report</h1>
      <p className="text-sm text-surface-700/50 mb-6">
        Photograph a "To Let" board and earn points! 📸
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      <div className="space-y-5">
        {/* Camera capture */}
        <label className="block cursor-pointer">
          <div className={`border-2 border-dashed rounded-2xl overflow-hidden transition-all
            ${preview ? 'border-accent-400' : 'border-surface-200 hover:border-brand-400'}`}>
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white font-semibold text-sm">Tap to change</span>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="text-5xl mb-3">📷</div>
                <p className="text-sm font-semibold text-surface-700">Tap to capture "To Let" board</p>
                <p className="text-xs text-surface-700/40 mt-1">Use your camera or select from gallery</p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
        </label>

        <AreaSelector value={area} onChange={setArea} label="Where is this?" placeholder="Select area" />

        {/* Points info */}
        {profile && (
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-white font-bold">
                ⭐
              </div>
              <div>
                <p className="text-xs text-surface-700/50">Your Points</p>
                <p className="text-lg font-bold text-surface-900">{profile.points || 0}</p>
              </div>
            </div>
            <span className="text-xs text-accent-600 font-semibold bg-accent-50 px-3 py-1 rounded-full">
              +10 per report
            </span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting} className="w-full btn-primary py-4 flex items-center justify-center gap-2">
          {submitting ? (
            <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting...</>
          ) : '📤 Submit Report'}
        </button>
      </div>
    </div>
  );
}
