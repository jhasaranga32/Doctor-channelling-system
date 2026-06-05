import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wallpaper from '../assets/1.jpg';

/* ─── Google Fonts ─── */
const injectFonts = () => {
  if (document.getElementById('landing-fonts')) return;
  const link = document.createElement('link');
  link.id = 'landing-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
};

/* ─── Data ─── */
const DOCTORS = [
  { name: 'Dr. Priya Fernando',    spec: 'Cardiologist',  exp: '12 Years', fee: 'LKR 2,500', emoji: '🫀', color: '#c0392b' },
  { name: 'Dr. Rahal Perera',      spec: 'Neurologist',   exp: '8 Years',  fee: 'LKR 3,000', emoji: '🧠', color: '#1a5276' },
  { name: 'Dr. Sithum Dias',       spec: 'Pediatrician',  exp: '15 Years', fee: 'LKR 2,000', emoji: '👶', color: '#1e8449' },
  { name: 'Dr. Amali Wijesinghe', spec: 'Dermatologist', exp: '10 Years', fee: 'LKR 2,200', emoji: '🌿', color: '#6c3483' },
];

const SERVICES = [
  { icon: '🫀', title: 'Cardiology',     desc: 'Advanced heart care with state-of-the-art diagnostics and personalised treatment plans.' },
  { icon: '🧠', title: 'Neurology',      desc: 'Expert care for brain, spine and nervous system conditions with precision diagnostics.' },
  { icon: '🦷', title: 'Dental Care',    desc: 'Complete dental solutions from routine cleaning to advanced cosmetic procedures.' },
  { icon: '👁️', title: 'Ophthalmology', desc: 'Comprehensive eye care, vision correction and minimally invasive surgical interventions.' },
  { icon: '🦴', title: 'Orthopedics',   desc: 'Bone, joint and muscle health with modern, minimally invasive procedures.' },
  { icon: '👶', title: 'Pediatrics',     desc: 'Compassionate care for children from birth through adolescence.' },
];

const STATS = [
  { value: '15,000+', label: 'Patients Served' },
  { value: '50+',     label: 'Expert Doctors' },
  { value: '25+',     label: 'Specialties' },
  { value: '98%',     label: 'Satisfaction Rate' },
];

const TESTIMONIALS = [
  { name: 'Samanthi K.', role: 'Patient', text: 'Booking my appointment online was effortless. The doctors are incredibly skilled and the staff very welcoming. MediChannel changed how I think about healthcare.' },
  { name: 'Ruwan P.',    role: 'Patient', text: 'I was seen promptly, the cardiologist explained everything clearly and the follow-up care was excellent. Highly recommend this platform to all.' },
  { name: 'Nilmini S.', role: 'Patient', text: 'The paediatric team treated my daughter with so much patience and warmth. I felt reassured every step of the way. Five stars!' },
];

/* ─── CSS ─── */
const CSS = `
  :root {
    --navy: #0a1628;
    --navy-mid: #112240;
    --teal: #0d9488;
    --teal-light: #14b8a6;
    --teal-pale: #ccfbf1;
    --gold: #c9a84c;
    --gold-light: #f0d080;
    --cream: #fafaf8;
    --slate: #64748b;
    --ink: #0f172a;
    --border: #e2e8f0;
  }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideRight { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideLeft  { from { opacity:0; transform:translateX(24px); }  to { opacity:1; transform:translateX(0); } }
  @keyframes pulse    { 0%,100%{transform:scale(1);} 50%{transform:scale(1.06);} }
  @keyframes scrollDown { 0%{transform:translateY(0);opacity:1;} 100%{transform:translateY(10px);opacity:0;} }
  @keyframes dropIn   { from{opacity:0;transform:translateY(-10px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes shimmer  { 0%{background-position:200% center;} 100%{background-position:-200% center;} }
  @keyframes rotate   { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  .nav-pill {
    position: relative;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    font-size: 0.875rem;
    letter-spacing: 0.02em;
    transition: color 0.25s;
  }
  .nav-pill::after {
    content: '';
    position: absolute;
    bottom: -6px; left: 50%;
    transform: translateX(-50%);
    width: 0; height: 2px;
    background: var(--gold);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  .nav-pill:hover::after, .nav-pill.active::after { width: 80%; }

  .service-card {
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
    cursor: pointer;
  }
  .service-card:hover { transform: translateY(-10px); box-shadow: 0 28px 56px rgba(10,22,40,0.12) !important; }

  .doctor-card {
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
  }
  .doctor-card:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(10,22,40,0.15) !important; }

  .stat-card { transition: transform 0.25s, box-shadow 0.25s; }
  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(10,22,40,0.12) !important; }

  .btn-cta {
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    font-family: 'Outfit', sans-serif;
  }
  .btn-cta:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(13,148,136,0.45) !important; }

  .btn-ghost {
    transition: all 0.25s;
    font-family: 'Outfit', sans-serif;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.15) !important; transform: translateY(-2px); }

  .profile-menu-item { transition: background 0.15s, color 0.15s; }
  .profile-menu-item:hover { background: var(--teal-pale) !important; color: var(--teal) !important; }

  .tag-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 0.7rem;
    color: var(--gold);
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--teal) !important;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
  }
`;

