// pages/DoctorsPage.jsx
// Public-facing page: Users browse doctors by specialization, search, filter
// Connects to: GET /api/doctors  &  GET /api/doctors/specializations

import { useState, useEffect, useMemo } from "react";

const API_BASE = "http://localhost:5000/api";

const SPEC_COLORS = {
  "Cardiology":"#ef4444","Dermatology":"#fb923c","Endocrinology":"#f59e0b",
  "Gastroenterology":"#84cc16","General Practice":"#22c55e","Geriatrics":"#10b981",
  "Gynecology & Obstetrics":"#14b8a6","Hematology":"#06b6d4","Infectious Disease":"#0ea5e9",
  "Internal Medicine":"#3b82f6","Nephrology":"#6366f1","Neurology":"#8b5cf6",
  "Oncology":"#a855f7","Ophthalmology":"#d946ef","Orthopedics":"#ec4899",
  "Otolaryngology (ENT)":"#f43f5e","Pathology":"#64748b","Pediatrics":"#f97316",
  "Psychiatry":"#7c3aed","Pulmonology":"#2563eb","Radiology":"#475569",
  "Rheumatology":"#16a34a","Surgery (General)":"#dc2626","Surgery (Cardiothoracic)":"#b91c1c",
  "Surgery (Neurosurgery)":"#7e22ce","Surgery (Orthopedic)":"#1d4ed8",
  "Surgery (Plastic)":"#db2777","Urology":"#0369a1",
};

const SPEC_ICONS = {
  "Cardiology":"❤️","Dermatology":"✨","Endocrinology":"🔬","Gastroenterology":"🫁",
  "General Practice":"🩺","Geriatrics":"👴","Gynecology & Obstetrics":"👶",
  "Hematology":"🩸","Infectious Disease":"🦠","Internal Medicine":"🏥",
  "Nephrology":"🫘","Neurology":"🧠","Oncology":"🎗","Ophthalmology":"👁",
  "Orthopedics":"🦴","Otolaryngology (ENT)":"👂","Pathology":"🔭",
  "Pediatrics":"🧒","Psychiatry":"🧘","Pulmonology":"🫁","Radiology":"📡",
  "Rheumatology":"🦾","Surgery (General)":"🔪","Surgery (Cardiothoracic)":"❤️‍🔥",
  "Surgery (Neurosurgery)":"🧠","Surgery (Orthopedic)":"🦵","Surgery (Plastic)":"💎","Urology":"💧",
};

// ── mock data (remove when API is ready) ───────────────────────
const MOCK = [
  { _id:"1", name:"Sarah Mitchell",  email:"sarah@h.com",  specialization:"Cardiology",       licenseNumber:"LIC001", qualification:"MBBS, MD",       experience:12, phone:"+1-555-0101", department:"Cardiac Care",   consultationFee:200, status:"active", availableDays:["Monday","Tuesday","Wednesday","Thursday","Friday"], consultationHours:{start:"09:00",end:"17:00"}, bio:"Expert in interventional cardiology with 12+ years in complex cardiac procedures." },
  { _id:"2", name:"James Okonkwo",   email:"james@h.com",  specialization:"Neurology",         licenseNumber:"LIC002", qualification:"MBBS, DM",       experience:8,  phone:"+1-555-0102", department:"Neuroscience",   consultationFee:180, status:"active", availableDays:["Monday","Wednesday","Friday"], consultationHours:{start:"10:00",end:"16:00"}, bio:"Specializes in stroke, epilepsy and movement disorders." },
  { _id:"3", name:"Priya Sharma",    email:"priya@h.com",  specialization:"Pediatrics",         licenseNumber:"LIC003", qualification:"MBBS, DCH",      experience:6,  phone:"+1-555-0103", department:"Child Health",   consultationFee:120, status:"active", availableDays:["Monday","Tuesday","Thursday","Friday"], consultationHours:{start:"08:00",end:"14:00"}, bio:"Passionate about child development and preventive healthcare." },
  { _id:"4", name:"David Chen",      email:"david@h.com",  specialization:"Orthopedics",        licenseNumber:"LIC004", qualification:"MBBS, MS",       experience:15, phone:"+1-555-0104", department:"Bone & Joint",  consultationFee:220, status:"active", availableDays:["Tuesday","Wednesday","Thursday"], consultationHours:{start:"09:00",end:"13:00"}, bio:"Joint replacement and sports injury rehabilitation specialist." },
  { _id:"5", name:"Emma Rodriguez",  email:"emma@h.com",   specialization:"Dermatology",        licenseNumber:"LIC005", qualification:"MBBS, DVD",      experience:9,  phone:"+1-555-0105", department:"Skin Care",     consultationFee:150, status:"active", availableDays:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], consultationHours:{start:"09:00",end:"18:00"}, bio:"Expert in cosmetic and medical dermatology, acne, and skin cancer." },
  { _id:"6", name:"Omar Hassan",     email:"omar@h.com",   specialization:"Psychiatry",          licenseNumber:"LIC006", qualification:"MBBS, MD Psych", experience:11, phone:"+1-555-0106", department:"Mental Health", consultationFee:160, status:"active", availableDays:["Monday","Wednesday","Friday"], consultationHours:{start:"11:00",end:"17:00"}, bio:"Focused on mood disorders, anxiety, and cognitive behavioural therapy." },
  { _id:"7", name:"Lisa Park",       email:"lisa@h.com",   specialization:"Oncology",            licenseNumber:"LIC007", qualification:"MBBS, DM Onco",  experience:14, phone:"+1-555-0107", department:"Cancer Center", consultationFee:250, status:"active", availableDays:["Monday","Tuesday","Thursday"], consultationHours:{start:"09:00",end:"15:00"}, bio:"Specializes in breast and lung oncology with a focus on targeted therapies." },
  { _id:"8", name:"Marcus Webb",     email:"marcus@h.com", specialization:"General Practice",    licenseNumber:"LIC008", qualification:"MBBS",            experience:5,  phone:"+1-555-0108", department:"Outpatient",   consultationFee:80,  status:"active", availableDays:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], consultationHours:{start:"08:00",end:"18:00"}, bio:"Your first point of contact for any health concern. Friendly family medicine." },
];

