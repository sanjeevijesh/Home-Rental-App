import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI, notificationsAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icons';

/* ── Helpers ───────────────────────────────────────────────── */
function calcEngagement(views, taps) {
  if (views === 0) return { label: 'No Data', color: '#9ca3af', score: 0 };
  const ctr = (taps / views) * 100;
  if (ctr >= 30) return { label: 'Excellent', color: '#16a34a', score: ctr };
  if (ctr >= 15) return { label: 'Good',      color: '#0ea5e9', score: ctr };
  if (ctr >= 5)  return { label: 'Fair',      color: '#f59e0b', score: ctr };
  return           { label: 'Low',           color: '#ef4444', score: ctr };
}

/* ── Shared styles ───────────────────────────────────────────── */
const overlay = {
  position:'fixed', inset:0, background:'rgba(10,8,6,0.55)', backdropFilter:'blur(4px)',
  display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20,
};
const modal = {
  background:'white', borderRadius:20, padding:'28px 28px 24px',
  width:'100%', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', overflowY:'auto',
};
const closeBtn = {
  background:'transparent', border:'none', cursor:'pointer',
  color:'var(--c-muted)', padding:4, borderRadius:6, display:'flex',
};
const statLabel = {
  fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.05em', color:'var(--c-muted)', marginBottom:4,
};
const statNum = {
  fontSize:'1.4rem', fontWeight:800, color:'var(--c-ink)', lineHeight:1, display:'block',
};

/* ── Sparkline ───────────────────────────────────────────────── */
function Sparkline({ data }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:28 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex:1, background:'var(--c-rust)', opacity:v===0?0.15:0.85,
          height:`${Math.max((v/max)*100, 8)}%`, borderRadius:'2px 2px 0 0',
        }} title={`${v} views`} />
      ))}
    </div>
  );
}

