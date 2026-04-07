// FILE: src/pages/PostProperty.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const TYPES = ['1BHK', '2BHK', '3BHK', 'Single Room', 'Shop'];
const FURNISHED = [
  { value: 'furnished',   label: 'Furnished',   desc: 'All furniture included', icon: '🛋️' },
  { value: 'semi',        label: 'Semi',         desc: 'Basic items provided',   icon: '🪑' },
  { value: 'unfurnished', label: 'Unfurnished',  desc: 'Empty space',            icon: '🏠' },
];
const TENANTS = [
  { value: 'family',   label: 'Family',   desc: 'Families preferred', icon: '👨‍👩‍👧' },
  { value: 'bachelor', label: 'Bachelor', desc: 'Singles / couples',  icon: '🧑' },
  { value: 'any',      label: 'Anyone',   desc: 'Open to all',        icon: '🤝' },
];

const STEPS = [
  { num: 1, label: 'Photos',   short: 'Add photos',         icon: '📷' },
  { num: 2, label: 'Details',  short: 'Property info',      icon: '📋' },
  { num: 3, label: 'Contact',  short: 'Location & contact', icon: '📍' },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

  .pp-wrap {
    min-height: 100vh;
    padding: 32px 16px 80px;
    font-family: 'DM Sans', sans-serif;
  }

  .pp-card {
    max-width: 520px;
    margin: 0 auto;
    background: white;
    border-radius: 24px;
    box-shadow: 0 4px 40px rgba(0,0,0,0.08);
    overflow: hidden;
  }

  .pp-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
    padding: 32px 32px 40px;
    position: relative;
    overflow: hidden;
  }
  .pp-header::before {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(229,108,52,0.15);
    top: -60px; right: -40px;
  }
  .pp-header::after {
    content: '';
    position: absolute;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(229,108,52,0.08);
    bottom: 0; left: 20px;
  }

  .pp-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin: 0 0 4px;
    position: relative; z-index: 1;
  }
  .pp-subtitle {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.55);
    margin: 0;
    position: relative; z-index: 1;
    letter-spacing: 0.02em;
  }

  /* Step progress */
  .pp-steps {
    display: flex;
    gap: 0;
    position: relative;
    z-index: 1;
    margin-top: 24px;
  }
  .pp-step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    position: relative;
  }
  .pp-step-item:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 60%;
    width: 80%;
    height: 2px;
    background: rgba(255,255,255,0.15);
    z-index: 0;
  }
  .pp-step-item.done:not(:last-child)::after {
    background: rgba(229,108,52,0.6);
  }
  .pp-step-dot {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 2px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.5);
    font-weight: 700;
    transition: all 0.3s;
    position: relative; z-index: 1;
  }
  .pp-step-item.active .pp-step-dot {
    background: #e56c34;
    border-color: #e56c34;
    color: white;
    box-shadow: 0 0 0 4px rgba(229,108,52,0.25);
  }
  .pp-step-item.done .pp-step-dot {
    background: rgba(229,108,52,0.3);
    border-color: rgba(229,108,52,0.6);
    color: #e56c34;
  }
  .pp-step-label {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }
  .pp-step-item.active .pp-step-label { color: rgba(255,255,255,0.85); }
  .pp-step-item.done .pp-step-label  { color: rgba(229,108,52,0.8); }

  /* Body */
  .pp-body {
    padding: 28px 28px 24px;
  }

  /* Error */
  .pp-error {
    margin-bottom: 20px;
    padding: 12px 16px;
    border-radius: 12px;
    background: #fff1f1;
    border-left: 3px solid #ef4444;
    color: #dc2626;
    font-size: 0.83rem;
    font-weight: 500;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }
  @keyframes spin    { to { transform: rotate(360deg); } }

  /* Photo upload */
  .pp-upload-zone {
    border: 2px dashed #e2e8f0;
    border-radius: 18px;
    padding: 36px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s;
    background: #fafbff;
    position: relative;
    overflow: hidden;
  }
  .pp-upload-zone:hover {
    border-color: #e56c34;
    background: #fff7f3;
  }
  .pp-upload-zone.has-photos {
    border-style: solid;
    border-color: #e56c34;
    background: #fff7f3;
    padding: 14px 20px;
  }
  .pp-upload-icon-wrap {
    width: 60px; height: 60px;
    border-radius: 16px;
    background: white;
    border: 1.5px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .pp-upload-title {
    font-size: 0.92rem; font-weight: 600;
    color: #1e293b; margin-bottom: 4px;
  }
  .pp-upload-hint {
    font-size: 0.76rem; color: #94a3b8;
  }
  .pp-upload-more {
    font-size: 0.8rem; font-weight: 600;
    color: #e56c34;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }

  .pp-photo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 14px;
  }
  .pp-photo-thumb {
    position: relative; border-radius: 12px; overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .pp-photo-thumb img {
    width: 100%; height: 96px; object-fit: cover; display: block;
  }
  .pp-photo-remove {
    position: absolute; top: 6px; right: 6px;
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(220,38,38,0.92); color: white;
    border: none; cursor: pointer; font-size: 0.65rem;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s;
  }
  .pp-photo-remove:hover { transform: scale(1.1); }
  .pp-photo-badge {
    position: absolute; bottom: 6px; left: 6px;
    background: rgba(0,0,0,0.55); color: white;
    font-size: 0.6rem; font-weight: 600;
    padding: 2px 6px; border-radius: 6px;
    backdrop-filter: blur(4px);
  }
  .pp-skip-hint {
    text-align: center; font-size: 0.74rem; color: #94a3b8; margin-top: 14px;
  }

  /* Fields */
  .pp-field-group { display: flex; flex-direction: column; gap: 20px; }
  .pp-label {
    display: block;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: #64748b;
    margin-bottom: 8px;
  }
  .pp-input {
    width: 100%; box-sizing: border-box;
    padding: 12px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
    color: #1e293b; background: white;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .pp-input:focus {
    border-color: #e56c34;
    box-shadow: 0 0 0 3px rgba(229,108,52,0.12);
  }
  .pp-input-prefix-wrap { display: flex; }
  .pp-input-prefix {
    padding: 12px 14px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0; border-right: none;
    border-radius: 12px 0 0 12px;
    font-size: 0.85rem; color: #94a3b8; font-weight: 500;
    white-space: nowrap; display: flex; align-items: center;
  }
  .pp-input-prefix-wrap .pp-input {
    border-radius: 0 12px 12px 0;
  }
  .pp-input-price-wrap { position: relative; }
  .pp-input-price-sym {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #94a3b8; font-size: 0.95rem; pointer-events: none;
  }
  .pp-input-price-wrap .pp-input { padding-left: 28px; }

  /* Type chips */
  .pp-type-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .pp-type-chip {
    padding: 8px 18px; border-radius: 10px; cursor: pointer;
    border: 1.5px solid #e2e8f0;
    background: white; color: #475569;
    font-size: 0.84rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .pp-type-chip:hover  { border-color: #fbbf9a; background: #fff7f3; color: #e56c34; }
  .pp-type-chip.active { border-color: #e56c34; background: rgba(229,108,52,0.07); color: #e56c34; }

  /* Option cards */
  .pp-option-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
  .pp-option-card {
    padding: 14px 10px; border-radius: 14px; cursor: pointer;
    border: 1.5px solid #e2e8f0; background: white;
    text-align: center; transition: all 0.18s;
    font-family: 'DM Sans', sans-serif;
  }
  .pp-option-card:hover  { border-color: #fbbf9a; background: #fff7f3; }
  .pp-option-card.active { border-color: #e56c34; background: rgba(229,108,52,0.06); }
  .pp-option-icon { font-size: 1.3rem; margin-bottom: 6px; }
  .pp-option-label {
    font-size: 0.8rem; font-weight: 700;
    color: #1e293b; margin-bottom: 2px;
  }
  .pp-option-card.active .pp-option-label { color: #e56c34; }
  .pp-option-desc { font-size: 0.65rem; color: #94a3b8; line-height: 1.4; }

  /* Navigation */
  .pp-nav { display: flex; gap: 10px; margin-top: 28px; }
  .pp-btn-back {
    flex: 1; padding: 13px;
    border-radius: 14px; border: 1.5px solid #e2e8f0;
    background: white; color: #475569;
    font-size: 0.9rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .pp-btn-back:hover { background: #f8fafc; border-color: #cbd5e1; }
  .pp-btn-next {
    flex: 1; padding: 13px;
    border-radius: 14px; border: none;
    background: linear-gradient(135deg, #e56c34, #c8511e);
    color: white; font-size: 0.9rem; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(229,108,52,0.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .pp-btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(229,108,52,0.45); }
  .pp-btn-next:disabled { opacity: 0.7; cursor: not-allowed; }

  /* Success / Auth screens */
  .pp-center-screen {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; font-family: 'DM Sans', sans-serif;
  }
  .pp-center-card {
    max-width: 400px; width: 100%; text-align: center;
    background: white; border-radius: 24px;
    padding: 48px 32px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.1);
  }
  .pp-icon-circle {
    width: 72px; height: 72px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .pp-center-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 700; color: #1e293b;
    margin: 0 0 8px;
  }
  .pp-center-sub {
    font-size: 0.875rem; color: #64748b; margin: 0 0 28px; line-height: 1.6;
  }
  .pp-action-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
`;

function OptionCard({ selected, onClick, label, desc, icon }) {
  return (
    <button type="button" onClick={onClick} className={`pp-option-card${selected ? ' active' : ''}`}>
      <div className="pp-option-icon">{icon}</div>
      <p className="pp-option-label">{label}</p>
      {desc && <p className="pp-option-desc">{desc}</p>}
    </button>
  );
}

export default function PostProperty() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({ title: '', rent: '', type: '', furnished: '', tenant_type: '', area: '', phone: '', whatsapp: '' });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── FIX: removed capture="environment" so gallery opens on mobile ──
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) { setError('Maximum 5 images allowed'); return; }
    setImages(p => [...p, ...files]);
    files.forEach(f => {
      const r = new FileReader();
      r.onload = ev => setPreviews(p => [...p, ev.target.result]);
      r.readAsDataURL(f);
    });
    setError(null);
  };

  const removeImg = (i) => {
    setImages(p => p.filter((_, j) => j !== i));
    setPreviews(p => p.filter((_, j) => j !== i));
  };

  const validate = () => {
    setError(null);
    if (step === 2) {
      if (!form.title.trim()) { setError('Title is required'); return false; }
      if (!form.rent || Number(form.rent) <= 0) { setError('Please enter a valid rent amount'); return false; }
      if (!form.type) { setError('Please select a property type'); return false; }
    }
    if (step === 3) {
      if (!form.area) { setError('Please select an area'); return false; }
      if (!form.phone || form.phone.length < 10) { setError('Please enter a valid 10-digit phone number'); return false; }
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true); setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (!form.whatsapp) fd.append('whatsapp', form.phone);
      images.forEach(img => fd.append('images', img));
      await propertiesAPI.create(fd);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post property');
    } finally { setSubmitting(false); }
  };

  if (!isAuthenticated) {
    return (
      <>
        <style>{styles}</style>
        <div className="pp-center-screen">
          <div className="pp-center-card">
            <div className="pp-icon-circle" style={{ background: '#f1f5f9', border: '2px solid #e2e8f0' }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="1.6">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="pp-center-title">Login required</h2>
            <p className="pp-center-sub">You need to be logged in as an owner to post a property.</p>
            <div className="pp-action-row">
              <button onClick={() => navigate('/login')} className="pp-btn-next" style={{ flex: 'none', padding: '12px 32px' }}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <style>{styles}</style>
        <div className="pp-center-screen">
          <div className="pp-center-card">
            <div className="pp-icon-circle" style={{ background: 'rgba(22,163,74,0.1)', border: '2px solid rgba(22,163,74,0.2)' }}>
              <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="pp-center-title">Property listed!</h2>
            <p className="pp-center-sub">Your listing is now live and visible to renters in Tuticorin.</p>
            <div className="pp-action-row">
              <button onClick={() => navigate('/listings')} className="pp-btn-next" style={{ flex: 'none', padding: '12px 28px' }}>
                View listings
              </button>
              <button
                onClick={() => { setSuccess(false); setStep(1); setForm({ title:'',rent:'',type:'',furnished:'',tenant_type:'',area:'',phone:'',whatsapp:'' }); setImages([]); setPreviews([]); }}
                className="pp-btn-back" style={{ flex: 'none', padding: '12px 28px' }}
              >
                Post another
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pp-wrap">
        <div className="pp-card">
          {/* Header */}
          <div className="pp-header">
            <h1 className="pp-title">Post a property</h1>
            <p className="pp-subtitle">Step {step} of 3 — {STEPS[step - 1].short}</p>

            {/* Step progress */}
            <div className="pp-steps">
              {STEPS.map(s => {
                const cls = s.num === step ? 'active' : s.num < step ? 'done' : '';
                return (
                  <div key={s.num} className={`pp-step-item ${cls}`}>
                    <div className="pp-step-dot">
                      {s.num < step
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        : s.num}
                    </div>
                    <span className="pp-step-label">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="pp-body">
            {error && <div className="pp-error">⚠️ {error}</div>}

            {/* ── Step 1: Photos ── */}
            {step === 1 && (
              <div>
                <label style={{ cursor: 'pointer' }}>
                  <div className={`pp-upload-zone${previews.length > 0 ? ' has-photos' : ''}`}>
                    {previews.length === 0 ? (
                      <>
                        <div className="pp-upload-icon-wrap">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#e56c34" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                        </div>
                        <p className="pp-upload-title">Tap to add photos</p>
                        <p className="pp-upload-hint">Choose from gallery or take a photo · Up to 5 images</p>
                      </>
                    ) : (
                      <p className="pp-upload-more">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add more photos ({previews.length}/5)
                      </p>
                    )}
                  </div>
                  {/* ── KEY FIX: no capture attribute = gallery + camera choice on mobile ── */}
                  <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                </label>

                {previews.length > 0 && (
                  <div className="pp-photo-grid">
                    {previews.map((p, i) => (
                      <div key={i} className="pp-photo-thumb">
                        <img src={p} alt="" />
                        {i === 0 && <span className="pp-photo-badge">Cover</span>}
                        <button onClick={() => removeImg(i)} className="pp-photo-remove">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="pp-skip-hint">Photos are optional — you can skip this step</p>
              </div>
            )}

            {/* ── Step 2: Details ── */}
            {step === 2 && (
              <div className="pp-field-group">
                <div>
                  <label className="pp-label">Listing title</label>
                  <input
                    type="text" value={form.title}
                    onChange={e => update('title', e.target.value)}
                    placeholder="e.g. Spacious 2BHK near New Bus Stand"
                    className="pp-input"
                  />
                </div>

                <div>
                  <label className="pp-label">Monthly rent (₹)</label>
                  <div className="pp-input-price-wrap">
                    <span className="pp-input-price-sym">₹</span>
                    <input
                      type="number" value={form.rent}
                      onChange={e => update('rent', e.target.value)}
                      placeholder="8000"
                      className="pp-input"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div>
                  <label className="pp-label">Property type</label>
                  <div className="pp-type-chips">
                    {TYPES.map(t => (
                      <button
                        key={t} type="button" onClick={() => update('type', t)}
                        className={`pp-type-chip${form.type === t ? ' active' : ''}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="pp-label">Furnished status</label>
                  <div className="pp-option-grid">
                    {FURNISHED.map(({ value, label, desc, icon }) => (
                      <OptionCard key={value} selected={form.furnished === value} onClick={() => update('furnished', value)} label={label} desc={desc} icon={icon} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="pp-label">Tenant preference</label>
                  <div className="pp-option-grid">
                    {TENANTS.map(({ value, label, desc, icon }) => (
                      <OptionCard key={value} selected={form.tenant_type === value} onClick={() => update('tenant_type', value)} label={label} desc={desc} icon={icon} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Location & Contact ── */}
            {step === 3 && (
              <div className="pp-field-group">
                <div>
                  <label className="pp-label">Property area</label>
                  <AreaSelector value={form.area} onChange={v => update('area', v)} placeholder="Select area in Tuticorin" />
                </div>

                <div>
                  <label className="pp-label">Phone number</label>
                  <div className="pp-input-prefix-wrap">
                    <span className="pp-input-prefix">+91</span>
                    <input
                      type="tel" value={form.phone}
                      onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="pp-input"
                      inputMode="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="pp-label">
                    WhatsApp number
                    <span style={{ fontWeight: 400, color: '#94a3b8', textTransform: 'none', letterSpacing: 0, marginLeft: 6, fontSize: '0.75rem' }}>optional</span>
                  </label>
                  <div className="pp-input-prefix-wrap">
                    <span className="pp-input-prefix">+91</span>
                    <input
                      type="tel" value={form.whatsapp}
                      onChange={e => update('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Leave blank to use phone"
                      className="pp-input"
                      inputMode="tel"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="pp-nav">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="pp-btn-back">
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => { if (validate()) setStep(s => s + 1); }} className="pp-btn-next">
                  Continue →
                </button>
              ) : (
                <button onClick={submit} disabled={submitting} className="pp-btn-next">
                  {submitting ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}>
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Posting…
                    </>
                  ) : '🏠 Post listing'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
