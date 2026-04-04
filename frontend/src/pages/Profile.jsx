// FILE: src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AreaSelector from '../components/AreaSelector';
import BudgetSlider from '../components/BudgetSlider';
import Icon from '../components/Icons';
import { useAuth } from '../hooks/useAuth';
import { usersAPI, scoutsAPI, propertiesAPI } from '../services/api';

const ROLE_LABELS = {
  tenant:      'Tenant',
  owner:       'Property Owner',
  scout:       'Scout',
  super_admin: 'Super Admin',
};

/* ── Trust Score Panel ───────────────────────────────────────── */
function TrustScorePanel({ score, breakdown }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'High Trust' : score >= 50 ? 'Moderate' : 'Building Trust';
  const circ  = 2 * Math.PI * 22;

  return (
    <div className="card animate-fade-in" style={{ padding:'24px', marginBottom:16 }}>
      <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--c-ink)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
        <Icon.ShieldCheck size={17} color="var(--c-rust)"/> Owner Trust Score
      </h2>

      <div style={{ display:'flex', alignItems:'center', gap:24, marginBottom:20 }}>
        <svg width="72" height="72" viewBox="0 0 54 54" style={{ flexShrink:0 }}>
          <circle cx="27" cy="27" r="22" fill="none" stroke="#f3f4f6" strokeWidth="5"/>
          <circle cx="27" cy="27" r="22" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 27 27)" style={{ transition:'stroke-dasharray 1s ease' }}/>
          <text x="27" y="32" textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>{score}</text>
        </svg>
        <div>
          <p style={{ fontSize:'1.15rem', fontWeight:800, color }}>{label}</p>
          <p style={{ fontSize:'0.78rem', color:'var(--c-muted)', marginTop:2 }}>{score} / 100 points</p>
          <Link to="/my-properties" style={{ fontSize:'0.75rem', color:'var(--c-rust)', fontWeight:600, textDecoration:'none', marginTop:4, display:'inline-flex', alignItems:'center', gap:4 }}>
            View full breakdown <Icon.ArrowRight size={12} color="var(--c-rust)"/>
          </Link>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {breakdown.map((b, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'10px 12px', borderRadius:10,
            background: b.done ? 'rgba(22,163,74,0.05)' : 'var(--c-cream)',
            border:`1px solid ${b.done ? 'rgba(22,163,74,0.2)' : 'var(--c-divider)'}`,
          }}>
            {b.done
              ? <Icon.CheckCircle size={16} color="#16a34a"/>
              : <Icon.Info        size={16} color="#9ca3af"/>}
            <span style={{ flex:1, fontSize:'0.85rem', fontWeight:b.done?600:400, color:b.done?'var(--c-ink)':'var(--c-muted)' }}>
              {b.label}
            </span>
            <span style={{
              fontSize:'0.78rem', fontWeight:700,
              color: b.done?'#15803d':'#9ca3af',
              background: b.done?'rgba(22,163,74,0.1)':'#f3f4f6',
              padding:'2px 8px', borderRadius:99,
            }}>+{b.pts}pts</span>
            {!b.done && b.label === 'Phone Verified' && (
              <span style={{ fontSize:'0.68rem', color:'var(--c-rust)', fontWeight:600, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:3 }}>
                <Icon.ArrowRight size={10} color="var(--c-rust)"/> update below
              </span>
            )}
          </div>
        ))}
      </div>

      <p style={{ fontSize:'0.72rem', color:'var(--c-muted)', marginTop:12, lineHeight:1.5, display:'flex', alignItems:'flex-start', gap:6 }}>
        <Icon.Info size={12} color="var(--c-sand)" style={{ flexShrink:0, marginTop:1 }}/>
        Complete your profile below to improve your Trust Score and build credibility with tenants.
      </p>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout, fetchProfile } = useAuth();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm,    setProfileForm]    = useState({ name:'', phone:'' });
  const [savingProfile,  setSavingProfile]  = useState(false);

  const [editingPrefs, setEditingPrefs] = useState(false);
  const [savingPrefs,  setSavingPrefs]  = useState(false);
  const [prefs, setPrefs] = useState({ preferred_areas:[], budget_min:1000, budget_max:50000 });

  const [error,       setError]       = useState(null);
  const [success,     setSuccess]     = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [trustData,   setTrustData]   = useState(null);

  useEffect(() => {
    if (profile) {
      setProfileForm({ name:profile.name||'', phone:profile.phone||'' });
      setPrefs({
        preferred_areas: profile.preferred_areas || [],
        budget_min:      profile.budget_min       || 1000,
        budget_max:      profile.budget_max       || 50000,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'scout') {
      scoutsAPI.getLeaderboard().then(({ data }) => setLeaderboard(data.leaderboard||[])).catch(()=>{});
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'owner') {
      propertiesAPI.getTrustScore().then(({ data }) => setTrustData(data)).catch(()=>{});
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) { setError('Name is required'); return; }
    if (profileForm.phone && profileForm.phone.replace(/\D/g,'').length < 10) {
      setError('Phone must be at least 10 digits'); return;
    }
    setSavingProfile(true); setError(null);
    try {
      await usersAPI.updateProfile({ name:profileForm.name.trim(), phone:profileForm.phone.trim()||undefined });
      await fetchProfile();
      if (profile?.role === 'owner') {
        const { data } = await propertiesAPI.getTrustScore();
        setTrustData(data);
      }
      setSuccess('Profile updated successfully!');
      setEditingProfile(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) { setError(err.response?.data?.error || 'Failed to save profile'); }
    finally { setSavingProfile(false); }
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true); setError(null);
    try {
      await usersAPI.updatePreferences(prefs);
      await fetchProfile();
      setSuccess('Preferences saved!');
      setEditingPrefs(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSavingPrefs(false); }
  };

  if (!isAuthenticated) return (
    <div className="page-container" style={{ maxWidth:480, textAlign:'center', paddingTop:80 }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--c-paper)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
        <Icon.User size={28} color="var(--c-sand)"/>
      </div>
      <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--c-ink)', marginBottom:8 }}>Not signed in</h2>
      <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop:8 }}>Sign in</button>
    </div>
  );

  const scoutRank = leaderboard.findIndex(s => s.id === profile?.id) + 1;
  const initials  = profile?.name?.charAt(0)?.toUpperCase() || '?';
  const phoneOk   = profile?.phone && profile.phone.replace(/\D/g,'').length >= 10;

  return (
    <div className="page-container" style={{ maxWidth:540 }}>

      {/* ── Profile header card ── */}
      <div className="card" style={{ padding:'28px', marginBottom:16, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{
          width:64, height:64, borderRadius:'50%', flexShrink:0,
          background:'var(--c-rust)', color:'white',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.6rem', fontWeight:700, boxShadow:'0 6px 20px rgba(181,84,28,0.3)',
        }}>
          {initials}
        </div>

        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--c-ink)', marginBottom:3 }}>{profile?.name}</h1>
          <p style={{ fontSize:'0.8rem', color:'var(--c-muted)' }}>{ROLE_LABELS[profile?.role] || profile?.role}</p>
          {profile?.phone ? (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
              <Icon.Phone size={12} color="var(--c-sand)"/>
              <p style={{ fontSize:'0.75rem', color:'var(--c-sand)' }}>{profile.phone}</p>
              {phoneOk
                ? <span style={{ fontSize:'0.65rem', background:'rgba(22,163,74,0.1)', color:'#15803d', padding:'1px 7px', borderRadius:99, fontWeight:700 }}>Verified</span>
                : <span style={{ fontSize:'0.65rem', background:'rgba(239,68,68,0.1)', color:'#dc2626', padding:'1px 7px', borderRadius:99, fontWeight:700 }}>Incomplete</span>}
            </div>
          ) : (
            <p style={{ fontSize:'0.75rem', color:'#ef4444', marginTop:4, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
              <Icon.AlertTriangle size={13} color="#ef4444"/> No phone — add one to boost your Trust Score!
            </p>
          )}
        </div>

        <button onClick={() => { setEditingProfile(v=>!v); setError(null); }} style={{
          padding:'7px 16px', borderRadius:20, border:'1.5px solid var(--c-rust)',
          background: editingProfile?'var(--c-rust)':'transparent',
          color: editingProfile?'white':'var(--c-rust)',
          fontSize:'0.8rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s',
          display:'flex', alignItems:'center', gap:6,
        }}>
          <Icon.Edit size={13} color={editingProfile?'white':'var(--c-rust)'}/> {editingProfile?'Cancel':'Edit'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ marginBottom:14, padding:'11px 16px', borderRadius:10, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:8 }}>
          <Icon.AlertTriangle size={15} color="#dc2626"/> {error}
        </div>
      )}
      {success && (
        <div className="animate-fade-in" style={{ marginBottom:14, padding:'11px 16px', borderRadius:10, background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.2)', color:'#15803d', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:8 }}>
          <Icon.CheckCircle size={15} color="#15803d"/> {success}
        </div>
      )}

      {/* ── Edit Profile form ── */}
      {editingProfile && (
        <div className="card animate-fade-up" style={{ padding:'24px', marginBottom:16 }}>
          <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--c-ink)', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <Icon.Edit size={16} color="var(--c-rust)"/> Edit Profile
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Name */}
            <div>
              <label className="field-label">Full Name</label>
              <input className="input-field" type="text" placeholder="Your full name"
                value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name:e.target.value }))} />
            </div>

            {/* Phone */}
            <div>
              <label className="field-label" style={{ display:'flex', alignItems:'center', gap:6 }}>
                Phone Number
                {profile?.role === 'owner' && (
                  <span style={{ fontSize:'0.65rem', background:'rgba(181,84,28,0.1)', color:'var(--c-rust)', padding:'2px 8px', borderRadius:99, fontWeight:700, textTransform:'none', letterSpacing:0, display:'flex', alignItems:'center', gap:4 }}>
                    <Icon.ShieldCheck size={10} color="var(--c-rust)"/> +30 Trust Score pts
                  </span>
                )}
              </label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                  <Icon.Phone size={15} color="var(--c-muted)"/>
                </span>
                <input className="input-field" type="tel" placeholder="10-digit mobile number"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone:e.target.value.replace(/\D/g,'') }))}
                  maxLength={10} style={{ paddingLeft:36 }}/>
              </div>
              {profileForm.phone.length > 0 && profileForm.phone.length < 10 && (
                <p style={{ fontSize:'0.72rem', color:'#ef4444', marginTop:4 }}>Enter all 10 digits ({profileForm.phone.length}/10)</p>
              )}
              {profileForm.phone.length === 10 && (
                <p style={{ fontSize:'0.72rem', color:'#15803d', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
                  <Icon.CheckCircle size={11} color="#15803d"/> Valid phone number
                </p>
              )}
              {profile?.role === 'owner' && (
                <p style={{ fontSize:'0.72rem', color:'var(--c-muted)', marginTop:6, lineHeight:1.5 }}>
                  A verified phone number boosts your Owner Trust Score by <strong>+30 points</strong>, making tenants more likely to contact you.
                </p>
              )}
            </div>

            <div style={{ display:'flex', gap:10, paddingTop:4 }}>
              <button onClick={() => { setEditingProfile(false); setError(null); }} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
              <button onClick={handleSaveProfile} disabled={savingProfile || !profileForm.name.trim()} className="btn-primary" style={{ flex:2 }}>
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Owner: Trust Score ── */}
      {profile?.role === 'owner' && trustData && (
        <TrustScorePanel score={trustData.score} breakdown={trustData.breakdown} />
      )}

      {/* ── Owner: Quick links ── */}
      {profile?.role === 'owner' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          {[
            { to:'/my-properties', icon:<Icon.Building size={22} color="var(--c-rust)"/>, label:'My Properties', sub:'View analytics & promote' },
            { to:'/post-property', icon:<Icon.Plus size={22} color="var(--c-rust)"/>,    label:'Add Listing',   sub:'Post a new property' },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{
              padding:'14px 16px', borderRadius:12, background:'white',
              border:'1px solid var(--c-divider)', textDecoration:'none',
              display:'flex', alignItems:'center', gap:12,
            }}>
              {item.icon}
              <span>
                <strong style={{ display:'block', fontSize:'0.88rem', color:'var(--c-ink)' }}>{item.label}</strong>
                <span style={{ fontSize:'0.72rem', color:'var(--c-muted)' }}>{item.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Tenant: Alert Preferences ── */}
      {profile?.role === 'tenant' && (
        <div className="card" style={{ padding:'24px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--c-ink)', display:'flex', alignItems:'center', gap:8 }}>
              <Icon.Bell size={16} color="var(--c-rust)"/> Alert Preferences
            </h2>
            <button onClick={() => setEditingPrefs(!editingPrefs)} style={{
              fontSize:'0.78rem', fontWeight:700,
              color:editingPrefs?'var(--c-muted)':'var(--c-rust)',
              background:'none', border:'none', cursor:'pointer',
            }}>
              {editingPrefs ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingPrefs ? (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div>
                <label className="field-label">Preferred Areas</label>
                <AreaSelector value={prefs.preferred_areas} onChange={areas => setPrefs(p=>({...p, preferred_areas:areas}))} multiple/>
              </div>
              <div>
                <label className="field-label">Budget Range</label>
                <BudgetSlider minValue={prefs.budget_min} maxValue={prefs.budget_max}
                  onChange={({ min,max }) => setPrefs(p=>({...p, budget_min:min, budget_max:max}))}/>
              </div>
              <button onClick={handleSavePrefs} disabled={savingPrefs} className="btn-primary" style={{ padding:12 }}>
                {savingPrefs ? 'Saving…' : 'Save Preferences'}
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <p className="field-label">Watching Areas</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                  {prefs.preferred_areas.length > 0
                    ? prefs.preferred_areas.map(a => <span key={a} className="chip" style={{ background:'rgba(181,84,28,0.08)', color:'var(--c-rust)' }}>{a}</span>)
                    : <span style={{ fontSize:'0.85rem', color:'var(--c-muted)', fontStyle:'italic' }}>Not set — tap Edit to add areas</span>}
                </div>
              </div>
              <div>
                <p className="field-label">Budget Range</p>
                <p style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--c-ink)', marginTop:4 }}>
                  ₹{prefs.budget_min.toLocaleString('en-IN')} – ₹{prefs.budget_max.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Scout: Stats & Leaderboard ── */}
      {profile?.role === 'scout' && (
        <>
          <div className="card" style={{ padding:'24px', marginBottom:16 }}>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--c-ink)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Icon.Award size={16} color="var(--c-rust)"/> Your Stats
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'Total Points',     value:profile.points||0,             color:'var(--c-rust)' },
                { label:'Leaderboard Rank', value:scoutRank?`#${scoutRank}`:'—', color:'var(--c-teal)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding:'20px 16px', borderRadius:12, background:'var(--c-paper)', textAlign:'center' }}>
                  <div className="serif" style={{ fontSize:'2.2rem', color, lineHeight:1, marginBottom:4 }}>{value}</div>
                  <p style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--c-muted)', letterSpacing:'0.04em', textTransform:'uppercase' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {leaderboard.length > 0 && (
            <div className="card" style={{ padding:'24px', marginBottom:16 }}>
              <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--c-ink)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <Icon.Award size={16} color="var(--c-rust)"/> Leaderboard
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {leaderboard.map((scout, idx) => {
                  const isMe = scout.id === profile.id;
                  const rankIcon = idx === 0 ? <Icon.Award size={16} color="#f59e0b"/>
                                 : idx === 1 ? <Icon.Award size={16} color="#9ca3af"/>
                                 : idx === 2 ? <Icon.Award size={16} color="#b45309"/>
                                 : <span style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--c-muted)', width:16, textAlign:'center' }}>#{idx+1}</span>;
                  return (
                    <div key={scout.id} style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'12px 14px', borderRadius:10,
                      background:isMe?'rgba(181,84,28,0.06)':'var(--c-paper)',
                      border:isMe?'1.5px solid rgba(181,84,28,0.2)':'1.5px solid transparent',
                    }}>
                      <span style={{ flexShrink:0 }}>{rankIcon}</span>
                      <span style={{ flex:1, fontSize:'0.875rem', fontWeight:isMe?700:500, color:isMe?'var(--c-rust)':'var(--c-ink)' }}>
                        {scout.name}{isMe?' (you)':''}
                      </span>
                      <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--c-charcoal)' }}>{scout.points} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Super Admin shortcut ── */}
      {profile?.role === 'super_admin' && (
        <button onClick={() => navigate('/admin')} style={{
          width:'100%', padding:13, marginBottom:12,
          borderRadius:10, border:'1.5px solid rgba(181,84,28,0.3)',
          background:'rgba(181,84,28,0.06)', color:'var(--c-rust)',
          fontSize:'0.875rem', fontWeight:600, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          <Icon.Settings size={16} color="var(--c-rust)"/> Admin Dashboard
        </button>
      )}

      {/* ── Logout ── */}
      <button
        onClick={async () => { await logout(); navigate('/'); }}
        id="logout-btn"
        style={{
          width:'100%', padding:13, borderRadius:10,
          border:'1.5px solid #fecaca', background:'transparent',
          color:'#dc2626', fontSize:'0.875rem', fontWeight:600,
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          transition:'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >
        <Icon.LogOut size={16} color="#dc2626"/> Sign out
      </button>
    </div>
  );
}