/* ══ UserAvatar ══ */
function UserAvatar({ user, size = 36 }) {
  const name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || '?';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const palette = ['#0d9488', '#0891b2', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];
  const colorIdx = (name || '').charCodeAt(0) % palette.length;
  const bg = palette[colorIdx];
  const bg2 = palette[(colorIdx + 2) % palette.length];

  if (user.profilePic) {
    return (
      <img src={user.profilePic} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--teal-light)', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg,${bg},${bg2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.36,
      fontFamily: "'Outfit',sans-serif", border: '2px solid rgba(255,255,255,0.2)',
    }}>{initials}</div>
  );
}

/* ══ ProfileDropdown ══ */
function ProfileDropdown({ user, navScrolled, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Patient';
  const menuItems = [
    { icon: '👤', label: 'My Profile',      path: '/patient/profile' },
    { icon: '📅', label: 'My Appointments', path: '/appointments' },
    { icon: '📋', label: 'Health Records',  path: '/patient/records' },
    { icon: '⚙️', label: 'Settings',        path: '/patient/settings' },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.3rem 0.9rem 0.3rem 0.3rem', borderRadius: 50,
        border: navScrolled ? '1.5px solid var(--teal-pale)' : '1.5px solid rgba(255,255,255,0.25)',
        background: navScrolled ? '#f8fffe' : 'rgba(255,255,255,0.1)',
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        <UserAvatar user={user} size={32} />
        <div style={{ lineHeight: 1.2, textAlign: 'left' }}>
          <div style={{ fontWeight: 600, fontSize: '0.78rem', color: navScrolled ? 'var(--ink)' : '#fff', fontFamily: "'Outfit',sans-serif", maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(fullName || 'Patient').split(' ')[0]}
          </div>
          <div style={{ fontSize: '0.6rem', color: navScrolled ? 'var(--teal)' : 'rgba(255,255,255,0.6)', fontFamily: "'Outfit',sans-serif" }}>Patient</div>
        </div>
        <span style={{ fontSize: '0.5rem', color: navScrolled ? '#94a3b8' : 'rgba(255,255,255,0.5)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', marginLeft: 2 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 14px)', right: 0, width: 272,
          background: '#fff', borderRadius: 20, zIndex: 2000,
          boxShadow: '0 24px 64px rgba(10,22,40,0.18)', border: '1px solid var(--border)',
          overflow: 'hidden', animation: 'dropIn 0.2s ease both',
        }}>
          <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'linear-gradient(135deg, #f0fdfa, #e0f9f5)', borderBottom: '1px solid var(--border)' }}>
            <UserAvatar user={user} size={46} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Outfit',sans-serif" }}>{fullName}</div>
              <div style={{ color: 'var(--slate)', fontSize: '0.7rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Outfit',sans-serif" }}>{user.email}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, background: 'var(--teal)', borderRadius: 50, padding: '0.12rem 0.5rem' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                <span style={{ color: '#fff', fontSize: '0.58rem', fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>ACTIVE PATIENT</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '0.4rem' }}>
            {menuItems.map(item => (
              <button key={item.label} className="profile-menu-item" onClick={() => { navigate(item.path); setOpen(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.65rem 0.85rem', border: 'none', background: 'none',
                cursor: 'pointer', borderRadius: 10, color: '#334155',
                fontFamily: "'Outfit',sans-serif", fontSize: '0.875rem', fontWeight: 500, textAlign: 'left',
              }}>
                <span style={{ width: 22, textAlign: 'center', fontSize: '1rem' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: '0.4rem' }}>
            <button onClick={() => { onLogout(); setOpen(false); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.65rem 0.85rem', border: 'none', background: 'none',
              cursor: 'pointer', borderRadius: 10, color: '#ef4444',
              fontFamily: "'Outfit',sans-serif", fontSize: '0.875rem', fontWeight: 600, textAlign: 'left',
            }}
              onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}>
              <span style={{ width: 22, textAlign: 'center', fontSize: '1rem' }}>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ MAIN ══ */
export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', doctor: '', date: '', message: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [testIdx, setTestIdx] = useState(0);

  useEffect(() => {
    injectFonts();
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 60);
      const sections = ['home', 'about', 'services', 'doctors', 'appointment', 'contact'];
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

  const scrollTo = id => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

  const handleAppt = e => {
    e.preventDefault(); setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', phone: '', doctor: '', date: '', message: '' });
  };

  const handleContact = e => {
    e.preventDefault(); setContactSent(true);
    setTimeout(() => setContactSent(false), 4000);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const NAV_LINKS = [
    { id: 'home',     label: 'Home' },
    { id: 'about',    label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'doctors',  label: 'Doctors' },
    { id: 'contact',  label: 'Contact' },
  ];

  /* Shared input style */
  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', border: '1.5px solid var(--border)',
    borderRadius: 10, fontSize: '0.875rem', boxSizing: 'border-box',
    background: '#fff', fontFamily: "'Outfit',sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s',
    color: 'var(--ink)',
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)', overflowX: 'hidden', background: 'var(--cream)' }}>

      {/* ══════ NAVBAR ══════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: navScrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(16px)' : 'none',
        boxShadow: navScrolled ? '0 1px 0 rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.3s ease',
        padding: navScrolled ? '0.7rem 0' : '1.2rem 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer' }} onClick={() => scrollTo('home')}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--navy), var(--teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
            }}>🏥</div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.3rem', color: navScrolled ? 'var(--navy)' : '#fff', lineHeight: 1, letterSpacing: '-0.01em' }}>MediChannel</div>
              <div style={{ fontSize: '0.58rem', color: navScrolled ? 'var(--gold)' : 'rgba(255,255,255,0.65)', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>Healthcare Platform</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }} className="desktop-nav">
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className={`nav-pill ${activeSection === l.id ? 'active' : ''}`}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0',
                  color: navScrolled ? (activeSection === l.id ? 'var(--teal)' : '#334155') : (activeSection === l.id ? '#fff' : 'rgba(255,255,255,0.8)'),
                  transition: 'color 0.2s',
                }}>{l.label}</button>
            ))}

            {user ? (
              <ProfileDropdown user={user} navScrolled={navScrolled} onLogout={logout} />
            ) : (
              <Link to="/login" style={{
                padding: '0.55rem 1.5rem', borderRadius: 50,
                background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
                color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                boxShadow: '0 4px 16px rgba(13,148,136,0.35)', transition: 'all 0.25s',
                fontFamily: "'Outfit',sans-serif", letterSpacing: '0.02em',
              }} className="btn-cta">Sign In</Link>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.4rem', color: navScrolled ? 'var(--navy)' : '#fff',
          }} id="hamburger">☰</button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ background: '#fff', padding: '1rem 2rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem', background: '#f0fdfa', borderRadius: 14, border: '1px solid #99f6e4', marginBottom: '0.25rem' }}>
                <UserAvatar user={user} size={40} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.9rem', fontFamily: "'Outfit',sans-serif" }}>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}</div>
                  <div style={{ color: 'var(--teal)', fontSize: '0.75rem', fontFamily: "'Outfit',sans-serif" }}>{user.email}</div>
                </div>
              </div>
            )}
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '1rem', padding: '0.4rem 0', fontFamily: "'Outfit',sans-serif" }}>
                {l.label}
              </button>
            ))}
            {user ? (
              <>
                <button onClick={() => { navigate('/patient/profile'); setMenuOpen(false); }}
                  style={{ padding: '0.7rem', background: '#f0fdfa', color: 'var(--teal)', border: '1px solid #99f6e4', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                  👤 My Profile
                </button>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ padding: '0.7rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                style={{ padding: '0.7rem', background: 'var(--teal)', color: '#fff', borderRadius: 10, textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ══════ HERO ══════ */}
      <section id="home" style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        background: 'var(--navy)',
        display: 'flex', alignItems: 'center',
      }}>
        {/* Background texture lines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${10 + i * 15}%`, left: '-10%', right: '-10%',
              height: '1px',
              background: 'rgba(255,255,255,0.04)',
              transform: `rotate(${-8 + i * 0.5}deg)`,
            }} />
          ))}
          {/* Teal glow blob */}
          <div style={{
            position: 'absolute', width: 600, height: 600,
            borderRadius: '50%', top: '-150px', right: '-150px',
            background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', width: 400, height: 400,
            borderRadius: '50%', bottom: '10%', left: '-100px',
            background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          }} />
        </div>

        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '7rem 2.5rem 5rem',
          display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem',
          width: '100%', alignItems: 'center', position: 'relative', zIndex: 1,
        }}>
          {/* Left Content */}
          <div style={{ animation: 'fadeUp 0.9s ease both' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              border: '1px solid rgba(201,168,76,0.3)',
              background: 'rgba(201,168,76,0.08)',
              borderRadius: 50, padding: '0.4rem 1rem', marginBottom: '1.75rem',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span className="tag-label">Now Accepting New Patients</span>
            </div>

            {/* Welcome if logged in */}
            {user && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 12, padding: '0.55rem 1rem', marginBottom: '1.25rem',
              }}>
                <UserAvatar user={user} size={28} />
                <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.875rem', fontFamily: "'Outfit',sans-serif" }}>
                  Welcome back, {(user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Patient').split(' ')[0]}! 👋
                </span>
              </div>
            )}

            <h1 style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 'clamp(2.8rem, 5vw, 4.4rem)',
              fontWeight: 600, color: '#fff', lineHeight: 1.1,
              marginBottom: '1.5rem', letterSpacing: '-0.02em',
            }}>
              Your Health,<br />
              <span style={{
                background: 'linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold))',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'shimmer 4s linear infinite',
              }}>Our Priority.</span>
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.85,
              marginBottom: '2.5rem', maxWidth: 500,
              fontFamily: "'Outfit',sans-serif", fontWeight: 300,
            }}>
              Sri Lanka's most trusted online doctor channelling platform. Book with top specialists, manage your records, and receive world-class care — all in one place.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <button onClick={() => scrollTo('appointment')} className="btn-cta" style={{
                padding: '0.9rem 2.25rem', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
                color: '#fff', fontWeight: 600, fontSize: '0.95rem',
                boxShadow: '0 8px 28px rgba(13,148,136,0.35)',
              }}>Book Appointment →</button>
              <button onClick={() => scrollTo('about')} className="btn-ghost" style={{
                padding: '0.9rem 2.25rem', borderRadius: 50,
                border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent',
                color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer',
              }}>Learn More</button>
            </div>

            {/* Mini Stats */}
            <div style={{ display: 'flex', gap: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[['15K+', 'Patients'], ['50+', 'Doctors'], ['98%', 'Satisfaction']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{v}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontFamily: "'Outfit',sans-serif", marginTop: 4, letterSpacing: '0.05em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Image Card */}
          <div style={{ position: 'relative', animation: 'slideLeft 1s ease 0.2s both' }}>
            {/* Decorative ring */}
            <div style={{
              position: 'absolute', inset: -20,
              borderRadius: 32,
              border: '1px solid rgba(201,168,76,0.15)',
              pointerEvents: 'none',
            }} />
            <div style={{
              borderRadius: 28,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              aspectRatio: '4/3',
            }}>
              <img
                src={wallpaper}
                alt="Medical professionals"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  filter: 'brightness(0.88) saturate(1.1)',
                }}
              />
              {/* Overlay gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, transparent 50%, rgba(10,22,40,0.7) 100%)',
              }} />
              {/* Bottom label */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '1.5rem',
              }}>
                <div style={{ color: '#fff', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>Expert Medical Team</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontFamily: "'Outfit',sans-serif" }}>50+ specialists across 25 departments</div>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: 'absolute', top: -16, right: -16,
              background: '#fff', borderRadius: 16, padding: '0.9rem 1.1rem',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)', textAlign: 'center',
              minWidth: 80,
            }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--teal)', lineHeight: 1 }}>4.9</div>
              <div style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.08em', fontFamily: "'Outfit',sans-serif", fontWeight: 600, marginTop: 2 }}>★ RATING</div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '0.15em', marginBottom: '0.5rem', fontFamily: "'Outfit',sans-serif" }}>SCROLL</div>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(rgba(255,255,255,0.3),transparent)', margin: '0 auto', animation: 'scrollDown 1.5s ease infinite' }} />
        </div>
      </section>

      {/* ══════ STATS BAND ══════ */}
      <section style={{ background: '#fff', padding: '3.5rem 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="stat-card" style={{
              textAlign: 'center', padding: '2rem 1.5rem', borderRadius: 18,
              background: i % 2 === 0 ? 'var(--navy)' : '#fff',
              border: i % 2 === 0 ? 'none' : '1.5px solid var(--border)',
              boxShadow: i % 2 === 0 ? '0 8px 24px rgba(10,22,40,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.4rem', fontWeight: 700, color: i % 2 === 0 ? 'var(--gold)' : 'var(--teal)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: i % 2 === 0 ? 'rgba(255,255,255,0.55)' : 'var(--slate)', fontSize: '0.85rem', fontWeight: 500, marginTop: '0.5rem', fontFamily: "'Outfit',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ ABOUT ══════ */}
      <section id="about" style={{ padding: '7rem 2.5rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 28, overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--navy), #0d6e63)',
              padding: '3rem', minHeight: 420,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 24px 60px rgba(10,22,40,0.2)',
            }}>
              <div style={{ fontSize: '3.5rem' }}>🏥</div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 600, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                  Established in 2010
                </div>
                <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, fontSize: '0.9rem', fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>
                  MediChannel Hospital has been at the forefront of healthcare in Sri Lanka for over 14 years, serving communities with compassion and clinical excellence.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                {[['🏆', 'ISO Certified'], ['🌟', 'Award Winning'], ['🇱🇰', 'No.1 in Sri Lanka']].map(([icon, label]) => (
                  <div key={label} style={{
                    flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem 0.5rem',
                    textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)',
                  }}>
                    <div style={{ fontSize: '1.1rem' }}>{icon}</div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 600, marginTop: '0.35rem', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.02em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              position: 'absolute', top: -18, right: -18,
              background: '#fff', borderRadius: 18, padding: '1rem 1.25rem',
              boxShadow: '0 12px 32px rgba(0,0,0,0.1)', textAlign: 'center',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '1.6rem' }}>⭐</div>
              <div style={{ fontWeight: 800, color: 'var(--teal)', fontSize: '1.25rem', fontFamily: "'Cormorant Garamond',serif" }}>4.9/5</div>
              <div style={{ color: 'var(--slate)', fontSize: '0.7rem', fontFamily: "'Outfit',sans-serif" }}>Patient Rating</div>
            </div>
          </div>

          <div>
            <div className="tag-label" style={{ marginBottom: '1rem' }}>— About Us</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Compassionate Care,<br />
              <span style={{ color: 'var(--teal)' }}>Modern Medicine.</span>
            </h2>
            <p style={{ color: 'var(--slate)', lineHeight: 1.9, fontSize: '0.97rem', marginBottom: '1.5rem', fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>
              At MediChannel Hospital, we believe exceptional healthcare begins with understanding each patient as an individual. Our multidisciplinary team of over 50 specialists works together to provide personalised, evidence-based treatment.
            </p>
            <p style={{ color: 'var(--slate)', lineHeight: 1.9, fontSize: '0.97rem', marginBottom: '2rem', fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>
              From routine check-ups to complex procedures, our facility is equipped with the latest technology to ensure accurate diagnosis and effective treatment across all specialties.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {[
                'State-of-the-art diagnostic equipment and operating theatres',
                '24/7 emergency services and intensive care units',
                'Online appointment booking with real-time availability',
                'Digital health records accessible anytime, anywhere',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', color: '#fff', fontWeight: 900, flexShrink: 0, marginTop: 2,
                  }}>✓</div>
                  <span style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.7, fontFamily: "'Outfit',sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={() => scrollTo('appointment')} className="btn-cta" style={{
              padding: '0.85rem 2rem', borderRadius: 50, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--navy), #1a3a5c)',
              color: '#fff', fontWeight: 600, fontSize: '0.93rem',
              boxShadow: '0 8px 24px rgba(10,22,40,0.25)',
            }}>Book an Appointment →</button>
          </div>
        </div>
      </section>

      {/* ══════ SERVICES ══════ */}
      <section id="services" style={{ padding: '7rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="tag-label" style={{ marginBottom: '1rem', display: 'block' }}>— Our Services</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Comprehensive Healthcare<br />Under One Roof
            </h2>
            <p style={{ color: 'var(--slate)', fontSize: '0.97rem', maxWidth: 540, margin: '0 auto', lineHeight: 1.85, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>
              We offer a wide spectrum of medical specialties with world-class facilities, ensuring every patient receives the highest standard of care.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
            {SERVICES.map((s, i) => (
              <div key={i} className="service-card" style={{
                background: '#fff', borderRadius: 22, padding: '2rem',
                boxShadow: '0 4px 20px rgba(10,22,40,0.07)',
                border: '1.5px solid var(--border)',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'linear-gradient(135deg, var(--navy), #1a3a5c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: '1.25rem',
                  boxShadow: '0 6px 16px rgba(10,22,40,0.15)',
                }}>{s.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.65rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--slate)', fontSize: '0.875rem', lineHeight: 1.8, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>{s.desc}</p>
                <div style={{ marginTop: '1.25rem', color: 'var(--teal)', fontSize: '0.83rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: "'Outfit',sans-serif" }}>
                  Learn more <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ DOCTORS ══════ */}
      <section id="doctors" style={{ padding: '7rem 2.5rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="tag-label" style={{ marginBottom: '1rem', display: 'block' }}>— Meet Our Team</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Expert Doctors,<br />Exceptional Care
            </h2>
            <p style={{ color: 'var(--slate)', fontSize: '0.97rem', maxWidth: 540, margin: '0 auto', lineHeight: 1.85, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>
              Our nationally recognised specialists bring decades of clinical experience across every major medical field.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            {DOCTORS.slice(0, 3).map((d, i) => (
              <div key={i} className="doctor-card" style={{
                background: '#fff', borderRadius: 22, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(10,22,40,0.08)',
                border: '1.5px solid var(--border)',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}>
                <div style={{
                  height: 150, background: `linear-gradient(135deg, ${d.color}18, ${d.color}35)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', position: 'relative',
                }}>
                  {d.emoji}
                  <div style={{
                    position: 'absolute', bottom: -1, left: 0, right: 0, height: 40,
                    background: 'linear-gradient(transparent, #fff)',
                  }} />
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem' }}>{d.name}</h3>
                  <div style={{ color: 'var(--teal)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.85rem', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.04em' }}>{d.spec}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--slate)', marginBottom: '1.1rem', fontFamily: "'Outfit',sans-serif" }}>
                    <span>🎓 {d.exp}</span>
                    <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{d.fee}</span>
                  </div>
                  <button onClick={() => scrollTo('appointment')} style={{
                    width: '100%', padding: '0.6rem', borderRadius: 10,
                    background: 'transparent', border: '1.5px solid var(--teal)',
                    color: 'var(--teal)', fontWeight: 600, cursor: 'pointer',
                    fontSize: '0.82rem', fontFamily: "'Outfit',sans-serif",
                    transition: 'all 0.2s',
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--teal)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--teal)'; }}>
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--navy), #0d4a42)',
            borderRadius: 24, padding: '3rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '2rem',
            boxShadow: '0 16px 48px rgba(10,22,40,0.25)',
          }}>
            <div>
              <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: "'Outfit',sans-serif" }}>50+ Specialists Available</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                Find the Right Doctor<br />for Your Needs
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.85, maxWidth: 480, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>
                Browse our full directory of specialists, read their profiles, check availability, and book — all in one place.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
              <Link to="/doctors" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2rem', borderRadius: 50,
                background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
                color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                boxShadow: '0 8px 24px rgba(13,148,136,0.4)',
                fontFamily: "'Outfit',sans-serif",
              }} className="btn-cta">View All Doctors →</Link>
              <button onClick={() => scrollTo('appointment')} style={{
                padding: '0.9rem 2rem', borderRadius: 50,
                border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent',
                color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '0.9rem',
                cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all 0.25s',
              }} className="btn-ghost">Book Appointment</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section style={{ padding: '7rem 2.5rem', background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>
        {/* Deco */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="tag-label" style={{ marginBottom: '1rem', display: 'block' }}>— Patient Stories</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 600, color: '#fff', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
            What Our Patients Say
          </h2>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '2.5rem 3rem',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '3rem', color: 'var(--gold)', lineHeight: 1, marginBottom: '1.25rem' }}>"</div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.9, fontStyle: 'italic', marginBottom: '2rem', fontFamily: "'Cormorant Garamond',serif", fontWeight: 400 }}>
              {TESTIMONIALS[testIdx].text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1rem', fontFamily: "'Outfit',sans-serif",
              }}>{TESTIMONIALS[testIdx].name[0]}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem', fontFamily: "'Outfit',sans-serif" }}>{TESTIMONIALS[testIdx].name}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontFamily: "'Outfit',sans-serif" }}>{TESTIMONIALS[testIdx].role}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestIdx(i)} style={{
                width: i === testIdx ? 24 : 7, height: 7, borderRadius: 50,
                background: i === testIdx ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ APPOINTMENT ══════ */}
      <section id="appointment" style={{ padding: '7rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="tag-label" style={{ marginBottom: '1rem', display: 'block' }}>— Book a Visit</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 600, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
              Schedule Your Appointment
            </h2>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto', background: 'var(--cream)', borderRadius: 24, padding: '2.5rem', border: '1.5px solid var(--border)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', color: 'var(--teal)', marginBottom: '0.75rem' }}>Appointment Requested!</h3>
                <p style={{ color: 'var(--slate)', lineHeight: 1.8, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>We'll confirm your appointment within one business day. Thank you for choosing MediChannel.</p>
              </div>
            ) : (
              <form onSubmit={handleAppt}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  {[
                    { label: 'Full Name *', key: 'name', type: 'text', ph: 'Your full name' },
                    { label: 'Email *', key: 'email', type: 'email', ph: 'your@email.com' },
                    { label: 'Phone *', key: 'phone', type: 'tel', ph: '+94 77 000 0000' },
                    { label: 'Preferred Date *', key: 'date', type: 'date', ph: '' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.04em' }}>{f.label}</label>
                      <input type={f.type} placeholder={f.ph} required value={formData[f.key]}
                        onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                        style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.04em' }}>Select Doctor *</label>
                  <select required value={formData.doctor} onChange={e => setFormData(p => ({ ...p, doctor: e.target.value }))} style={inputStyle}>
                    <option value="">Choose a specialist</option>
                    {DOCTORS.map(d => <option key={d.name} value={d.name}>{d.name} — {d.spec}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.04em' }}>Additional Notes</label>
                  <textarea rows={4} placeholder="Describe your symptoms or reason for visit..." value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn-cta" style={{
                  width: '100%', padding: '0.95rem', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--navy), #1a3a5c)',
                  color: '#fff', fontWeight: 600, fontSize: '0.95rem',
                  boxShadow: '0 8px 24px rgba(10,22,40,0.2)',
                }}>Confirm Appointment Request →</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════ CONTACT ══════ */}
      <section id="contact" style={{ padding: '7rem 2.5rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="tag-label" style={{ marginBottom: '1rem', display: 'block' }}>— Get in Touch</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              We're Here to Help
            </h2>
            <p style={{ color: 'var(--slate)', fontSize: '0.97rem', lineHeight: 1.8, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>Have a question? Our team is ready to assist you every day of the week.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {[
                  { icon: '📍', title: 'Our Location',  lines: ['123 Galle Road, Colombo 03', 'Western Province, Sri Lanka'] },
                  { icon: '📞', title: 'Phone',          lines: ['+94 11 234 5678', '+94 77 234 5678 (Emergency)'] },
                  { icon: '📧', title: 'Email',          lines: ['info@medichannel.lk', 'support@medichannel.lk'] },
                  { icon: '🕐', title: 'Working Hours',  lines: ['Mon – Sat: 8:00 AM – 8:00 PM', 'Sunday: 9:00 AM – 5:00 PM'] },
                ].map(c => (
                  <div key={c.title} style={{
                    display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                    padding: '1.25rem', borderRadius: 16, background: '#fff',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(10,22,40,0.04)',
                  }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--navy), #1a3a5c)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', flexShrink: 0,
                    }}>{c.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.35rem', fontSize: '0.875rem', fontFamily: "'Outfit',sans-serif" }}>{c.title}</div>
                      {c.lines.map(l => <div key={l} style={{ color: 'var(--slate)', fontSize: '0.85rem', lineHeight: 1.7, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', fontSize: '0.875rem', fontFamily: "'Outfit',sans-serif" }}>Follow Us</div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[['f', 'Facebook'], ['in', 'LinkedIn'], ['𝕏', 'Twitter'], ['◻', 'Instagram']].map(([icon, label]) => (
                    <div key={label} title={label} style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'var(--navy)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: '0.85rem',
                      cursor: 'pointer', transition: 'background 0.2s',
                    }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--teal)'}
                      onMouseOut={e => e.currentTarget.style.background = 'var(--navy)'}>{icon}</div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 24, padding: '2.5rem', border: '1.5px solid var(--border)', boxShadow: '0 4px 20px rgba(10,22,40,0.06)' }}>
              {contactSent ? (
                <div style={{ textAlign: 'center', padding: '2rem', animation: 'fadeIn 0.4s ease' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', color: 'var(--teal)', marginBottom: '0.75rem' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--slate)', lineHeight: 1.8, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>Thank you for reaching out. We'll get back to you within one business day.</p>
                </div>
              ) : (
                <form onSubmit={handleContact}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1.5rem' }}>Send Us a Message</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {[{ label: 'Your Name *', key: 'name', type: 'text', ph: 'Full name' }, { label: 'Email *', key: 'email', type: 'email', ph: 'your@email.com' }].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.04em' }}>{f.label}</label>
                        <input type={f.type} placeholder={f.ph} required value={contactForm[f.key]}
                          onChange={e => setContactForm(p => ({ ...p, [f.key]: e.target.value }))}
                          style={inputStyle} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.04em' }}>Subject *</label>
                    <input type="text" placeholder="How can we help?" required value={contactForm.subject}
                      onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                      style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.04em' }}>Message *</label>
                    <textarea rows={5} placeholder="Write your message here..." required value={contactForm.message}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <button type="submit" className="btn-cta" style={{
                    width: '100%', padding: '0.9rem', borderRadius: 50, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
                    color: '#fff', fontWeight: 600, fontSize: '0.93rem',
                    boxShadow: '0 6px 20px rgba(13,148,136,0.3)',
                  }}>Send Message →</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.5)', padding: '4.5rem 2.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--teal-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏥</div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.15rem', color: '#fff', letterSpacing: '-0.01em' }}>MediChannel</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.15em', fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>HEALTHCARE PLATFORM</div>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.85, maxWidth: 280, color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>
                Sri Lanka's trusted online doctor channelling platform, delivering compassionate, world-class healthcare since 2010.
              </p>
            </div>
            {[
              { title: 'Quick Links', items: ['Home', 'About Us', 'Services', 'Doctors', 'Appointment', 'Contact'] },
              { title: 'Services',    items: ['Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Dental Care'] },
              { title: 'Contact',     items: ['123 Galle Road, Colombo 03', 'info@medichannel.lk', '+94 11 234 5678', 'Mon–Sat: 8 AM – 8 PM'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem', marginBottom: '1.25rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Outfit',sans-serif" }}>{col.title}</div>
                {col.items.map(item => (
                  <div key={item} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.65rem', cursor: 'pointer', transition: 'color 0.2s', fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}
                    onMouseOver={e => e.target.style.color = 'var(--gold)'}
                    onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>{item}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit',sans-serif" }}>
              © {new Date().getFullYear()} MediChannel Hospital. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit',sans-serif" }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <span key={l} style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = 'var(--gold)'}
                  onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>{l}</span>
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