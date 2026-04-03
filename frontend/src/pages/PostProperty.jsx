// FILE: src/pages/PostProperty.jsx — 3-step property posting wizard
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const TYPES = ['1BHK', '2BHK', '3BHK', 'Single Room', 'Shop'];
const FURNISHED = [
  { value: 'furnished', label: 'Furnished', icon: '🪑' },
  { value: 'semi', label: 'Semi', icon: '🛋' },
  { value: 'unfurnished', label: 'Unfurnished', icon: '📦' },
];
const TENANTS = [
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { value: 'bachelor', label: 'Bachelor', icon: '🧑' },
  { value: 'any', label: 'Anyone', icon: '👥' },
];

export default function PostProperty() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    title: '', rent: '', type: '', furnished: '', tenant_type: '',
    area: '', phone: '', whatsapp: '',
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) { setError('Max 5 images'); return; }
    setImages((p) => [...p, ...files]);
    files.forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => setPreviews((p) => [...p, ev.target.result]);
      r.readAsDataURL(f);
    });
    setError(null);
  };

  const removeImg = (i) => {
    setImages((p) => p.filter((_, j) => j !== i));
    setPreviews((p) => p.filter((_, j) => j !== i));
  };

  const validate = () => {
    setError(null);
    if (step === 2) {
      if (!form.title.trim()) { setError('Title required'); return false; }
      if (!form.rent || Number(form.rent) <= 0) { setError('Valid rent required'); return false; }
      if (!form.type) { setError('Select property type'); return false; }
    }
    if (step === 3) {
      if (!form.area) { setError('Select an area'); return false; }
      if (!form.phone || form.phone.length < 10) { setError('Valid phone required'); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 3)); };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('area', form.area);
      fd.append('rent', form.rent);
      fd.append('type', form.type);
      if (form.furnished) fd.append('furnished', form.furnished);
      if (form.tenant_type) fd.append('tenant_type', form.tenant_type);
      fd.append('phone', form.phone);
      fd.append('whatsapp', form.whatsapp || form.phone);
      images.forEach((img) => fd.append('images', img));
      await propertiesAPI.create(fd);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post');
    } finally { setSubmitting(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">Login Required</h2>
        <p className="text-sm text-surface-700/50 mb-6">Login as an owner to post.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Login</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-container max-w-lg mx-auto text-center py-20 animate-scale-in">
        <div className="w-20 h-20 mx-auto mb-6 gradient-accent rounded-full flex items-center justify-center shadow-lg shadow-accent-500/30">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Property Listed!</h2>
        <p className="text-sm text-surface-700/50 mb-8">Your listing is now live.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/listings')} className="btn-primary">View Listings</button>
          <button onClick={() => { setSuccess(false); setStep(1); setForm({ title:'',rent:'',type:'',furnished:'',tenant_type:'',area:'',phone:'',whatsapp:'' }); setImages([]); setPreviews([]); }} className="btn-secondary">Post Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Post a Property</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8" id="step-progress">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s === step ? 'gradient-brand text-white shadow-lg shadow-brand-500/30'
                : s < step ? 'bg-accent-500 text-white' : 'bg-surface-200 text-surface-700/50'
            }`}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 mx-2 ${s < step ? 'bg-accent-500' : 'bg-surface-200'}`} />}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-surface-700/50 mb-6 font-medium">
        Step {step}/3 — {step === 1 ? 'Photos' : step === 2 ? 'Details' : 'Location & Contact'}
      </p>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in">{error}</div>}

      {/* Step 1: Photos */}
      {step === 1 && (
        <div className="card p-6 space-y-4 animate-fade-in">
          <h2 className="text-lg font-bold">Upload Photos</h2>
          <p className="text-sm text-surface-700/50">Add up to 5 photos (optional)</p>
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-surface-200 rounded-2xl p-8 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-all">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm font-semibold text-surface-700">Tap to upload or take a photo</p>
              <p className import="text-xs text-surface-700/40 mt-1">JPEG, PNG, WebP • Max 5MB</p>
            </div>
            <input type="file" accept="image/*" capture="environment" multiple onChange={handleImages} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative group">
                  <img src={p} alt="" className="w-full h-24 object-cover rounded-xl" />
                  <button onClick={() => removeImg(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="card p-6 space-y-4 animate-fade-in">
          <h2 className="text-lg font-bold">Property Details</h2>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g., Spacious 2BHK near New Bus Stand" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">Monthly Rent (₹)</label>
            <input type="number" value={form.rent} onChange={(e) => update('rent', e.target.value)} placeholder="8000" className="input-field" inputMode="numeric" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button key={t} type="button" onClick={() => update('type', t)} className={`py-3 rounded-xl text-sm font-semibold transition-all ${form.type === t ? 'gradient-brand text-white shadow-lg shadow-brand-500/20' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Furnished</label>
            <div className="grid grid-cols-3 gap-2">
              {FURNISHED.map(({ value, label, icon }) => (
                <button key={value} type="button" onClick={() => update('furnished', value)} className={`py-3 rounded-xl text-xs font-semibold transition-all ${form.furnished === value ? 'gradient-brand text-white shadow-lg' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}>
                  <span className="block text-lg mb-1">{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Tenant Preference</label>
            <div className="grid grid-cols-3 gap-2">
              {TENANTS.map(({ value, label, icon }) => (
                <button key={value} type="button" onClick={() => update('tenant_type', value)} className={`py-3 rounded-xl text-xs font-semibold transition-all ${form.tenant_type === value ? 'gradient-brand text-white shadow-lg' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}>
                  <span className="block text-lg mb-1">{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Location & Contact */}
      {step === 3 && (
        <div className="card p-6 space-y-4 animate-fade-in">
          <h2 className="text-lg font-bold">Location & Contact</h2>
          <AreaSelector value={form.area} onChange={(v) => update('area', v)} label="Property Area" placeholder="Select area" />
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">Phone Number</label>
            <div className="flex">
              <span className="px-3 py-3 bg-surface-100 border border-r-0 border-surface-200 rounded-l-xl text-sm text-surface-700">+91</span>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="input-field !rounded-l-none" inputMode="tel" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">WhatsApp <span className="font-normal text-surface-700/40">(optional)</span></label>
            <div className="flex">
              <span className="px-3 py-3 bg-surface-100 border border-r-0 border-surface-200 rounded-l-xl text-sm text-surface-700">+91</span>
              <input type="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Same as phone if empty" className="input-field !rounded-l-none" inputMode="tel" />
            </div>
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3 mt-6">
        {step > 1 && <button onClick={prev} className="btn-secondary flex-1">← Back</button>}
        {step < 3 ? (
          <button onClick={next} className="btn-primary flex-1">Next →</button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {submitting ? (<><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Posting...</>) : '🚀 Post Property'}
          </button>
        )}
      </div>
    </div>
  );
}
