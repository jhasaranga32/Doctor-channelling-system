import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Google Fonts injected once ─── */
const injectFonts = () => {
  if (document.getElementById('landing-fonts')) return;
  const link = document.createElement('link');
  link.id = 'landing-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(link);
};

/* ─── Doctors data ─── */
const DOCTORS = [
  { name: 'Dr. Priya Fernando', spec: 'Cardiologist', exp: '12 Years', fee: 'LKR 2,500', emoji: '🫀', color: '#e53935' },
  { name: 'Dr. Rahal Perera',   spec: 'Neurologist',  exp: '8 Years',  fee: 'LKR 3,000', emoji: '🧠', color: '#1565c0' },
  { name: 'Dr. Sithum Dias',    spec: 'Pediatrician', exp: '15 Years', fee: 'LKR 2,000', emoji: '👶', color: '#2e7d32' },
  { name: 'Dr. Amali Wijesinghe', spec: 'Dermatologist', exp: '10 Years', fee: 'LKR 2,200', emoji: '🌿', color: '#6a1b9a' },
];

const SERVICES = [
  { icon: '🫀', title: 'Cardiology',     desc: 'Advanced heart care with state-of-the-art diagnostics and treatment plans.' },
  { icon: '🧠', title: 'Neurology',      desc: 'Expert neurological care for brain, spine and nervous system conditions.' },
  { icon: '🦷', title: 'Dental Care',    desc: 'Complete dental solutions from routine cleaning to cosmetic procedures.' },
  { icon: '👁️', title: 'Ophthalmology', desc: 'Comprehensive eye care, vision correction and surgical interventions.' },
  { icon: '🦴', title: 'Orthopedics',   desc: 'Bone, joint and muscle health with minimally invasive procedures.' },
  { icon: '👶', title: 'Pediatrics',     desc: 'Compassionate and expert care for children from birth to adolescence.' },
];

const STATS = [
  { value: '15,000+', label: 'Patients Served' },
  { value: '50+',     label: 'Expert Doctors' },
  { value: '25+',     label: 'Specialties' },
  { value: '98%',     label: 'Patient Satisfaction' },
];

const TESTIMONIALS = [
  { name: 'Samanthi K.', role: 'Patient', text: 'Booking my appointment online was effortless. The doctors are incredibly skilled and the staff very welcoming. MediChannel changed how I think about healthcare.' },
  { name: 'Ruwan P.',    role: 'Patient', text: 'I was seen promptly, the cardiologist explained everything clearly and the follow-up care was excellent. Highly recommend this platform to all.' },
  { name: 'Nilmini S.', role: 'Patient', text: 'The paediatric team treated my daughter with so much patience and warmth. I felt reassured every step of the way. Five stars!' },
];

/* ─── Keyframe CSS ─── */
const CSS = `
@keyframes fadeUp   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes pulse    { 0%,100%{transform:scale(1);}  50%{transform:scale(1.05);} }
@keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
@keyframes shimmer  { 0%{background-position:200% center;} 100%{background-position:-200% center;} }
@keyframes scrollDown { 0%{transform:translateY(0);opacity:1;} 100%{transform:translateY(10px);opacity:0;} }
@keyframes dropIn   { from{opacity:0;transform:translateY(-10px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }

.nav-link { position:relative; }
.nav-link::after {
  content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px;
  background:#14b8a6; transition:width 0.3s ease;
}
.nav-link:hover::after, .nav-link.active::after { width:100%; }

.service-card:hover { transform:translateY(-8px); box-shadow:0 24px 48px rgba(0,80,70,0.15) !important; }
.doctor-card:hover  { transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,0.12) !important; }
.stat-card:hover    { transform:scale(1.05); }

.btn-primary:hover  { transform:translateY(-2px); box-shadow:0 12px 28px rgba(20,184,166,0.45) !important; }
.btn-outline:hover  { background:#14b8a6 !important; color:#fff !important; transform:translateY(-2px); }
.btn-white:hover    { background:#f0fdfa !important; transform:translateY(-2px); }

.testimonial-card:hover { box-shadow:0 20px 40px rgba(0,0,0,0.08) !important; }
.profile-menu-item:hover { background:#f0fdfa !important; color:#0d9488 !important; }

input:focus, textarea:focus, select:focus {
  outline:none; border-color:#14b8a6 !important; box-shadow:0 0 0 3px rgba(20,184,166,0.15);
}

html { scroll-behavior:smooth; }
`;