const avatarColor = (name) => {
  const colors = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#14b8a6","#f43f5e","#a855f7"];
  let h=0; for(let c of name) h=(h*31+c.charCodeAt(0))&0xffffffff;
  return colors[Math.abs(h)%colors.length];
};
const initials = (n) => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();

export default function DoctorsPage() {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeSpec, setActiveSpec] = useState("All");
  const [selected, setSelected]     = useState(null); // detail modal
  const [view, setView]             = useState("grid"); // grid | list

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_BASE}/doctors?status=active&limit=100`);
        const data = await res.json();
        setDoctors(data.data || []);
      } catch {
        setDoctors(MOCK); // fallback to mock
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const specializations = useMemo(() => {
    const s = new Set(doctors.map(d=>d.specialization));
    return ["All", ...Array.from(s).sort()];
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !search
        || d.name.toLowerCase().includes(q)
        || d.specialization.toLowerCase().includes(q)
        || (d.department||"").toLowerCase().includes(q)
        || (d.bio||"").toLowerCase().includes(q);
      const matchSpec = activeSpec === "All" || d.specialization === activeSpec;
      return matchSearch && matchSpec;
    });
  }, [doctors, search, activeSpec]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior: smooth; }

        .pg { min-height:100vh; background:#fafaf8; font-family:'Plus Jakarta Sans',sans-serif; }

        /* ── Hero ── */
        .hero {
          background: #0c1220;
          padding: 72px 40px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content:'';
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 70% 70% at 30% 50%, rgba(99,102,241,.25) 0%,transparent 65%),
            radial-gradient(ellipse 50% 50% at 75% 30%, rgba(236,72,153,.15) 0%,transparent 60%);
          pointer-events:none;
        }
        .hero-lines {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size: 40px 40px;
        }
        .hero-tag {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(99,102,241,.18); border:1px solid rgba(99,102,241,.35);
          color:#a5b4fc; border-radius:20px; padding:5px 14px;
          font-size:12px; font-weight:600; letter-spacing:.5px;
          margin-bottom:20px; position:relative;
        }
        .hero h1 {
          font-family:'Fraunces',serif; font-size:clamp(36px,6vw,64px);
          color:#fff; font-weight:800; line-height:1.05;
          position:relative; margin-bottom:16px;
        }
        .hero h1 em { font-style:normal; color:#a5b4fc; }
        .hero-sub { font-size:16px; color:rgba(255,255,255,.45); font-weight:300; max-width:480px; margin:0 auto 36px; line-height:1.7; position:relative; }

        /* Search bar */
        .search-wrap { position:relative; max-width:480px; margin:0 auto; }
        .search-icon { position:absolute; left:18px; top:50%; transform:translateY(-50%); font-size:16px; }
        .search-input {
          width:100%; padding:16px 20px 16px 48px;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
          border-radius:16px; color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:15px; outline:none; backdrop-filter:blur(12px); transition:all .2s;
        }
        .search-input::placeholder { color:rgba(255,255,255,.3); }
        .search-input:focus { border-color:rgba(99,102,241,.6); background:rgba(99,102,241,.1); box-shadow:0 0 0 3px rgba(99,102,241,.2); }

        /* ── Stats strip ── */
        .stats-strip {
          background:#fff; border-bottom:1px solid #f0f0ee;
          display:flex; justify-content:center; gap:60px; padding:20px 40px;
          flex-wrap:wrap;
        }
        .stat-item { text-align:center; }
        .stat-num { font-family:'Fraunces',serif; font-size:28px; font-weight:700; color:#0c1220; }
        .stat-lbl { font-size:12px; color:#888; font-weight:500; margin-top:2px; }

        /* ── Body ── */
        .body { max-width:1200px; margin:0 auto; padding:48px 24px 80px; }

        /* Filter pills */
        .filter-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:32px; align-items:center; }
        .filter-pill {
          padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600;
          cursor:pointer; transition:all .2s; border:1.5px solid;
          font-family:'Plus Jakarta Sans',sans-serif; white-space:nowrap;
        }
        .filter-pill.on  { background:#0c1220; border-color:#0c1220; color:#fff; }
        .filter-pill.off { background:#fff; border-color:#e8e8e4; color:#666; }
        .filter-pill.off:hover { border-color:#0c1220; color:#0c1220; }
        .filter-count { margin-left:auto; font-size:13px; color:#888; }

        /* View toggle */
        .view-toggle { display:flex; gap:4px; background:#f0f0ee; padding:4px; border-radius:10px; margin-left:8px; }
        .view-btn { padding:5px 10px; border-radius:7px; border:none; cursor:pointer; font-size:13px; background:transparent; transition:all .2s; }
        .view-btn.on { background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.1); }

        /* Section header */
        .sec-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .sec-title { font-family:'Fraunces',serif; font-size:22px; color:#0c1220; font-weight:600; }

        /* ── GRID Cards ── */
        .doctor-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }

        .doc-card {
          background:#fff; border-radius:20px; border:1.5px solid #f0f0ee;
          overflow:hidden; cursor:pointer; transition:all .25s;
          box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .doc-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.1); border-color:#e0e0dc; }

        .doc-card-top {
          padding:24px 24px 0; display:flex; flex-direction:column; align-items:center; text-align:center;
        }
        .doc-avatar-wrap { position:relative; margin-bottom:14px; }
        .doc-avatar {
          width:72px; height:72px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:24px; font-weight:700; color:#fff; letter-spacing:.5px;
        }
        .doc-avatar-ring {
          position:absolute; inset:-3px; border-radius:50%; border:2px solid; opacity:.3;
        }
        .doc-spec-icon {
          position:absolute; bottom:-2px; right:-2px;
          width:24px; height:24px; border-radius:50%;
          background:#fff; display:flex; align-items:center; justify-content:center; font-size:12px;
          box-shadow:0 2px 6px rgba(0,0,0,.15);
        }
        .doc-name { font-family:'Fraunces',serif; font-size:17px; font-weight:600; color:#0c1220; margin-bottom:4px; }
        .doc-spec-pill {
          display:inline-block; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600;
          border:1px solid; margin-bottom:10px; letter-spacing:.3px;
        }
        .doc-qual { font-size:12px; color:#888; margin-bottom:16px; }

        .doc-card-divider { height:1px; background:#f5f5f3; margin:0 24px; }

        .doc-card-stats {
          display:grid; grid-template-columns:1fr 1fr 1fr; padding:16px 20px;
          text-align:center; gap:0;
        }
        .doc-stat { border-right:1px solid #f0f0ee; }
        .doc-stat:last-child { border-right:none; }
        .doc-stat-val { font-family:'Fraunces',serif; font-size:16px; font-weight:700; color:#0c1220; }
        .doc-stat-lbl { font-size:10px; color:#aaa; font-weight:500; margin-top:2px; text-transform:uppercase; letter-spacing:.4px; }

        .doc-card-footer { padding:0 20px 20px; }
        .book-btn {
          width:100%; padding:11px; border-radius:12px; border:none;
          background:#0c1220; color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:13px; font-weight:700; cursor:pointer; transition:all .2s;
          letter-spacing:.3px;
        }
        .book-btn:hover { background:#1e293b; transform:none; }

        /* ── LIST view ── */
        .doctor-list { display:flex; flex-direction:column; gap:14px; }
        .doc-row {
          background:#fff; border-radius:16px; border:1.5px solid #f0f0ee;
          padding:20px 24px; display:flex; align-items:center; gap:20px;
          cursor:pointer; transition:all .2s; box-shadow:0 1px 4px rgba(0,0,0,.04);
        }
        .doc-row:hover { border-color:#e0e0dc; box-shadow:0 6px 20px rgba(0,0,0,.08); }
        .doc-row-avatar { width:54px; height:54px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:#fff; flex-shrink:0; }
        .doc-row-info { flex:1; min-width:0; }
        .doc-row-name { font-family:'Fraunces',serif; font-size:16px; font-weight:600; color:#0c1220; }
        .doc-row-meta { font-size:13px; color:#888; margin-top:3px; }
        .doc-row-right { display:flex; align-items:center; gap:24px; flex-shrink:0; }
        .doc-row-stat { text-align:center; }
        .doc-row-stat-val { font-family:'Fraunces',serif; font-size:16px; font-weight:700; color:#0c1220; }
        .doc-row-stat-lbl { font-size:10px; color:#aaa; text-transform:uppercase; letter-spacing:.4px; }

        /* ── Detail Modal ── */
        .modal-bg {
          position:fixed; inset:0; background:rgba(12,18,32,.7); backdrop-filter:blur(8px);
          z-index:1000; display:flex; align-items:center; justify-content:center; padding:24px;
          animation:fadeIn .2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal {
          background:#fff; border-radius:24px; max-width:580px; width:100%;
          max-height:90vh; overflow-y:auto;
          box-shadow:0 40px 100px rgba(0,0,0,.3);
          animation:scaleIn .25s ease;
        }
        @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }

        .modal-top {
          padding:32px 32px 24px;
          display:flex; gap:20px; align-items:flex-start;
          border-bottom:1px solid #f0f0ee;
        }
        .modal-avatar { width:80px; height:80px; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; color:#fff; flex-shrink:0; }
        .modal-name { font-family:'Fraunces',serif; font-size:24px; font-weight:700; color:#0c1220; margin-bottom:6px; }
        .modal-close { margin-left:auto; width:36px; height:36px; border:1.5px solid #f0f0ee; background:#fff; border-radius:10px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; }
        .modal-close:hover { background:#f5f5f3; }

        .modal-body { padding:24px 32px 32px; }
        .modal-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; }
        .modal-stat { background:#f8f8f6; border-radius:12px; padding:14px; text-align:center; }
        .modal-stat-val { font-family:'Fraunces',serif; font-size:20px; font-weight:700; color:#0c1220; }
        .modal-stat-lbl { font-size:11px; color:#888; margin-top:3px; text-transform:uppercase; letter-spacing:.4px; }

        .modal-section-title { font-size:11px; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:.8px; margin:20px 0 10px; }
        .modal-bio { font-size:14px; color:#555; line-height:1.7; }
        .modal-days { display:flex; flex-wrap:wrap; gap:6px; }
        .modal-day { padding:5px 12px; border-radius:8px; background:#f0f0ee; font-size:12px; font-weight:600; color:#444; }
        .modal-info-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f5f5f3; font-size:14px; }
        .modal-info-label { color:#888; }
        .modal-info-val { font-weight:600; color:#0c1220; }

        .modal-book-btn {
          width:100%; padding:14px; border-radius:14px; border:none; margin-top:20px;
          background:#0c1220; color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:15px; font-weight:700; cursor:pointer; transition:all .2s; letter-spacing:.3px;
        }
        .modal-book-btn:hover { background:#1e293b; }

        /* ── Empty ── */
        .empty { text-align:center; padding:80px 0; }
        .empty-icon { font-size:56px; margin-bottom:16px; }
        .empty-title { font-family:'Fraunces',serif; font-size:22px; color:#0c1220; margin-bottom:8px; }
        .empty-sub { font-size:14px; color:#888; }

        /* ── Skeleton ── */
        .skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        .skeleton-card { background:#fff; border-radius:20px; height:320px; overflow:hidden; }
        .skeleton-shine { height:100%; background:linear-gradient(90deg,#f5f5f3 25%,#efefed 50%,#f5f5f3 75%); background-size:200%; animation:shine 1.4s infinite; }
        @keyframes shine { from{background-position:200%} to{background-position:-200%} }

        @media (max-width:640px) {
          .hero { padding:48px 20px 60px; }
          .stats-strip { gap:30px; }
          .body { padding:32px 16px 60px; }
          .doc-row-right { gap:14px; }
          .modal-top { flex-direction:column; }
          .modal-close { position:absolute; top:20px; right:20px; }
          .modal { border-radius:20px; }
        }
      `}</style>

      <div className="pg">

        {/* ── Hero ── */}
        <div className="hero">
          <div className="hero-lines" />
          <div className="hero-tag">🏥 Find Your Doctor</div>
          <h1>Meet Our <em>Expert</em><br />Medical Team</h1>
          <p className="hero-sub">
            World-class physicians across 28 specializations, dedicated to your health and wellbeing.
          </p>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by name, specialty, or department…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Stats strip ── */}
        {!loading && (
          <div className="stats-strip">
            {[
              [doctors.length, "Specialist Doctors"],
              [new Set(doctors.map(d=>d.specialization)).size, "Specializations"],
              [Math.round(doctors.reduce((s,d)=>s+(d.experience||0),0)/(doctors.length||1)), "Avg. Years Exp"],
              [doctors.filter(d=>d.availableDays.includes("Saturday")||d.availableDays.includes("Sunday")).length, "Weekend Available"],
            ].map(([n,l])=>(
              <div key={l} className="stat-item">
                <div className="stat-num">{n}+</div>
                <div className="stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Body ── */}
        <div className="body">

          {/* Filter bar */}
          <div className="filter-bar">
            {specializations.map(s => (
              <button key={s} className={`filter-pill ${activeSpec===s?"on":"off"}`} onClick={()=>setActiveSpec(s)}>
                {s !== "All" && (SPEC_ICONS[s]||"🩺")+" "}{s}
              </button>
            ))}
            <span className="filter-count">{filtered.length} doctor{filtered.length!==1?"s":""}</span>
            <div className="view-toggle">
              <button className={`view-btn ${view==="grid"?"on":""}`} onClick={()=>setView("grid")}>⊞</button>
              <button className={`view-btn ${view==="list"?"on":""}`} onClick={()=>setView("list")}>☰</button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="skeleton-grid">
              {[1,2,3,4,5,6].map(i=>(
                <div key={i} className="skeleton-card"><div className="skeleton-shine" /></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🩺</div>
              <div className="empty-title">No doctors found</div>
              <div className="empty-sub">Try adjusting your search or filter</div>
            </div>
          ) : view === "grid" ? (
            <div className="doctor-grid">
              {filtered.map(doc => <DoctorCard key={doc._id} doc={doc} onClick={()=>setSelected(doc)} />)}
            </div>
          ) : (
            <div className="doctor-list">
              {filtered.map(doc => <DoctorListRow key={doc._id} doc={doc} onClick={()=>setSelected(doc)} />)}
            </div>
          )}
        </div>

        {/* ── Detail Modal ── */}
        {selected && <DoctorModal doc={selected} onClose={()=>setSelected(null)} />}
      </div>
    </>
  );
}

/* ── Card Component ─────────────────────────────────────────── */
function DoctorCard({ doc, onClick }) {
  const color = SPEC_COLORS[doc.specialization] || "#6366f1";
  const bg    = avatarColor(doc.name);
  return (
    <div className="doc-card" onClick={onClick}>
      <div className="doc-card-top">
        <div className="doc-avatar-wrap">
          <div className="doc-avatar" style={{background:bg}}>{initials(doc.name)}</div>
          <div className="doc-avatar-ring" style={{borderColor:color}} />
          <div className="doc-spec-icon">{SPEC_ICONS[doc.specialization]||"🩺"}</div>
        </div>
        <div className="doc-name">Dr. {doc.name}</div>
        <div className="doc-spec-pill" style={{background:color+"15",color,borderColor:color+"40"}}>{doc.specialization}</div>
        <div className="doc-qual">{doc.qualification}</div>
      </div>
      <div className="doc-card-divider" />
      <div className="doc-card-stats">
        <div className="doc-stat">
          <div className="doc-stat-val">{doc.experience}y</div>
          <div className="doc-stat-lbl">Experience</div>
        </div>
        <div className="doc-stat">
          <div className="doc-stat-val">${doc.consultationFee}</div>
          <div className="doc-stat-lbl">Fee</div>
        </div>
        <div className="doc-stat">
          <div className="doc-stat-val">{doc.availableDays.length}d</div>
          <div className="doc-stat-lbl">Per Week</div>
        </div>
      </div>
      <div className="doc-card-footer">
        <button className="book-btn" onClick={e=>{e.stopPropagation();onClick();}}>View Profile & Book →</button>
      </div>
    </div>
  );
}

/* ── List Row ───────────────────────────────────────────────── */
function DoctorListRow({ doc, onClick }) {
  const color = SPEC_COLORS[doc.specialization] || "#6366f1";
  const bg    = avatarColor(doc.name);
  return (
    <div className="doc-row" onClick={onClick}>
      <div className="doc-row-avatar" style={{background:bg}}>{initials(doc.name)}</div>
      <div className="doc-row-info">
        <div className="doc-row-name">Dr. {doc.name}</div>
        <div className="doc-row-meta">
          <span style={{display:"inline-block",background:color+"15",color,border:`1px solid ${color}30`,borderRadius:10,padding:"1px 8px",fontSize:11,fontWeight:600,marginRight:8}}>{doc.specialization}</span>
          {doc.department || doc.qualification}
        </div>
      </div>
      <div className="doc-row-right">
        <div className="doc-row-stat"><div className="doc-row-stat-val">{doc.experience}y</div><div className="doc-row-stat-lbl">Exp</div></div>
        <div className="doc-row-stat"><div className="doc-row-stat-val">${doc.consultationFee}</div><div className="doc-row-stat-lbl">Fee</div></div>
        <div className="doc-row-stat">
          <div style={{padding:"7px 14px",borderRadius:10,border:"1.5px solid #0c1220",color:"#0c1220",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>View →</div>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Modal ───────────────────────────────────────────── */
function DoctorModal({ doc, onClose }) {
  const color = SPEC_COLORS[doc.specialization] || "#6366f1";
  const bg    = avatarColor(doc.name);
  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-top">
          <div className="modal-avatar" style={{background:bg}}>{initials(doc.name)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div className="modal-name">Dr. {doc.name}</div>
            <div style={{display:"inline-block",background:color+"15",color,border:`1px solid ${color}40`,borderRadius:12,padding:"3px 10px",fontSize:12,fontWeight:600,marginBottom:6}}>{doc.specialization}</div>
            <div style={{fontSize:13,color:"#888"}}>{doc.qualification} &nbsp;·&nbsp; {doc.department||"General"}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Stats */}
          <div className="modal-stats">
            {[["$"+doc.consultationFee,"Consultation"],[(doc.experience||0)+"+ yrs","Experience"],[doc.availableDays.length+" days","Per Week"]].map(([v,l])=>(
              <div key={l} className="modal-stat"><div className="modal-stat-val">{v}</div><div className="modal-stat-lbl">{l}</div></div>
            ))}
          </div>

          {/* Bio */}
          {doc.bio && (<><div className="modal-section-title">About</div><p className="modal-bio">{doc.bio}</p></>)}

          {/* Info */}
          <div className="modal-section-title">Details</div>
          {[
            ["License","licenseNumber"],["Phone","phone"],
            ["Email","email"],
            ["Hours", doc.consultationHours?.start + " – " + doc.consultationHours?.end],
          ].map(([label, val]) => (
            <div key={label} className="modal-info-row">
              <span className="modal-info-label">{label}</span>
              <span className="modal-info-val">{typeof val==="string"&&!val.includes("–")?doc[val]||"—":val}</span>
            </div>
          ))}

          {/* Available days */}
          <div className="modal-section-title">Available Days</div>
          <div className="modal-days">
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=>(
              <span key={d} className="modal-day" style={doc.availableDays.includes(d)?{background:color+"15",color,border:`1px solid ${color}30`}:{}}>{d}</span>
            ))}
          </div>

          <button className="modal-book-btn" onClick={()=>alert(`Booking with Dr. ${doc.name}`)}>
            📅 Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}