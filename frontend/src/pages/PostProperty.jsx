// FILE: src/pages/PostProperty.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const TYPES = ['1BHK', '2BHK', '3BHK', 'Single Room', 'Shop'];
const FURNISHED = [
  { value: 'furnished',   label: 'Furnished',   desc: 'All furniture included' },
  { value: 'semi',        label: 'Semi',         desc: 'Basic items provided' },
  { value: 'unfurnished', label: 'Unfurnished',  desc: 'Empty space' },
];
const TENANTS = [
  { value: 'family',   label: 'Family',   desc: 'Families preferred' },
  { value: 'bachelor', label: 'Bachelor', desc: 'Singles / couples' },
  { value: 'any',      label: 'Anyone',   desc: 'Open to all' },
];

const STEPS = [
  { num: 1, label: 'Photos', short: 'Add photos' },
  { num: 2, label: 'Details', short: 'Property info' },
  { num: 3, label: 'Contact', short: 'Location & contact' },
];

function OptionCard({ selected, onClick, label, desc, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '14px 12px',
        borderRadius: 12,
        border: selected ? '2px solid var(--c-rust)' : '2px solid var(--c-divider)',
        background: selected ? 'rgba(181,84,28,0.05)' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      {children}
      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: selected ? 'var(--c-rust)' : 'var(--c-ink)', marginBottom: 2 }}>
        {label}
      </p>
      {desc && (
        <p style={{ fontSize: '0.68rem', color: 'var(--c-muted)', lineHeight: 1.4 }}>{desc}</p>
      )}
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
      <div className="page-container" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="var(--c-sand)" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 8 }}>Login required</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', marginBottom: 24 }}>You need to be logged in as an owner to post a property.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Sign in</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-container" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 60 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(22,163,74,0.1)',
          border: '2px solid rgba(22,163,74,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="serif" style={{ fontSize: '2rem', color: 'var(--c-ink)', marginBottom: 10, letterSpacing: '-0.02em' }}>
          Property listed!
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', marginBottom: 32 }}>
          Your listing is now live and visible to renters in Tuticorin.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/listings')} className="btn-primary">View listings</button>
          <button
            onClick={() => { setSuccess(false); setStep(1); setForm({ title:'',rent:'',type:'',furnished:'',tenant_type:'',area:'',phone:'',whatsapp:'' }); setImages([]); setPreviews([]); }}
            className="btn-secondary"
          >
            Post another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 520 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="serif" style={{ fontSize: '1.9rem', color: 'var(--c-ink)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Post a property
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>
          Step {step} of 3 — {STEPS[step - 1].short}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }} id="step-progress">
        {STEPS.map(s => (
          <div key={s.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              height: 3,
              borderRadius: 99,
              background: s.num <= step ? 'var(--c-rust)' : 'var(--c-divider)',
              transition: 'background 0.3s',
            }} />
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: s.num === step ? 'var(--c-rust)' : s.num < step ? 'var(--c-muted)' : 'var(--c-sand)',
              letterSpacing: '0.04em',
            }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="animate-fade-in" style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 10,
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.85rem',
        }}>
          {error}
        </div>
      )}

      {/* ── Step 1: Photos ── */}
      {step === 1 && (
        <div className="animate-fade-in">
          <label style={{ display: 'block', cursor: 'pointer', marginBottom: 16 }}>
            <div style={{
              border: `2px dashed ${previews.length > 0 ? 'var(--c-rust)' : 'var(--c-divider)'}`,
              borderRadius: 16, overflow: 'hidden',
              transition: 'border-color 0.2s',
              background: previews.length > 0 ? 'transparent' : 'var(--c-paper)',
            }}>
              {previews.length === 0 ? (
                <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, background: 'white', border: '1px solid var(--c-divider)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: 'var(--shadow-card)',
                  }}>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--c-rust)" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-charcoal)', marginBottom: 4 }}>
                    Upload photos
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--c-muted)' }}>
                    Up to 5 photos · JPEG, PNG, WebP
                  </p>
                </div>
              ) : (
                <div style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid var(--c-divider)', color: 'var(--c-rust)', fontSize: '0.78rem', fontWeight: 600 }}>
                  + Add more photos ({previews.length}/5)
                </div>
              )}
            </div>
            <input type="file" accept="image/*" capture="environment" multiple onChange={handleImages} style={{ display: 'none' }} />
          </label>

          {previews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {previews.map((p, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                  <img src={p} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => removeImg(i)}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(220,38,38,0.9)', color: 'white',
                      border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--c-muted)', textAlign: 'center' }}>
            Photos are optional — you can skip this step
          </p>
        </div>
      )}

      {/* ── Step 2: Details ── */}
      {step === 2 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="field-label">Listing title</label>
            <input
              type="text" value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="e.g. Spacious 2BHK near New Bus Stand"
              className="input-field"
            />
          </div>

          <div>
            <label className="field-label">Monthly rent (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: '1rem', color: 'var(--c-muted)', pointerEvents: 'none',
              }}>₹</span>
              <input
                type="number" value={form.rent}
                onChange={e => update('rent', e.target.value)}
                placeholder="8000"
                className="input-field"
                style={{ paddingLeft: 28 }}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Property type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {TYPES.map(t => (
                <button
                  key={t} type="button" onClick={() => update('type', t)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                    border: form.type === t ? '2px solid var(--c-rust)' : '2px solid var(--c-divider)',
                    background: form.type === t ? 'rgba(181,84,28,0.06)' : 'transparent',
                    color: form.type === t ? 'var(--c-rust)' : 'var(--c-charcoal)',
                    fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Furnished status</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
              {FURNISHED.map(({ value, label, desc }) => (
                <OptionCard key={value} selected={form.furnished === value} onClick={() => update('furnished', value)} label={label} desc={desc} />
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Tenant preference</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
              {TENANTS.map(({ value, label, desc }) => (
                <OptionCard key={value} selected={form.tenant_type === value} onClick={() => update('tenant_type', value)} label={label} desc={desc} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Location & Contact ── */}
      {step === 3 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="field-label">Property area</label>
            <AreaSelector value={form.area} onChange={v => update('area', v)} placeholder="Select area in Tuticorin" />
          </div>

          <div>
            <label className="field-label">Phone number</label>
            <div style={{ display: 'flex' }}>
              <span style={{
                padding: '11px 14px', background: 'var(--c-paper)',
                border: '1.5px solid var(--c-divider)', borderRight: 'none',
                borderRadius: '10px 0 0 10px', fontSize: '0.85rem', color: 'var(--c-muted)',
                fontWeight: 500, whiteSpace: 'nowrap',
              }}>+91</span>
              <input
                type="tel" value={form.phone}
                onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="input-field"
                style={{ borderRadius: '0 10px 10px 0' }}
                inputMode="tel"
              />
            </div>
          </div>

          <div>
            <label className="field-label">
              WhatsApp number
              <span style={{ fontWeight: 400, color: 'var(--c-sand)', textTransform: 'none', letterSpacing: 0, marginLeft: 6, fontSize: '0.75rem' }}>optional</span>
            </label>
            <div style={{ display: 'flex' }}>
              <span style={{
                padding: '11px 14px', background: 'var(--c-paper)',
                border: '1.5px solid var(--c-divider)', borderRight: 'none',
                borderRadius: '10px 0 0 10px', fontSize: '0.85rem', color: 'var(--c-muted)',
                fontWeight: 500, whiteSpace: 'nowrap',
              }}>+91</span>
              <input
                type="tel" value={form.whatsapp}
                onChange={e => update('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Leave blank to use phone"
                className="input-field"
                style={{ borderRadius: '0 10px 10px 0' }}
                inputMode="tel"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary" style={{ flex: 1 }}>
            Back
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => { if (validate()) setStep(s => s + 1); }} className="btn-primary" style={{ flex: 1, padding: '13px' }}>
            Continue
          </button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-primary" style={{ flex: 1, padding: '13px' }}>
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Posting…
              </span>
            ) : 'Post listing'}
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}