/* ══════════════════════════════════════════
   USER AVATAR — shows initials or profile photo
══════════════════════════════════════════ */
function UserAvatar({ user, size = 36 }) {
  const name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || '?';
  const initials = name
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const palette = ['#0d9488','#0891b2','#7c3aed','#db2777','#ea580c','#16a34a'];
  const colorIdx = (name || '').charCodeAt(0) % palette.length;
  const bg  = palette[colorIdx];
  const bg2 = palette[(colorIdx + 2) % palette.length];

  if (user.profilePic) {
    return (
      <img src={user.profilePic} alt={name}
        style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover',
          border:'2px solid #14b8a6', flexShrink:0 }} />
    );
  }
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`linear-gradient(135deg,${bg},${bg2})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#fff', fontWeight:800, fontSize:size * 0.36,
      fontFamily:"'DM Sans',sans-serif", border:'2px solid rgba(255,255,255,0.25)',
    }}>{initials}</div>
  );
}

/* ══════════════════════════════════════════
   PROFILE DROPDOWN
══════════════════════════════════════════ */
function ProfileDropdown({ user, navScrolled, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Patient';

  const menuItems = [
    { icon:'👤', label:'My Profile',      path:'/patient/profile' },
    { icon:'📅', label:'My Appointments', path:'/patient/appointments' },
    { icon:'📋', label:'Health Records',  path:'/patient/records' },
    { icon:'⚙️', label:'Settings',        path:'/patient/settings' },
  ];

  return (
    <div ref={ref} style={{ position:'relative' }}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:'0.55rem',
          padding:'0.28rem 0.85rem 0.28rem 0.28rem', borderRadius:50,
          border: navScrolled ? '1.5px solid #99f6e4' : '1.5px solid rgba(255,255,255,0.3)',
          background: navScrolled ? '#f0fdfa' : 'rgba(255,255,255,0.12)',
          cursor:'pointer', transition:'all 0.25s',
        }}
      >
        <UserAvatar user={user} size={34} />
        <div style={{ lineHeight:1.25, textAlign:'left' }}>
          <div style={{
            fontWeight:700, fontSize:'0.8rem',
            color: navScrolled ? '#0f172a' : '#fff',
            maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>
            {(fullName || 'Patient').split(' ')[0]}
          </div>
          <div style={{ fontSize:'0.62rem', color: navScrolled ? '#0d9488' : 'rgba(255,255,255,0.65)' }}>
            Patient
          </div>
        </div>
        <span style={{
          fontSize:'0.55rem', marginLeft:2,
          color: navScrolled ? '#94a3b8' : 'rgba(255,255,255,0.55)',
          display:'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition:'transform 0.2s',
        }}>▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 12px)', right:0, width:268,
          background:'#fff', borderRadius:18, zIndex:2000,
          boxShadow:'0 20px 60px rgba(0,0,0,0.14)', border:'1px solid #e2e8f0',
          overflow:'hidden', animation:'dropIn 0.2s ease both',
        }}>
          {/* User header */}
          <div style={{
            padding:'1.2rem', display:'flex', alignItems:'center', gap:'0.85rem',
            background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)',
            borderBottom:'1px solid #e2e8f0',
          }}>
            <UserAvatar user={user} size={48} />
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.92rem',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {fullName}
              </div>
              <div style={{ color:'#64748b', fontSize:'0.72rem', marginTop:2,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user.email}
              </div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:4, marginTop:5,
                background:'#0d9488', borderRadius:50, padding:'0.14rem 0.55rem',
              }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#4ade80', display:'inline-block' }}/>
                <span style={{ color:'#fff', fontSize:'0.6rem', fontWeight:700 }}>ACTIVE PATIENT</span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div style={{ padding:'0.4rem' }}>
            {menuItems.map(item => (
              <button key={item.label}
                className="profile-menu-item"
                onClick={() => { navigate(item.path); setOpen(false); }}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:'0.7rem',
                  padding:'0.65rem 0.85rem', border:'none', background:'none',
                  cursor:'pointer', borderRadius:10, color:'#334155',
                  fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', fontWeight:500,
                  transition:'background 0.15s, color 0.15s', textAlign:'left',
                }}>
                <span style={{ width:22, textAlign:'center', fontSize:'1rem' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div style={{ borderTop:'1px solid #e2e8f0', padding:'0.4rem' }}>
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:'0.7rem',
                padding:'0.65rem 0.85rem', border:'none', background:'none',
                cursor:'pointer', borderRadius:10, color:'#ef4444',
                fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', fontWeight:600,
                transition:'background 0.15s', textAlign:'left',
              }}
              onMouseOver={e => e.currentTarget.style.background='#fef2f2'}
              onMouseOut={e  => e.currentTarget.style.background='none'}
            >
              <span style={{ width:22, textAlign:'center', fontSize:'1rem' }}>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [navScrolled,   setNavScrolled]   = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [formData,      setFormData]      = useState({ name:'', email:'', phone:'', doctor:'', date:'', message:'' });
  const [contactForm,   setContactForm]   = useState({ name:'', email:'', subject:'', message:'' });
  const [submitted,     setSubmitted]     = useState(false);
  const [contactSent,   setContactSent]   = useState(false);
  const [testIdx,       setTestIdx]       = useState(0);

  useEffect(() => {
    injectFonts();
    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 60);
      const sections = ['home','about','services','doctors','appointment','contact'];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) { setActiveSection(id); break; }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTestIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  };

  const handleAppt = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name:'', email:'', phone:'', doctor:'', date:'', message:'' });
  };

  const handleContact = (e) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => setContactSent(false), 4000);
    setContactForm({ name:'', email:'', subject:'', message:'' });
  };

  const NAV_LINKS = [
    { id:'home',     label:'Home' },
    { id:'about',    label:'About Us' },
    { id:'services', label:'Services' },
    { id:'doctors',  label:'Doctors' },
    { id:'contact',  label:'Contact Us' },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", color:'#1e293b', overflowX:'hidden' }}>

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:1000,
        background: navScrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(12px)' : 'none',
        boxShadow: navScrolled ? '0 2px 24px rgba(0,0,0,0.08)' : 'none',
        transition:'all 0.35s ease',
        padding: navScrolled ? '0.75rem 0' : '1.25rem 0',
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer' }} onClick={() => scrollTo('home')}>
            <div style={{
              width:42, height:42, borderRadius:12,
              background:'linear-gradient(135deg,#0d9488,#14b8a6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.2rem', boxShadow:'0 4px 12px rgba(20,184,166,0.35)',
            }}>🏥</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.2rem', color: navScrolled?'#0f172a':'#fff', lineHeight:1 }}>MediChannel</div>
              <div style={{ fontSize:'0.65rem', color: navScrolled?'#14b8a6':'rgba(255,255,255,0.8)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Healthcare Platform</div>
            </div>
          </div>

          {/* Desktop links */}
          <div style={{ display:'flex', gap:'2rem', alignItems:'center' }} className="desktop-nav">
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className={`nav-link ${activeSection===l.id?'active':''}`}
                style={{
                  background:'none', border:'none', cursor:'pointer', padding:'0.25rem 0',
                  fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:'0.9rem',
                  color: navScrolled ? (activeSection===l.id?'#0d9488':'#334155') : 'rgba(255,255,255,0.9)',
                  transition:'color 0.2s',
                }}>
                {l.label}
              </button>
            ))}

            {/* ── Show profile dropdown if logged in, else Sign In button ── */}
            {user ? (
              <ProfileDropdown user={user} navScrolled={navScrolled} onLogout={logout} />
            ) : (
              <Link to="/login" style={{
                padding:'0.55rem 1.4rem', borderRadius:50,
                background:'linear-gradient(135deg,#0d9488,#14b8a6)',
                color:'#fff', textDecoration:'none', fontWeight:600, fontSize:'0.875rem',
                boxShadow:'0 4px 14px rgba(20,184,166,0.4)', transition:'all 0.25s',
              }} className="btn-primary">Sign In</Link>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(o=>!o)} style={{
            display:'none', background:'none', border:'none', cursor:'pointer',
            fontSize:'1.5rem', color: navScrolled?'#1e293b':'#fff',
          }} id="hamburger">☰</button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            background:'#fff', padding:'1rem 2rem 1.5rem', borderTop:'1px solid #e2e8f0',
            display:'flex', flexDirection:'column', gap:'1rem',
          }}>
            {/* Mobile: show user card if logged in */}
            {user && (
              <div style={{
                display:'flex', alignItems:'center', gap:'0.85rem',
                padding:'0.85rem 1rem', background:'#f0fdfa',
                border:'1px solid #99f6e4', borderRadius:14, marginBottom:'0.25rem',
              }}>
                <UserAvatar user={user} size={42} />
                <div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}</div>
                  <div style={{ color:'#0d9488', fontSize:'0.75rem' }}>{user.email}</div>
                </div>
              </div>
            )}
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                style={{ background:'none', border:'none', cursor:'pointer', textAlign:'left', fontWeight:600, color:'#334155', fontSize:'1rem', padding:'0.5rem 0' }}>
                {l.label}
              </button>
            ))}
            {user ? (
              <>
                <button onClick={() => { navigate('/patient/profile'); setMenuOpen(false); }}
                  style={{ padding:'0.7rem', background:'#f0fdfa', color:'#0d9488', border:'1px solid #99f6e4', borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  👤 My Profile
                </button>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ padding:'0.7rem', background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                style={{ padding:'0.7rem', background:'#14b8a6', color:'#fff', borderRadius:10, textAlign:'center', textDecoration:'none', fontWeight:700 }}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section id="home" style={{
        minHeight:'100vh', position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg, #0f4c45 0%, #0d6e63 40%, #0a5a50 70%, #0f3d38 100%)',
        display:'flex', alignItems:'center',
      }}>
        {[
          { w:500, h:500, top:'-150px', right:'-100px', op:0.06 },
          { w:300, h:300, bottom:'50px', left:'-80px',  op:0.05 },
          { w:200, h:200, top:'40%',    right:'15%',    op:0.04 },
        ].map((c,i) => (
          <div key={i} style={{
            position:'absolute', width:c.w, height:c.h, borderRadius:'50%',
            border:`2px solid rgba(255,255,255,${c.op})`,
            top:c.top, bottom:c.bottom, left:c.left, right:c.right, pointerEvents:'none',
          }}/>
        ))}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
          backgroundSize:'60px 60px',
        }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'8rem 2rem 5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center', width:'100%' }}>
          <div style={{ animation:'fadeUp 0.9s ease both' }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'0.5rem',
              background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:50, padding:'0.4rem 1rem', marginBottom:'1.5rem',
            }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 2s infinite' }}/>
              <span style={{ color:'rgba(255,255,255,0.9)', fontSize:'0.8rem', fontWeight:500, letterSpacing:'0.05em' }}>NOW ACCEPTING NEW PATIENTS</span>
            </div>

            {/* Personalised welcome if logged in */}
            {user && (
              <div style={{
                display:'inline-flex', alignItems:'center', gap:'0.75rem',
                background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.35)',
                borderRadius:14, padding:'0.6rem 1.1rem', marginBottom:'1.25rem',
              }}>
                <UserAvatar user={user} size={30} />
                <span style={{ color:'#4ade80', fontWeight:600, fontSize:'0.9rem' }}>
                  Welcome back, {(user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Patient').split(' ')[0]}! 👋
                </span>
              </div>
            )}

            <h1 style={{
              fontFamily:"'Playfair Display',serif", fontSize:'3.8rem', fontWeight:900,
              color:'#fff', lineHeight:1.1, marginBottom:'1.5rem',
            }}>
              Your Health,<br/>
              <span style={{
                background:'linear-gradient(90deg,#4ade80,#14b8a6,#4ade80)',
                backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                animation:'shimmer 3s linear infinite',
              }}>Our Priority.</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1.1rem', lineHeight:1.8, marginBottom:'2.5rem', maxWidth:480 }}>
              Sri Lanka's most trusted online doctor channelling platform. Book appointments with top specialists, manage your health records, and receive world-class care — all from one place.
            </p>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <button onClick={() => scrollTo('appointment')} className="btn-primary" style={{
                padding:'0.9rem 2rem', borderRadius:50, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#14b8a6,#0d9488)',
                color:'#fff', fontWeight:700, fontSize:'1rem',
                boxShadow:'0 8px 24px rgba(20,184,166,0.5)', transition:'all 0.25s',
                fontFamily:"'DM Sans',sans-serif",
              }}>Book Appointment →</button>
              <button onClick={() => scrollTo('about')} className="btn-outline" style={{
                padding:'0.9rem 2rem', borderRadius:50,
                border:'2px solid rgba(255,255,255,0.4)', background:'transparent',
                color:'#fff', fontWeight:600, fontSize:'1rem', cursor:'pointer',
                transition:'all 0.25s', fontFamily:"'DM Sans',sans-serif",
              }}>Learn More</button>
            </div>

            <div style={{ display:'flex', gap:'2rem', marginTop:'3rem', paddingTop:'2rem', borderTop:'1px solid rgba(255,255,255,0.15)' }}>
              {[['15K+','Patients'],['50+','Doctors'],['98%','Satisfaction']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', fontWeight:700, color:'#4ade80' }}>{v}</div>
                  <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.8rem' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ animation:'fadeUp 0.9s 0.2s ease both', display:'flex', justifyContent:'center' }}>
            <div style={{
              background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:24, padding:'2rem', backdropFilter:'blur(10px)',
              maxWidth:380, width:'100%', animation:'float 5s ease-in-out infinite',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <span style={{ color:'rgba(255,255,255,0.9)', fontWeight:700, fontSize:'1rem' }}>Next Available Doctors</span>
                <span style={{ background:'#4ade80', color:'#0f4c45', fontSize:'0.7rem', fontWeight:700, borderRadius:50, padding:'0.2rem 0.7rem' }}>LIVE</span>
              </div>
              {DOCTORS.slice(0,3).map((d,i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:'1rem',
                  background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'0.85rem 1rem',
                  marginBottom:'0.75rem', cursor:'pointer', transition:'background 0.2s',
                }}>
                  <div style={{
                    width:44, height:44, borderRadius:12,
                    background:`${d.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem',
                  }}>{d.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#fff', fontWeight:600, fontSize:'0.85rem' }}>{d.name}</div>
                    <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.75rem' }}>{d.spec}</div>
                  </div>
                  <div style={{ color:'#4ade80', fontSize:'0.75rem', fontWeight:600 }}>{d.fee}</div>
                </div>
              ))}
              <button onClick={() => scrollTo('appointment')} style={{
                width:'100%', marginTop:'0.5rem', padding:'0.8rem',
                background:'linear-gradient(135deg,#14b8a6,#0d9488)', border:'none',
                borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'0.9rem',
              }}>Book Now →</button>
            </div>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:'2rem', left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.75rem', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>SCROLL</div>
          <div style={{ width:2, height:30, background:'linear-gradient(#14b8a6,transparent)', margin:'0 auto', animation:'scrollDown 1.5s ease infinite' }}/>
        </div>
      </section>

      {/* ══════════════ STATS BAND ══════════════ */}
      <section style={{ background:'#fff', padding:'3rem 2rem', borderBottom:'1px solid #f1f5f9' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
          {STATS.map(s => (
            <div key={s.label} className="stat-card" style={{
              textAlign:'center', padding:'1.5rem', borderRadius:16,
              background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)',
              transition:'transform 0.25s',
            }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.2rem', fontWeight:800, color:'#0d9488' }}>{s.value}</div>
              <div style={{ color:'#475569', fontSize:'0.875rem', fontWeight:500, marginTop:'0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ ABOUT US ══════════════ */}
      <section id="about" style={{ padding:'6rem 2rem', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <div style={{
              borderRadius:24, overflow:'hidden',
              background:'linear-gradient(135deg,#0d6e63,#14b8a6)',
              padding:'3rem', minHeight:400,
              display:'flex', flexDirection:'column', justifyContent:'space-between',
            }}>
              <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🏥</div>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', fontWeight:700, color:'#fff', marginBottom:'1rem' }}>
                  Established in 2010
                </div>
                <p style={{ color:'rgba(255,255,255,0.8)', lineHeight:1.8, fontSize:'0.95rem' }}>
                  MediChannel Hospital has been at the forefront of healthcare in Sri Lanka for over 14 years, serving communities across the island with compassion and clinical excellence.
                </p>
              </div>
              <div style={{ display:'flex', gap:'1rem', marginTop:'2rem' }}>
                {[['🏆','ISO Certified'],['🌟','Award Winning'],['🇱🇰','Sri Lanka No.1']].map(([icon,label]) => (
                  <div key={label} style={{
                    flex:1, background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'0.75rem',
                    textAlign:'center', border:'1px solid rgba(255,255,255,0.2)',
                  }}>
                    <div style={{ fontSize:'1.2rem' }}>{icon}</div>
                    <div style={{ color:'rgba(255,255,255,0.9)', fontSize:'0.7rem', fontWeight:600, marginTop:'0.25rem' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              position:'absolute', top:-20, right:-20,
              background:'#fff', borderRadius:16, padding:'1rem 1.25rem',
              boxShadow:'0 10px 30px rgba(0,0,0,0.1)', textAlign:'center',
            }}>
              <div style={{ fontSize:'1.75rem' }}>⭐</div>
              <div style={{ fontWeight:800, color:'#0d9488', fontSize:'1.2rem' }}>4.9/5</div>
              <div style={{ color:'#64748b', fontSize:'0.7rem' }}>Patient Rating</div>
            </div>
          </div>

          <div>
            <div style={{ color:'#14b8a6', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1rem' }}>— ABOUT US</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.8rem', fontWeight:800, color:'#0f172a', lineHeight:1.15, marginBottom:'1.5rem' }}>
              Compassionate Care,<br/>
              <span style={{ color:'#0d9488' }}>Modern Medicine.</span>
            </h2>
            <p style={{ color:'#475569', lineHeight:1.9, fontSize:'1rem', marginBottom:'1.5rem' }}>
              At MediChannel Hospital, we believe exceptional healthcare begins with understanding each patient as an individual. Our multidisciplinary team of over 50 specialists works together to provide personalised, evidence-based treatment plans.
            </p>
            <p style={{ color:'#475569', lineHeight:1.9, fontSize:'1rem', marginBottom:'2rem' }}>
              From routine check-ups to complex surgical procedures, our facility is equipped with the latest medical technology to ensure accurate diagnosis and effective treatment across all specialties.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2rem' }}>
              {[
                'State-of-the-art diagnostic equipment and operating theatres',
                '24/7 emergency services and intensive care units',
                'Online appointment booking with real-time availability',
                'Digital health records accessible anytime, anywhere',
              ].map(item => (
                <div key={item} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                  <div style={{
                    width:22, height:22, borderRadius:'50%', background:'#ccfbf1',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.7rem', color:'#0d9488', fontWeight:900, flexShrink:0, marginTop:2,
                  }}>✓</div>
                  <span style={{ color:'#334155', fontSize:'0.95rem', lineHeight:1.6 }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={() => scrollTo('appointment')} className="btn-primary" style={{
              padding:'0.85rem 2rem', borderRadius:50, border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#0d9488,#14b8a6)', color:'#fff',
              fontWeight:700, fontSize:'0.95rem', boxShadow:'0 8px 20px rgba(13,148,136,0.35)',
              transition:'all 0.25s', fontFamily:"'DM Sans',sans-serif",
            }}>Book an Appointment →</button>
          </div>
        </div>
      </section>

      {/* ══════════════ SERVICES ══════════════ */}
      <section id="services" style={{ padding:'6rem 2rem', background:'#f8fafc' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'4rem' }}>
            <div style={{ color:'#14b8a6', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1rem' }}>— OUR SERVICES</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.8rem', fontWeight:800, color:'#0f172a', marginBottom:'1rem' }}>
              Comprehensive Healthcare<br/>Under One Roof
            </h2>
            <p style={{ color:'#64748b', fontSize:'1rem', maxWidth:560, margin:'0 auto', lineHeight:1.8 }}>
              We offer a wide spectrum of medical specialties with world-class facilities, ensuring every patient receives the highest standard of care.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>
            {SERVICES.map((s,i) => (
              <div key={i} className="service-card" style={{
                background:'#fff', borderRadius:20, padding:'2rem',
                boxShadow:'0 4px 16px rgba(0,0,0,0.06)',
                transition:'transform 0.3s, box-shadow 0.3s', cursor:'pointer',
                borderBottom:'3px solid transparent',
                borderImage:'linear-gradient(135deg,#14b8a6,#0d9488) 1',
              }}>
                <div style={{
                  width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem', marginBottom:'1.25rem',
                }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'#0f172a', marginBottom:'0.75rem' }}>{s.title}</h3>
                <p style={{ color:'#64748b', fontSize:'0.9rem', lineHeight:1.75 }}>{s.desc}</p>
                <div style={{ marginTop:'1.25rem', color:'#0d9488', fontSize:'0.85rem', fontWeight:700, display:'flex', alignItems:'center', gap:'0.25rem' }}>
                  Learn more <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ DOCTORS ══════════════ */}
      <section id="doctors" style={{ padding:'6rem 2rem', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'4rem' }}>
            <div style={{ color:'#14b8a6', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1rem' }}>— MEET OUR TEAM</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.8rem', fontWeight:800, color:'#0f172a', marginBottom:'1rem' }}>
              Expert Doctors,<br/>Exceptional Care
            </h2>
            <p style={{ color:'#64748b', fontSize:'1rem', maxWidth:560, margin:'0 auto', lineHeight:1.8 }}>
              Our team of nationally recognised specialists brings decades of clinical experience across every major medical field. Each doctor is carefully selected for their expertise, compassion, and commitment to delivering outstanding patient outcomes.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem', marginBottom:'3rem' }}>
            {DOCTORS.slice(0,3).map((d,i) => (
              <div key={i} className="doctor-card" style={{
                background:'#fff', borderRadius:20, overflow:'hidden',
                boxShadow:'0 4px 16px rgba(0,0,0,0.07)',
                transition:'transform 0.3s, box-shadow 0.3s',
              }}>
                <div style={{
                  height:160, background:`linear-gradient(135deg,${d.color}22,${d.color}44)`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.5rem',
                }}>{d.emoji}</div>
                <div style={{ padding:'1.25rem' }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, color:'#0f172a', marginBottom:'0.3rem' }}>{d.name}</h3>
                  <div style={{ color:'#0d9488', fontSize:'0.8rem', fontWeight:600, marginBottom:'0.75rem' }}>{d.spec}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#64748b', marginBottom:'1rem' }}>
                    <span>🎓 {d.exp}</span>
                    <span style={{ color:'#0d9488', fontWeight:700 }}>{d.fee}</span>
                  </div>
                  <button onClick={() => scrollTo('appointment')} style={{
                    width:'100%', padding:'0.6rem', borderRadius:10,
                    background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)',
                    border:'1px solid #99f6e4', color:'#0d9488',
                    fontWeight:700, cursor:'pointer', fontSize:'0.8rem',
                    fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s',
                  }}>Book Appointment</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background:'linear-gradient(135deg,#0f4c45,#0d6e63)',
            borderRadius:24, padding:'3rem', display:'flex',
            alignItems:'center', justifyContent:'space-between',
            flexWrap:'wrap', gap:'2rem',
          }}>
            <div>
              <div style={{ color:'#4ade80', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
                50+ Specialists Available
              </div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', fontWeight:800, color:'#fff', marginBottom:'0.75rem', lineHeight:1.2 }}>
                Find the Right Doctor<br/>for Your Needs
              </h3>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.95rem', lineHeight:1.8, maxWidth:480 }}>
                Browse our full directory of specialists, read their profiles, check availability, and book your appointment — all in one place.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem', flexShrink:0 }}>
              <Link to="/doctors" style={{
                display:'inline-flex', alignItems:'center', gap:'0.5rem',
                padding:'0.9rem 2rem', borderRadius:50,
                background:'linear-gradient(135deg,#14b8a6,#0d9488)',
                color:'#fff', textDecoration:'none', fontWeight:700, fontSize:'0.95rem',
                boxShadow:'0 8px 24px rgba(20,184,166,0.4)', transition:'all 0.25s',
                fontFamily:"'DM Sans',sans-serif",
              }} className="btn-primary">
                View All Doctors →
              </Link>
              <button onClick={() => scrollTo('appointment')} style={{
                padding:'0.9rem 2rem', borderRadius:50,
                border:'2px solid rgba(255,255,255,0.35)', background:'transparent',
                color:'#fff', fontWeight:600, fontSize:'0.9rem', cursor:'pointer',
                transition:'all 0.25s', fontFamily:"'DM Sans',sans-serif",
                textAlign:'center',
              }} className="btn-outline">
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section style={{ padding:'6rem 2rem', background:'linear-gradient(135deg,#0f4c45,#0d6e63)' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ color:'#4ade80', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1rem' }}>— PATIENT STORIES</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.5rem', fontWeight:800, color:'#fff', marginBottom:'3rem' }}>
            What Our Patients Say
          </h2>
          <div className="testimonial-card" style={{
            background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:24, padding:'2.5rem', backdropFilter:'blur(10px)',
            transition:'box-shadow 0.3s',
          }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1.25rem', color:'#4ade80' }}>❝</div>
            <p style={{ color:'rgba(255,255,255,0.9)', fontSize:'1.1rem', lineHeight:1.9, fontStyle:'italic', marginBottom:'2rem' }}>
              {TESTIMONIALS[testIdx].text}
            </p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#14b8a6,#4ade80)', display:'flex', alignItems:'center', justifyContent:'center', color:'#0f4c45', fontWeight:800, fontSize:'1rem' }}>
                {TESTIMONIALS[testIdx].name[0]}
              </div>
              <div style={{ textAlign:'left' }}>
                <div style={{ color:'#fff', fontWeight:700, fontSize:'0.95rem' }}>{TESTIMONIALS[testIdx].name}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.8rem' }}>{TESTIMONIALS[testIdx].role}</div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'1.5rem' }}>
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={() => setTestIdx(i)} style={{
                width: i===testIdx?24:8, height:8, borderRadius:50,
                background: i===testIdx?'#4ade80':'rgba(255,255,255,0.3)',
                border:'none', cursor:'pointer', transition:'all 0.3s',
              }}/>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ APPOINTMENT ══════════════ */}

      {/* ══════════════ CONTACT US ══════════════ */}
      <section id="contact" style={{ padding:'6rem 2rem', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'4rem' }}>
            <div style={{ color:'#14b8a6', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1rem' }}>— GET IN TOUCH</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.8rem', fontWeight:800, color:'#0f172a', marginBottom:'1rem' }}>
              We're Here to Help
            </h2>
            <p style={{ color:'#64748b', fontSize:'1rem', lineHeight:1.8 }}>Have a question? Our team is ready to assist you every day of the week.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'start' }}>
            <div>
              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', marginBottom:'2.5rem' }}>
                {[
                  { icon:'📍', title:'Our Location',   lines:['123 Galle Road, Colombo 03','Western Province, Sri Lanka'] },
                  { icon:'📞', title:'Phone',           lines:['+94 11 234 5678','+94 77 234 5678 (Emergency)'] },
                  { icon:'📧', title:'Email',           lines:['info@medichannel.lk','support@medichannel.lk'] },
                  { icon:'🕐', title:'Working Hours',   lines:['Mon – Sat: 8:00 AM – 8:00 PM','Sunday: 9:00 AM – 5:00 PM'] },
                ].map(c => (
                  <div key={c.title} style={{
                    display:'flex', gap:'1.25rem', alignItems:'flex-start',
                    padding:'1.25rem', borderRadius:16, background:'#f8fafc',
                    border:'1px solid #e2e8f0',
                  }}>
                    <div style={{
                      width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0,
                    }}>{c.icon}</div>
                    <div>
                      <div style={{ fontWeight:700, color:'#0f172a', marginBottom:'0.4rem', fontSize:'0.9rem' }}>{c.title}</div>
                      {c.lines.map(l => <div key={l} style={{ color:'#64748b', fontSize:'0.875rem', lineHeight:1.7 }}>{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontWeight:700, color:'#0f172a', marginBottom:'1rem', fontSize:'0.9rem' }}>Follow Us</div>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  {[['f','Facebook'],['in','LinkedIn'],['🐦','Twitter'],['📸','Instagram']].map(([icon,label]) => (
                    <div key={label} title={label} style={{
                      width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)',
                      border:'1px solid #99f6e4', display:'flex', alignItems:'center', justifyContent:'center',
                      color:'#0d9488', fontWeight:800, fontSize:'0.8rem', cursor:'pointer',
                    }}>{icon}</div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background:'#f8fafc', borderRadius:24, padding:'2.5rem', border:'1px solid #e2e8f0' }}>
              {contactSent ? (
                <div style={{ textAlign:'center', padding:'2rem', animation:'fadeIn 0.4s ease' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📬</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'#0d9488', marginBottom:'0.75rem' }}>Message Sent!</h3>
                  <p style={{ color:'#475569', lineHeight:1.8 }}>Thank you for reaching out. We'll get back to you within one business day.</p>
                </div>
              ) : (
                <form onSubmit={handleContact}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', fontWeight:700, color:'#0f172a', marginBottom:'1.5rem' }}>Send Us a Message</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    {[{label:'Your Name *',key:'name',type:'text',ph:'Full name'},{label:'Email *',key:'email',type:'email',ph:'your@email.com'}].map(f=>(
                      <div key={f.key}>
                        <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#334155', marginBottom:'0.4rem' }}>{f.label}</label>
                        <input type={f.type} placeholder={f.ph} required value={contactForm[f.key]}
                          onChange={e=>setContactForm(p=>({...p,[f.key]:e.target.value}))}
                          style={{ width:'100%', padding:'0.75rem 1rem', border:'2px solid #e2e8f0', borderRadius:10, fontSize:'0.875rem', boxSizing:'border-box', background:'#fff', fontFamily:"'DM Sans',sans-serif", transition:'border-color 0.2s' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#334155', marginBottom:'0.4rem' }}>Subject *</label>
                    <input type='text' placeholder='How can we help?' required value={contactForm.subject}
                      onChange={e=>setContactForm(p=>({...p,subject:e.target.value}))}
                      style={{ width:'100%', padding:'0.75rem 1rem', border:'2px solid #e2e8f0', borderRadius:10, fontSize:'0.875rem', boxSizing:'border-box', background:'#fff', fontFamily:"'DM Sans',sans-serif", transition:'border-color 0.2s' }} />
                  </div>
                  <div style={{ marginBottom:'1.5rem' }}>
                    <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#334155', marginBottom:'0.4rem' }}>Message *</label>
                    <textarea rows={5} placeholder='Write your message here...' required value={contactForm.message}
                      onChange={e=>setContactForm(p=>({...p,message:e.target.value}))}
                      style={{ width:'100%', padding:'0.75rem 1rem', border:'2px solid #e2e8f0', borderRadius:10, fontSize:'0.875rem', resize:'vertical', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box', background:'#fff', transition:'border-color 0.2s' }} />
                  </div>
                  <button type='submit' className='btn-primary' style={{
                    width:'100%', padding:'0.9rem', borderRadius:50, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg,#0d9488,#14b8a6)', color:'#fff',
                    fontWeight:700, fontSize:'0.95rem', boxShadow:'0 6px 18px rgba(13,148,136,0.35)',
                    transition:'all 0.25s', fontFamily:"'DM Sans',sans-serif",
                  }}>Send Message →</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background:'#0f172a', color:'rgba(255,255,255,0.7)', padding:'4rem 2rem 2rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'3rem', marginBottom:'3rem' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1.25rem' }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#0d9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🏥</div>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.1rem', color:'#fff' }}>MediChannel</div>
                  <div style={{ fontSize:'0.65rem', color:'#14b8a6', letterSpacing:'0.1em' }}>HEALTHCARE PLATFORM</div>
                </div>
              </div>
              <p style={{ fontSize:'0.875rem', lineHeight:1.8, maxWidth:280, color:'rgba(255,255,255,0.55)' }}>
                Sri Lanka's trusted online doctor channelling platform, delivering compassionate, world-class healthcare since 2010.
              </p>
            </div>
            {[
              { title:'Quick Links', items:['Home','About Us','Our Services','Meet Our Doctors','Appointment','Contact Us'] },
              { title:'Services',    items:['Cardiology','Neurology','Pediatrics','Dermatology','Orthopedics','Dental Care'] },
              { title:'Contact',     items:['123 Galle Road, Colombo 03','info@medichannel.lk','+94 11 234 5678','Mon–Sat: 8 AM – 8 PM'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:700, color:'#fff', fontSize:'0.9rem', marginBottom:'1.25rem', letterSpacing:'0.05em' }}>{col.title}</div>
                {col.items.map(item => (
                  <div key={item} style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.5)', marginBottom:'0.6rem', cursor:'pointer', transition:'color 0.2s' }}
                    onMouseOver={e=>e.target.style.color='#14b8a6'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.5)'}>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ fontSize:'0.825rem', color:'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} MediChannel Hospital. All rights reserved.
            </div>
            <div style={{ display:'flex', gap:'1.5rem', fontSize:'0.825rem', color:'rgba(255,255,255,0.4)' }}>
              {['Privacy Policy','Terms of Service','Cookie Policy'].map(l => (
                <span key={l} style={{ cursor:'pointer' }} onMouseOver={e=>e.target.style.color='#14b8a6'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.4)'}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media(max-width:900px){
          .desktop-nav{ display:none !important; }
          #hamburger{ display:block !important; }
        }
      `}</style>
    </div>
  );
}