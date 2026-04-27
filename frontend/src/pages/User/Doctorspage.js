
// pages/DoctorsPage.jsx
// Public-facing page: Users browse doctors by specialization, search, filter
// Connects to: GET /api/doctors  &  GET /api/doctors/specializations

import { useState, useEffect, useMemo } from "react";

const API_BASE = "/api";

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

const AVATAR_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316",
  "#eab308","#22c55e","#06b6d4","#3b82f6","#14b8a6","#f43f5e","#a855f7"
];

const normalizeDoctor = (doc) => {
  const availability = doc.doctorDetails?.availableSlots || doc.availableDays || [];
  return {
    ...doc,
    name: `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
    specialization: doc.doctorDetails?.specialization || doc.specialization || 'General Practice',
    qualification: (doc.doctorDetails?.qualifications || []).join(', ') || doc.qualification || 'N/A',
    experience: doc.doctorDetails?.yearsOfExperience ?? doc.experience ?? 0,
    consultationFee: doc.doctorDetails?.consultationFee ?? doc.consultationFee ?? 0,
    department: doc.doctorDetails?.department || doc.department || 'General',
    bio: doc.doctorDetails?.bio || doc.bio || '',
    licenseNumber: doc.doctorDetails?.licenseNumber || doc.licenseNumber || '',
    phone: doc.phone || '',
    availableDays: Array.isArray(availability)
      ? availability.map((slot) => slot.day || slot).filter(Boolean)
      : [],
    consultationHours: doc.doctorDetails?.availableSlots?.[0]
      ? { start: doc.doctorDetails.availableSlots[0].startTime, end: doc.doctorDetails.availableSlots[0].endTime }
      : doc.consultationHours || { start: '09:00', end: '17:00' },
  };
};

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
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

const initials = (n) =>
  n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function DoctorsPage() {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeSpec, setActiveSpec] = useState("All");
  const [selected, setSelected]     = useState(null);
  const [view, setView]             = useState("grid");

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_BASE}/users/doctors/public?limit=100`);
        const data = await res.json();
        setDoctors((data.doctors || []).map(normalizeDoctor));
      } catch {
        setDoctors(MOCK);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const specializations = useMemo(() => {
    const s = new Set(doctors.map((d) => d.specialization));
    return ["All", ...Array.from(s).sort()];
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        (d.department || "").toLowerCase().includes(q) ||
        (d.bio || "").toLowerCase().includes(q);
      const matchSpec = activeSpec === "All" || d.specialization === activeSpec;
      return matchSearch && matchSpec;
    });
  }, [doctors, search, activeSpec]);

  return (
    <div className="min-h-screen bg-[#fafaf8] font-sans">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-[#0c1220] px-6 py-20 text-center md:px-10 md:py-24">
        {/* grid lines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* gradient blobs */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 30% 50%,rgba(99,102,241,.25) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 75% 30%,rgba(236,72,153,.15) 0%,transparent 60%)",
          }}
        />

        {/* tag */}
        <div className="relative mb-5 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/35 bg-indigo-400/[.18] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-300">
          🏥 Find Your Doctor
        </div>

        <h1
          className="relative mb-4 text-4xl font-extrabold leading-tight text-white md:text-6xl"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Meet Our{" "}
          <em className="not-italic text-indigo-300">Expert</em>
          <br />
          Medical Team
        </h1>

        <p className="relative mx-auto mb-9 max-w-md text-base font-light leading-relaxed text-white/45">
          World-class physicians across 28 specializations, dedicated to your
          health and wellbeing.
        </p>

        {/* Search */}
        <div className="relative mx-auto max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
          <input
            className="w-full rounded-2xl border border-white/[.12] bg-white/[.07] py-4 pl-12 pr-5 font-sans text-[15px] text-white placeholder-white/30 outline-none backdrop-blur-md transition-all focus:border-indigo-500/60 focus:bg-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Search by name, specialty, or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Stats strip ── */}
      {!loading && (
        <div className="flex flex-wrap justify-center gap-10 border-b border-[#f0f0ee] bg-white px-10 py-5 md:gap-16">
          {[
            [doctors.length, "Specialist Doctors"],
            [new Set(doctors.map((d) => d.specialization)).size, "Specializations"],
            [
              Math.round(
                doctors.reduce((s, d) => s + (d.experience || 0), 0) /
                  (doctors.length || 1)
              ),
              "Avg. Years Exp",
            ],
            [
              doctors.filter(
                (d) =>
                  d.availableDays.includes("Saturday") ||
                  d.availableDays.includes("Sunday")
              ).length,
              "Weekend Available",
            ],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div
                className="text-3xl font-bold text-[#0c1220]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {n}+
              </div>
              <div className="mt-0.5 text-xs font-medium text-gray-400">{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Body ── */}
      <div className="mx-auto max-w-[1200px] px-6 py-12 pb-20 md:px-6">

        {/* Filter bar */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {specializations.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSpec(s)}
              className={`whitespace-nowrap rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-all ${
                activeSpec === s
                  ? "border-[#0c1220] bg-[#0c1220] text-white"
                  : "border-[#e8e8e4] bg-white text-gray-500 hover:border-[#0c1220] hover:text-[#0c1220]"
              }`}
            >
              {s !== "All" && (SPEC_ICONS[s] || "🩺") + " "}
              {s}
            </button>
          ))}

          <span className="ml-auto text-[13px] text-gray-400">
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""}
          </span>

          {/* View toggle */}
          <div className="ml-2 flex gap-1 rounded-[10px] bg-[#f0f0ee] p-1">
            <button
              onClick={() => setView("grid")}
              className={`rounded-[7px] px-2.5 py-1.5 text-[13px] transition-all ${
                view === "grid" ? "bg-white shadow-sm" : ""
              }`}
            >
              ⊞
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-[7px] px-2.5 py-1.5 text-[13px] transition-all ${
                view === "list" ? "bg-white shadow-sm" : ""
              }`}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 overflow-hidden rounded-[20px] bg-white">
                <div
                  className="h-full animate-pulse"
                  style={{
                    background:
                      "linear-gradient(90deg,#f5f5f3 25%,#efefed 50%,#f5f5f3 75%)",
                    backgroundSize: "200%",
                  }}
                />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-5xl">🩺</div>
            <div
              className="mb-2 text-2xl text-[#0c1220]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No doctors found
            </div>
            <div className="text-sm text-gray-400">
              Try adjusting your search or filter
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {filtered.map((doc) => (
              <DoctorCard key={doc._id} doc={doc} onClick={() => setSelected(doc)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filtered.map((doc) => (
              <DoctorListRow key={doc._id} doc={doc} onClick={() => setSelected(doc)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <DoctorModal doc={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Doctor Card (Grid)
// ─────────────────────────────────────────────────────────────────────────────
function DoctorCard({ doc, onClick }) {
  const color = SPEC_COLORS[doc.specialization] || "#6366f1";
  const bg    = avatarColor(doc.name);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-[20px] border-[1.5px] border-[#f0f0ee] bg-white shadow-[0_2px_8px_rgba(0,0,0,.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#e0e0dc] hover:shadow-[0_16px_40px_rgba(0,0,0,.10)]"
    >
      {/* Top */}
      <div className="flex flex-col items-center px-6 pt-6 text-center">
        {/* Avatar */}
        <div className="relative mb-3.5">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-2xl font-bold tracking-wide text-white"
            style={{ background: bg }}
          >
            {initials(doc.name)}
          </div>
          {/* ring */}
          <div
            className="absolute inset-[-3px] rounded-full border-2 opacity-30"
            style={{ borderColor: color }}
          />
          {/* icon badge */}
          <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-[0_2px_6px_rgba(0,0,0,.15)]">
            {SPEC_ICONS[doc.specialization] || "🩺"}
          </div>
        </div>

        <div
          className="mb-1 text-[17px] font-semibold text-[#0c1220]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Dr. {doc.name}
        </div>

        <span
          className="mb-2.5 inline-block rounded-xl border px-2.5 py-0.5 text-[11px] font-semibold tracking-[.3px]"
          style={{
            background: color + "15",
            color,
            borderColor: color + "40",
          }}
        >
          {doc.specialization}
        </span>

        <div className="mb-4 text-xs text-gray-400">{doc.qualification}</div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-[#f5f5f3]" />

      {/* Stats row */}
      <div className="grid grid-cols-3 px-5 py-4 text-center">
        {[
          [doc.experience + "y", "Experience"],
          ["$" + doc.consultationFee, "Fee"],
          [doc.availableDays.length + "d", "Per Week"],
        ].map(([val, lbl], i) => (
          <div
            key={lbl}
            className={`${i < 2 ? "border-r border-[#f0f0ee]" : ""}`}
          >
            <div
              className="text-base font-bold text-[#0c1220]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {val}
            </div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[.4px] text-gray-300">
              {lbl}
            </div>
          </div>
        ))}
      </div>

      {/* Footer button */}
      <div className="px-5 pb-5">
        <button
          className="w-full rounded-xl bg-[#0c1220] py-2.5 text-[13px] font-bold tracking-[.3px] text-white transition-colors hover:bg-[#1e293b]"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Profile &amp; Book →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Doctor List Row
// ─────────────────────────────────────────────────────────────────────────────
function DoctorListRow({ doc, onClick }) {
  const color = SPEC_COLORS[doc.specialization] || "#6366f1";
  const bg    = avatarColor(doc.name);

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-5 rounded-2xl border-[1.5px] border-[#f0f0ee] bg-white px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,.04)] transition-all hover:border-[#e0e0dc] hover:shadow-[0_6px_20px_rgba(0,0,0,.08)]"
    >
      {/* Avatar */}
      <div
        className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[14px] text-lg font-bold text-white"
        style={{ background: bg }}
      >
        {initials(doc.name)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div
          className="text-base font-semibold text-[#0c1220]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Dr. {doc.name}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[13px] text-gray-400">
          <span
            className="inline-block rounded-[10px] border px-2 py-0.5 text-[11px] font-semibold"
            style={{
              background: color + "15",
              color,
              borderColor: color + "30",
            }}
          >
            {doc.specialization}
          </span>
          {doc.department || doc.qualification}
        </div>
      </div>

      {/* Right stats */}
      <div className="flex shrink-0 items-center gap-6">
        {[
          [doc.experience + "y", "Exp"],
          ["$" + doc.consultationFee, "Fee"],
        ].map(([val, lbl]) => (
          <div key={lbl} className="text-center">
            <div
              className="text-base font-bold text-[#0c1220]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {val}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[.4px] text-gray-300">
              {lbl}
            </div>
          </div>
        ))}
        <div className="rounded-[10px] border-[1.5px] border-[#0c1220] px-3.5 py-1.5 text-xs font-bold text-[#0c1220]">
          View →
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Doctor Modal (Full Detail)
// ─────────────────────────────────────────────────────────────────────────────
function DoctorModal({ doc, onClose }) {
  const color = SPEC_COLORS[doc.specialization] || "#6366f1";
  const bg    = avatarColor(doc.name);
  const ALL_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0c1220]/70 p-6 backdrop-blur-[8px]"
      style={{ animation: "fadeIn .2s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes fadeIn  { from{opacity:0}              to{opacity:1}            }
        @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <div
        className="max-h-[90vh] w-full max-w-[580px] overflow-y-auto rounded-3xl bg-white shadow-[0_40px_100px_rgba(0,0,0,.3)]"
        style={{ animation: "scaleIn .25s ease" }}
      >
        {/* Modal top */}
        <div className="flex items-start gap-5 border-b border-[#f0f0ee] px-8 py-8">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] text-3xl font-bold text-white"
            style={{ background: bg }}
          >
            {initials(doc.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="mb-1.5 text-2xl font-bold text-[#0c1220]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Dr. {doc.name}
            </div>
            <span
              className="mb-1.5 inline-block rounded-xl border px-2.5 py-0.5 text-xs font-semibold"
              style={{
                background: color + "15",
                color,
                borderColor: color + "40",
              }}
            >
              {doc.specialization}
            </span>
            <div className="text-[13px] text-gray-400">
              {doc.qualification} &nbsp;·&nbsp; {doc.department || "General"}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-[#f0f0ee] bg-white text-base transition-colors hover:bg-[#f5f5f3]"
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div className="px-8 py-6">

          {/* Stats grid */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              ["$" + doc.consultationFee, "Consultation"],
              [(doc.experience || 0) + "+ yrs", "Experience"],
              [doc.availableDays.length + " days", "Per Week"],
            ].map(([val, lbl]) => (
              <div
                key={lbl}
                className="rounded-xl bg-[#f8f8f6] p-3.5 text-center"
              >
                <div
                  className="text-xl font-bold text-[#0c1220]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {val}
                </div>
                <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[.4px] text-gray-400">
                  {lbl}
                </div>
              </div>
            ))}
          </div>

          {/* Bio */}
          {doc.bio && (
            <>
              <div className="mb-2.5 mt-5 text-[11px] font-bold uppercase tracking-[.8px] text-gray-300">
                About
              </div>
              <p className="text-sm leading-relaxed text-gray-500">{doc.bio}</p>
            </>
          )}

          {/* Details */}
          <div className="mb-2.5 mt-5 text-[11px] font-bold uppercase tracking-[.8px] text-gray-300">
            Details
          </div>
          {[
            ["License",  doc.licenseNumber || "—"],
            ["Phone",    doc.phone         || "—"],
            ["Email",    doc.email         || "—"],
            ["Hours",    `${doc.consultationHours?.start} – ${doc.consultationHours?.end}`],
          ].map(([label, val]) => (
            <div
              key={label}
              className="flex justify-between border-b border-[#f5f5f3] py-2.5 text-sm"
            >
              <span className="text-gray-400">{label}</span>
              <span className="font-semibold text-[#0c1220]">{val}</span>
            </div>
          ))}

          {/* Available days */}
          <div className="mb-2.5 mt-5 text-[11px] font-bold uppercase tracking-[.8px] text-gray-300">
            Available Days
          </div>
          <div className="flex flex-wrap gap-1.5">
            {doc.availableDays.map((d) => (
              <span
                key={d}
                className="rounded-lg px-3 py-1 text-xs font-semibold"
                style={{ background: color + "15", color, border: `1px solid ${color}30` }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Book button */}
          <button
            className="mt-5 w-full rounded-[14px] bg-[#0c1220] py-3.5 text-[15px] font-bold tracking-[.3px] text-white transition-colors hover:bg-[#1e293b]"
            onClick={() => alert(`Booking with Dr. ${doc.name}`)}
          >
            📅 Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}