/* ── Promote Modal ───────────────────────────────────────────── */
function PromoteModal({ property, onClose }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [msg, setMsg]           = useState('');

  const PLANS = [
    { id:'3day_boost',       label:'3-Day Boost',     price:99,  days:3, desc:'Push to top of listings for 3 days' },
    { id:'homepage_feature', label:'Homepage Feature', price:199, days:7, desc:'Featured on homepage for 7 days' },
  ];

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await propertiesAPI.promote(property.id, selected);
      setMsg(data.message); setDone(true);
    } catch (e) { setMsg(e.response?.data?.error || 'Failed to send request'); }
    finally { setLoading(false); }
  };

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth:440 }} className="animate-fade-up">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--c-ink)', display:'flex', alignItems:'center', gap:8 }}>
              <Icon.Megaphone size={20} color="var(--c-rust)" /> Promote Listing
            </h2>
            <p style={{ fontSize:'0.8rem', color:'var(--c-muted)', marginTop:2 }}>{property.title}</p>
          </div>
          <button onClick={onClose} style={closeBtn}><Icon.X size={18} /></button>
        </div>

        {done ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <Icon.CheckCircle size={48} color="#16a34a" style={{ margin:'0 auto 12px' }} />
            <p style={{ color:'var(--c-ink)', fontWeight:600 }}>{msg}</p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop:20 }}>Done</button>
          </div>
        ) : (
          <>
            {property.analytics?.totalViews < 5 && (
              <div style={{ background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:'0.82rem', color:'#c2410c', display:'flex', gap:8, alignItems:'flex-start' }}>
                <Icon.Zap size={16} color="#c2410c" style={{ flexShrink:0, marginTop:1 }} />
                <span><strong>AI suggests:</strong> This listing has low views ({property.analytics.totalViews}). Promoting now can boost visibility by <strong>3–5×</strong>.</span>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              {PLANS.map(plan => (
                <button key={plan.id} onClick={() => setSelected(plan.id)} style={{
                  border:`2px solid ${selected===plan.id?'var(--c-rust)':'var(--c-divider)'}`,
                  borderRadius:12, padding:'14px 16px',
                  background: selected===plan.id?'rgba(181,84,28,0.06)':'white',
                  cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'1rem', fontWeight:700, color:'var(--c-ink)', display:'flex', alignItems:'center', gap:7 }}>
                      <Icon.Star size={16} color="var(--c-rust)" /> {plan.label}
                    </span>
                    <span style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--c-rust)' }}>₹{plan.price}</span>
                  </div>
                  <p style={{ fontSize:'0.78rem', color:'var(--c-muted)', marginTop:4 }}>{plan.desc} · {plan.days} days</p>
                </button>
              ))}
            </div>

            {msg && <p style={{ color:'var(--c-rust)', fontSize:'0.82rem', marginBottom:12 }}>{msg}</p>}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
              <button onClick={handleSubmit} className="btn-primary" style={{ flex:2 }} disabled={!selected || loading}>
                {loading ? 'Sending…' : selected ? `Request · ₹${PLANS.find(p=>p.id===selected)?.price}` : 'Choose a plan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Admin Panel Modal ───────────────────────────────────────── */
function AdminPanel({ onClose }) {
  const [type, setType]       = useState('contact_admin');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const TYPES = [
    { id:'contact_admin',     label:'Contact Admin',    icon:<Icon.MessageCircle size={15}/>, hint:'General question or feedback' },
    { id:'report_issue',      label:'Report an Issue',  icon:<Icon.Flag size={15}/>,          hint:'Listing problem or abuse' },
    { id:'request_promotion', label:'Request Promotion',icon:<Icon.Megaphone size={15}/>,     hint:'Get your listing highlighted' },
  ];

  const submit = async () => {
    if (!message.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await propertiesAPI.submitIssue({ type, message });
      setDone(true); setMessage(data.message);
    } catch(e) { setError(e.response?.data?.error || 'Failed to send'); }
    finally { setLoading(false); }
  };

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth:460 }} className="animate-fade-up">
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontSize:'1.2rem', fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
            <Icon.Shield size={18} color="var(--c-rust)" /> Admin Interaction
          </h2>
          <button onClick={onClose} style={closeBtn}><Icon.X size={18} /></button>
        </div>

        {done ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <Icon.Send size={48} color="#16a34a" style={{ margin:'0 auto 14px' }} />
            <p style={{ fontWeight:600, color:'var(--c-ink)' }}>{message}</p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop:20 }}>Got it</button>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gap:8, marginBottom:16 }}>
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)} style={{
                  padding:'10px 14px', borderRadius:10, textAlign:'left', cursor:'pointer',
                  border:`2px solid ${type===t.id?'var(--c-rust)':'var(--c-divider)'}`,
                  background: type===t.id?'rgba(181,84,28,0.05)':'white', transition:'all 0.2s',
                  display:'flex', alignItems:'center', gap:10,
                }}>
                  <span style={{ color:'var(--c-rust)' }}>{t.icon}</span>
                  <span>
                    <strong style={{ display:'block', fontSize:'0.88rem', color:'var(--c-ink)' }}>{t.label}</strong>
                    <span style={{ fontSize:'0.72rem', color:'var(--c-muted)' }}>{t.hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <textarea rows={4} className="input-field" placeholder="Describe your request in detail…"
              value={message} onChange={e => setMessage(e.target.value)}
              style={{ resize:'vertical', fontFamily:'inherit', marginBottom:12 }} />
            {error && <p style={{ color:'#ef4444', fontSize:'0.8rem', marginBottom:8 }}>{error}</p>}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
              <button onClick={submit} className="btn-primary" style={{ flex:2 }} disabled={loading || message.trim().length < 5}>
                {loading ? 'Sending…' : 'Send to Admin'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Trust Score Badge ───────────────────────────────────────── */
function TrustScore({ score, breakdown }) {
  const [expanded, setExpanded] = useState(false);
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'High Trust' : score >= 50 ? 'Moderate' : 'Building Trust';
  const circ  = 2 * Math.PI * 22;

  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid var(--c-divider)', padding:'14px 18px', cursor:'pointer' }}
      onClick={() => setExpanded(v => !v)}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--c-muted)', display:'flex', alignItems:'center', gap:6 }}>
          <Icon.ShieldCheck size={14} color="var(--c-rust)" /> Owner Trust Score
        </span>
        <span style={{ fontSize:'0.72rem', color:'var(--c-muted)', display:'flex', alignItems:'center', gap:4 }}>
          {expanded ? <Icon.ChevronUp size={13}/> : <Icon.ChevronDown size={13}/>} Details
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:8 }}>
        <svg width="54" height="54" viewBox="0 0 54 54">
          <circle cx="27" cy="27" r="22" fill="none" stroke="#f3f4f6" strokeWidth="5"/>
          <circle cx="27" cy="27" r="22" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 27 27)" style={{ transition:'stroke-dasharray 1s ease' }}/>
          <text x="27" y="32" textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>{score}</text>
        </svg>
        <div>
          <p style={{ fontWeight:700, color, fontSize:'1rem' }}>{label}</p>
          <p style={{ fontSize:'0.75rem', color:'var(--c-muted)' }}>{score}/100 points</p>
        </div>
      </div>
      {expanded && breakdown && (
        <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6 }}>
          {breakdown.map((b, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.78rem' }}>
              <span style={{ display:'flex', alignItems:'center', gap:6, color: b.done?'var(--c-ink)':'var(--c-muted)' }}>
                {b.done
                  ? <Icon.CheckCircle size={14} color="#16a34a"/>
                  : <Icon.Info size={14} color="#9ca3af"/>}
                {b.label}
              </span>
              <span style={{ fontWeight:700, color:b.done?color:'#9ca3af' }}>+{b.pts}pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Notifications Panel ─────────────────────────────────────── */
function NotificationsPanel({ onClose }) {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getMyAlerts()
      .then(({ data }) => setAlerts(data.alerts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id).catch(() => {});
    setAlerts(prev => prev.map(a => a.id===id ? { ...a, read:true } : a));
  };

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth:480, maxHeight:'80vh', display:'flex', flexDirection:'column' }} className="animate-fade-up">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:'1.2rem', fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
              <Icon.Bell size={18} color="var(--c-rust)"/> Smart Notifications
            </h2>
            {unread > 0 && <span style={{ fontSize:'0.75rem', color:'var(--c-rust)', fontWeight:600 }}>{unread} unread</span>}
          </div>
          <button onClick={onClose} style={closeBtn}><Icon.X size={18}/></button>
        </div>

        <div style={{ overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:72, borderRadius:12 }}/>)
          ) : alerts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--c-muted)' }}>
              <Icon.Mail size={36} color="var(--c-sand)" style={{ margin:'0 auto 10px' }}/>
              <p>No notifications yet</p>
            </div>
          ) : alerts.map(a => (
            <div key={a.id} onClick={() => !a.read && markRead(a.id)} style={{
              padding:'12px 14px', borderRadius:12, cursor:a.read?'default':'pointer',
              background:a.read?'var(--c-cream)':'white',
              border:`1px solid ${a.read?'var(--c-divider)':'rgba(181,84,28,0.25)'}`,
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <p style={{ fontWeight:a.read?400:600, fontSize:'0.85rem', color:'var(--c-ink)', flex:1 }}>
                  {a.title || 'New Alert'}
                </p>
                {!a.read && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--c-rust)', flexShrink:0, marginTop:4 }}/>}
              </div>
              <p style={{ fontSize:'0.78rem', color:'var(--c-muted)', marginTop:4 }}>{a.body || 'You have a new notification.'}</p>
              <p style={{ fontSize:'0.7rem', color:'var(--c-sand)', marginTop:6 }}>
                {new Date(a.notified_at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}
              </p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-secondary" style={{ marginTop:16, flexShrink:0 }}>Close</button>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function MyProperties() {
  const [properties,  setProperties]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [trustData,   setTrustData]   = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [promoteTarget,setPromoteTarget]= useState(null);
  const [showAdmin,   setShowAdmin]   = useState(false);
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [demandCache, setDemandCache] = useState({});

  useEffect(() => {
    Promise.all([
      propertiesAPI.getMine(),
      propertiesAPI.getTrustScore().catch(() => null),
      notificationsAPI.getUnreadCount().catch(() => null),
    ]).then(([propsRes, trustRes, unreadRes]) => {
      setProperties(propsRes.data.properties || []);
      if (trustRes?.data)  setTrustData(trustRes.data);
      if (unreadRes?.data) setUnreadCount(unreadRes.data.unread || 0);
    }).catch(e => setError(e.response?.data?.error || 'Failed to load properties'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const uniqueAreas = [...new Set(properties.map(p => p.area))];
    uniqueAreas.forEach(area => {
      if (!demandCache[area]) {
        propertiesAPI.getAreaDemand(area)
          .then(({ data }) => setDemandCache(prev => ({ ...prev, [area]: data })))
          .catch(() => {});
      }
    });
  }, [properties]);

  const handleStatusToggle = useCallback((id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
    propertiesAPI.updateStatus(id, newStatus)
      .then(() => setProperties(prev => prev.map(p => p.id===id ? { ...p, status:newStatus } : p)))
      .catch(e => alert(e.response?.data?.error || 'Failed to update status'));
  }, []);

  const handleDelete = useCallback((id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    propertiesAPI.delete(id)
      .then(() => setProperties(prev => prev.filter(p => p.id!==id)))
      .catch(e => alert(e.response?.data?.error || 'Failed to delete'));
  }, []);

  if (loading) return (
    <div className="page-container" style={{ maxWidth:860 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div className="skeleton" style={{ height:40, width:220, borderRadius:10 }}/>
        <div className="skeleton" style={{ height:36, width:120, borderRadius:10 }}/>
      </div>
      {[1,2].map(i => <div key={i} className="skeleton" style={{ height:220, borderRadius:16, marginBottom:20 }}/>)}
    </div>
  );

  if (error) return (
    <div className="page-container">
      <p style={{ color:'var(--c-rust)' }}>{error}</p>
    </div>
  );

  const totalViews = properties.reduce((s,p) => s+(p.analytics?.totalViews||0), 0);
  const totalTaps  = properties.reduce((s,p) => s+(p.analytics?.callTaps||0)+(p.analytics?.whatsappTaps||0), 0);

  return (
    <div className="page-container" style={{ maxWidth:860 }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="serif" style={{ fontSize:'2.2rem', color:'var(--c-ink)', lineHeight:1.1 }}>My Properties</h1>
          <p style={{ color:'var(--c-muted)', fontSize:'0.85rem', marginTop:4 }}>
            {properties.length} listing{properties.length!==1?'s':''} · {totalViews} total views · {totalTaps} contacts
          </p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <button onClick={() => setShowNotifs(true)} style={{
            position:'relative', background:'white', border:'1px solid var(--c-divider)',
            borderRadius:10, padding:'8px 14px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:6,
            fontSize:'0.82rem', color:'var(--c-charcoal)', fontWeight:600,
          }}>
            <Icon.Bell size={15} color="var(--c-charcoal)"/> Alerts
            {unreadCount > 0 && (
              <span style={{
                position:'absolute', top:-6, right:-6, background:'var(--c-rust)', color:'white',
                fontSize:'0.65rem', fontWeight:800, borderRadius:'99px', padding:'2px 5px', minWidth:18, textAlign:'center',
              }}>{unreadCount}</span>
            )}
          </button>
          <button onClick={() => setShowAdmin(true)} style={{
            background:'white', border:'1px solid var(--c-divider)', borderRadius:10,
            padding:'8px 14px', cursor:'pointer', fontSize:'0.82rem',
            color:'var(--c-charcoal)', fontWeight:600, display:'flex', alignItems:'center', gap:6,
          }}>
            <Icon.Shield size={15} color="var(--c-charcoal)"/> Contact Admin
          </button>
          <Link to="/post-property" className="btn-primary" style={{ padding:'8px 18px', fontSize:'0.85rem', display:'inline-flex', alignItems:'center', gap:6 }}>
            <Icon.Plus size={15} color="white"/> Add New
          </Link>
        </div>
      </div>

      {/* ── Trust Score + Overview ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
        {trustData && <TrustScore score={trustData.score} breakdown={trustData.breakdown} />}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--c-divider)', padding:'14px 18px' }}>
          <p style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--c-muted)', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
            <Icon.BarChart size={14} color="var(--c-muted)"/> Platform Overview
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Total Listings', value: properties.length },
              { label:'Active',         value: properties.filter(p=>p.status==='available').length },
              { label:'Total Views',    value: totalViews },
              { label:'Total Contacts', value: totalTaps },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--c-ink)' }}>{s.value}</p>
                <p style={{ fontSize:'0.7rem', color:'var(--c-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Property Cards ── */}
      {properties.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'48px 20px' }}>
          <Icon.Building size={48} color="var(--c-sand)" style={{ margin:'0 auto 14px' }}/>
          <p style={{ color:'var(--c-muted)', marginBottom:16 }}>You haven't listed any properties yet.</p>
          <Link to="/post-property" className="btn-primary" style={{ display:'inline-flex' }}>Post your first property</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {properties.map((property, idx) => {
            const a      = property.analytics || {};
            const taps   = (a.callTaps||0) + (a.whatsappTaps||0);
            const eng    = calcEngagement(a.totalViews||0, taps);
            const ctr    = a.totalViews > 0 ? ((taps/a.totalViews)*100).toFixed(1) : '0.0';
            const conv   = a.totalViews > 0 ? ((a.callTaps||0)/a.totalViews*100).toFixed(1) : '0.0';
            const demand = demandCache[property.area];
            const isLowEng = (a.totalViews||0) < 5 && (a.daysListed||0) >= 3;

            return (
              <div key={property.id} className="card animate-fade-up" style={{ padding:24, animationDelay:`${idx*0.06}s` }}>

                {/* Header */}
                <div style={{ display:'flex', gap:18, alignItems:'flex-start', marginBottom:20 }}>
                  <div style={{ width:96, height:96, borderRadius:12, overflow:'hidden', flexShrink:0, background:'var(--c-paper)' }}>
                    {property.images?.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon.Image size={32} color="var(--c-sand)"/>
                      </div>
                    )}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
                      <div>
                        <h3 style={{ fontSize:'1.15rem', fontWeight:700, color:'var(--c-ink)', marginBottom:4 }}>
                          <Link to={`/property/${property.id}`} style={{ color:'inherit', textDecoration:'none' }}>{property.title}</Link>
                        </h3>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', fontSize:'0.8rem', color:'var(--c-muted)', alignItems:'center' }}>
                          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <Icon.MapPin size={13} color="var(--c-muted)"/> {property.area}
                          </span>
                          <span>·</span>
                          <span style={{ fontWeight:700, color:'var(--c-ink)' }}>₹{property.rent.toLocaleString('en-IN')}/mo</span>
                          {property.type && <><span>·</span><span>{property.type}</span></>}
                        </div>

                        {/* Area demand badge */}
                        {demand && (
                          <span style={{
                            display:'inline-flex', alignItems:'center', gap:5, marginTop:6,
                            padding:'2px 10px', borderRadius:99, fontSize:'0.7rem', fontWeight:700,
                            background: demand.score>=70?'rgba(22,163,74,0.1)':demand.score>=20?'rgba(245,158,11,0.1)':'rgba(156,163,175,0.1)',
                            color: demand.score>=70?'#15803d':demand.score>=20?'#b45309':'#6b7280',
                            border:`1px solid ${demand.score>=70?'rgba(22,163,74,0.3)':demand.score>=20?'rgba(245,158,11,0.3)':'rgba(156,163,175,0.3)'}`,
                          }}>
                            {demand.score>=70
                              ? <Icon.Flame size={11} color="#15803d"/>
                              : demand.score>=20
                                ? <Icon.TrendingUp size={11} color="#b45309"/>
                                : <Icon.Activity size={11} color="#6b7280"/>}
                            Demand {demand.label} in {property.area}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                        <StatusBadge status={property.status} createdAt={property.created_at}/>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <button onClick={() => setPromoteTarget(property)} style={{
                            display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px',
                            background:'linear-gradient(135deg,#f97316,#b5541c)', color:'white',
                            border:'none', borderRadius:20, cursor:'pointer', fontSize:'0.72rem', fontWeight:700,
                            boxShadow:'0 2px 8px rgba(181,84,28,0.35)',
                          }}>
                            <Icon.Megaphone size={12} color="white"/> Promote
                          </button>
                          <button onClick={() => handleDelete(property.id, property.title)} style={{
                            padding:6, borderRadius:'50%', background:'transparent',
                            border:'1px solid transparent', cursor:'pointer',
                            color:'var(--c-rust)', display:'flex', transition:'all 0.2s',
                          }} title="Delete">
                            <Icon.Trash size={15}/>
                          </button>
                          <button onClick={() => handleStatusToggle(property.id, property.status)} className="btn-secondary" style={{ padding:'5px 12px', fontSize:'0.72rem', borderRadius:20 }}>
                            {property.status==='available' ? 'Mark Occupied' : 'Mark Available'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Advanced Analytics Grid ── */}
                <div style={{
                  display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:0,
                  background:'var(--c-cream)', borderRadius:12, border:'1px solid var(--c-divider)', overflow:'hidden',
                }}>
                  {/* Views + sparkline */}
                  <div style={{ padding:'14px 16px' }}>
                    <p style={{ ...statLabel, display:'flex', alignItems:'center', gap:4 }}>
                      <Icon.Eye size={12} color="var(--c-muted)"/> 7-Day Views
                    </p>
                    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
                      <span style={statNum}>{a.totalViews||0}</span>
                      <div style={{ width:'45%' }}><Sparkline data={a.viewSparkline||[0,0,0,0,0,0,0]}/></div>
                    </div>
                  </div>

                  {/* CTR */}
                  <div style={{ padding:'14px 16px', borderLeft:'1px solid var(--c-divider)' }}>
                    <p style={{ ...statLabel, display:'flex', alignItems:'center', gap:4 }}>
                      <Icon.BarChart size={12} color="var(--c-muted)"/> Click-Through
                    </p>
                    <span style={statNum}>{ctr}%</span>
                    <p style={{ fontSize:'0.65rem', color:'var(--c-muted)', marginTop:2 }}>{a.totalViews||0} views · {taps} contacts</p>
                  </div>

                  {/* Conversion */}
                  <div style={{ padding:'14px 16px', borderLeft:'1px solid var(--c-divider)' }}>
                    <p style={{ ...statLabel, display:'flex', alignItems:'center', gap:4 }}>
                      <Icon.Phone size={12} color="var(--c-muted)"/> Call Conv.
                    </p>
                    <span style={statNum}>{conv}%</span>
                    <p style={{ fontSize:'0.65rem', color:'var(--c-muted)', marginTop:2 }}>{a.callTaps||0} calls / {a.totalViews||0} views</p>
                  </div>

                  {/* Engagement */}
                  <div style={{ padding:'14px 16px', borderLeft:'1px solid var(--c-divider)' }}>
                    <p style={{ ...statLabel, display:'flex', alignItems:'center', gap:4 }}>
                      <Icon.Zap size={12} color="var(--c-muted)"/> Engagement
                    </p>
                    <span style={{ ...statNum, color:eng.color }}>{eng.label}</span>
                    <p style={{ fontSize:'0.65rem', color:'var(--c-muted)', marginTop:2 }}>{eng.score.toFixed(1)}% CTR</p>
                  </div>

                  {/* Contacts */}
                  <div style={{ padding:'14px 16px', borderLeft:'1px solid var(--c-divider)' }}>
                    <p style={{ ...statLabel, display:'flex', alignItems:'center', gap:4 }}>
                      <Icon.Phone size={12} color="var(--c-muted)"/> Contacts
                    </p>
                    <div style={{ display:'flex', gap:12, marginTop:4 }}>
                      <div>
                        <span style={statNum}>{a.callTaps||0}</span>
                        <p style={{ fontSize:'0.65rem', color:'var(--c-muted)' }}>Calls</p>
                      </div>
                      <div>
                        <span style={statNum}>{a.whatsappTaps||0}</span>
                        <p style={{ fontSize:'0.65rem', color:'#16a34a' }}>WhatsApp</p>
                      </div>
                    </div>
                  </div>

                  {/* Days listed */}
                  <div style={{ padding:'14px 16px', borderLeft:'1px solid var(--c-divider)' }}>
                    <p style={{ ...statLabel, display:'flex', alignItems:'center', gap:4 }}>
                      <Icon.Calendar size={12} color="var(--c-muted)"/> Days Listed
                    </p>
                    <span style={statNum}>{a.daysListed||0}</span>
                  </div>
                </div>

                {/* AI Insight strip */}
                {isLowEng && (
                  <div style={{
                    marginTop:12, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.25)',
                    borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12,
                  }}>
                    <span style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'#c2410c', fontWeight:500 }}>
                      <Icon.Zap size={15} color="#c2410c" style={{ flexShrink:0 }}/>
                      <span><strong>AI Insight:</strong> {a.totalViews} views → {taps} contacts → low engagement. Promote to boost visibility.</span>
                    </span>
                    <button onClick={() => setPromoteTarget(property)} style={{
                      padding:'6px 14px', background:'var(--c-rust)', color:'white',
                      border:'none', borderRadius:20, cursor:'pointer', fontSize:'0.75rem', fontWeight:700, whiteSpace:'nowrap',
                    }}>Promote Now</button>
                  </div>
                )}

                {/* 60-day renewal prompt */}
                {(a.daysListed||0) > 60 && property.status==='available' && (
                  <div style={{
                    marginTop:12, background:'rgba(239,131,84,0.08)', border:'1px solid rgba(239,131,84,0.25)',
                    padding:'10px 16px', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                    <span style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.82rem', color:'var(--c-rust)', fontWeight:500 }}>
                      <Icon.Calendar size={15} color="var(--c-rust)"/> This listing is over 60 days old. Still available?
                    </span>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => handleStatusToggle(property.id, 'available')} className="btn-secondary" style={{ padding:'5px 12px', fontSize:'0.75rem' }}>No, occupied</button>
                      <button onClick={() => propertiesAPI.updateStatus(property.id,'available').catch(()=>{})} className="btn-primary" style={{ padding:'5px 12px', fontSize:'0.75rem' }}>Yes, renew</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {promoteTarget && <PromoteModal property={promoteTarget} onClose={() => setPromoteTarget(null)} />}
      {showAdmin     && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showNotifs    && <NotificationsPanel onClose={() => { setShowNotifs(false); setUnreadCount(0); }} />}
    </div>
  );
}
