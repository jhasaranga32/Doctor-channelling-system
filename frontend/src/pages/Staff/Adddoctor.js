// pages/AddDoctor.jsx  (or components/AddDoctor.jsx)
// Connects to: POST /api/doctors
// Light theme — inline Tailwind CSS only

import { useState } from "react";
import { userAPI } from "../../utils/api";

const SPECIALIZATIONS = [
  "Cardiology","Dermatology","Endocrinology","Gastroenterology",
  "General Practice","Geriatrics","Gynecology & Obstetrics","Hematology",
  "Infectious Disease","Internal Medicine","Nephrology","Neurology",
  "Oncology","Ophthalmology","Orthopedics","Otolaryngology (ENT)",
  "Pathology","Pediatrics","Psychiatry","Pulmonology","Radiology",
  "Rheumatology","Surgery (General)","Surgery (Cardiothoracic)",
  "Surgery (Neurosurgery)","Surgery (Orthopedic)","Surgery (Plastic)","Urology",
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const INIT = {
  name:"", email:"", password:"", confirmPassword:"",
  specialization:"", licenseNumber:"", qualification:"",
  experience:"", phone:"", department:"", consultationFee:"",
  bio:"", status:"active",
  availableDays:["Monday","Tuesday","Wednesday","Thursday","Friday"],
  consultationHours:{ start:"09:00", end:"17:00" },
};

const STEPS = ["Personal Info", "Professional", "Schedule & Fees"];

export default function AddDoctor({ onSuccess }) {
  const [form, setForm]       = useState(INIT);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [step, setStep]       = useState(1);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };
  const setHours = (k, v) => setForm(f => ({ ...f, consultationHours: { ...f.consultationHours, [k]: v } }));
  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(d)
        ? f.availableDays.filter(x => x !== d)
        : [...f.availableDays, d],
    }));
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim())   e.name    = "Full name is required";
      if (!form.email.trim())  e.email   = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
      if (!form.phone.trim())  e.phone   = "Phone number is required";
      if (!form.password)      e.password = "Password is required";
      else if (form.password.length < 8) e.password = "Minimum 8 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    if (s === 2) {
      if (!form.specialization)        e.specialization = "Select a specialization";
      if (!form.licenseNumber.trim())  e.licenseNumber  = "License number is required";
      if (!form.qualification.trim())  e.qualification  = "Qualification is required";
      if (form.experience === "" || Number(form.experience) < 0) e.experience = "Valid experience required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      const nameParts = form.name.trim().split(' ');
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.length ? nameParts.join(' ') : '';

      const doctorDetails = {
        specialization: form.specialization,
        qualifications: form.qualification
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        licenseNumber: form.licenseNumber,
        yearsOfExperience: Number(form.experience) || 0,
        department: form.department,
        consultationFee: Number(form.consultationFee) || 0,
        bio: form.bio,
        availableSlots: form.availableDays.map((day) => ({
          day,
          startTime: form.consultationHours.start,
          endTime: form.consultationHours.end,
        })),
      };

      const payload = {
        firstName,
        lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        doctorDetails,
      };

      const res = await userAPI.createDoctor(payload);
      showToast('Doctor created successfully!');
      setForm(INIT);
      setStep(1);
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const progressPct = `${((step - 1) / (STEPS.length - 1)) * 100}%`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">

      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">

        {/* Top accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500" />

        <div className="p-8 sm:p-10">

          {/* Header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-700 tracking-widest uppercase px-3 py-1.5 rounded-full border border-indigo-100 mb-4">
              🩺 Staff Portal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Register New Doctor
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-normal">
              Complete all three steps to onboard a new physician.
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {/* track */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 z-0" />
              {/* fill */}
              <div
                className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 z-0 transition-all duration-500"
                style={{ width: progressPct }}
              />
              {STEPS.map((label, i) => {
                const n = i + 1;
                const done   = n < step;
                const active = n === step;
                return (
                  <div key={n} className="flex flex-col items-center gap-2 z-10">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${done   ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"   : ""}
                      ${active ? "bg-white text-indigo-600 border-2 border-indigo-500 shadow-md shadow-indigo-100" : ""}
                      ${!done && !active ? "bg-white text-slate-300 border-2 border-slate-200" : ""}
                    `}>
                      {done ? "✓" : n}
                    </div>
                    <span className={`
                      text-xs font-semibold whitespace-nowrap
                      ${active ? "text-indigo-600" : done ? "text-slate-400" : "text-slate-300"}
                    `}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required error={errors.name}>
                  <input
                    className={inputCls(errors.name)}
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="e.g. Sarah Mitchell"
                  />
                </Field>
                <Field label="Phone" required error={errors.phone}>
                  <input
                    className={inputCls(errors.phone)}
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="+1-555-0100"
                  />
                </Field>
              </div>

              <Field label="Email Address" required error={errors.email}>
                <input
                  className={inputCls(errors.email)}
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="doctor@hospital.com"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Password" required error={errors.password}>
                  <PasswordField
                    value={form.password}
                    onChange={v => set("password", v)}
                    error={errors.password}
                    placeholder="Min 8 characters"
                  />
                </Field>
                <Field label="Confirm Password" required error={errors.confirmPassword}>
                  <PasswordField
                    value={form.confirmPassword}
                    onChange={v => set("confirmPassword", v)}
                    error={errors.confirmPassword}
                    placeholder="Re-enter password"
                  />
                </Field>
              </div>

              <div>
                <SectionLabel>Account Status</SectionLabel>
                <div className="flex gap-3 mt-3">
                  {[
                    { val: "active",   label: "Active",   dot: "bg-emerald-500", sel: "border-emerald-400 bg-emerald-50 text-emerald-700" },
                    { val: "inactive", label: "Inactive", dot: "bg-red-400",     sel: "border-red-400 bg-red-50 text-red-700" },
                    { val: "on_leave", label: "On Leave", dot: "bg-amber-400",   sel: "border-amber-400 bg-amber-50 text-amber-700" },
                  ].map(({ val, label, dot, sel }) => (
                    <button
                      key={val}
                      onClick={() => set("status", val)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-150
                        ${form.status === val ? sel : "border-slate-200 text-slate-400 bg-white hover:border-slate-300"}
                      `}
                    >
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Professional ── */}
          {step === 2 && (
            <div className="space-y-5">
              <Field label="Specialization" required error={errors.specialization}>
                <select
                  className={inputCls(errors.specialization)}
                  value={form.specialization}
                  onChange={e => set("specialization", e.target.value)}
                >
                  <option value="">— Select Specialization —</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="License Number" required error={errors.licenseNumber}>
                  <input
                    className={inputCls(errors.licenseNumber)}
                    value={form.licenseNumber}
                    onChange={e => set("licenseNumber", e.target.value)}
                    placeholder="MED-2024-001"
                  />
                </Field>
                <Field label="Qualification" required error={errors.qualification}>
                  <input
                    className={inputCls(errors.qualification)}
                    value={form.qualification}
                    onChange={e => set("qualification", e.target.value)}
                    placeholder="e.g. MBBS, MD"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Experience (Years)" required error={errors.experience}>
                  <input
                    className={inputCls(errors.experience)}
                    type="number" min="0" max="60"
                    value={form.experience}
                    onChange={e => set("experience", e.target.value)}
                    placeholder="e.g. 10"
                  />
                </Field>
                <Field label="Department">
                  <input
                    className={inputCls()}
                    value={form.department}
                    onChange={e => set("department", e.target.value)}
                    placeholder="e.g. Cardiac Care Unit"
                  />
                </Field>
              </div>

              <Field label="Bio / About">
                <textarea
                  className={`${inputCls()} resize-none min-h-[90px]`}
                  value={form.bio}
                  maxLength={500}
                  onChange={e => set("bio", e.target.value)}
                  placeholder="Short professional summary…"
                />
                <p className="text-right text-xs text-slate-300 mt-1">{form.bio.length}/500</p>
              </Field>
            </div>
          )}

          {/* ── STEP 3: Schedule & Fees ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <SectionLabel>Available Days</SectionLabel>
                <div className="flex flex-wrap gap-2 mt-3">
                  {DAYS.map(d => {
                    const on = form.availableDays.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`
                          px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-150
                          ${on
                            ? "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm"
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                          }
                        `}
                      >
                        {d.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Consultation Start">
                  <input
                    className={inputCls()}
                    type="time"
                    value={form.consultationHours.start}
                    onChange={e => setHours("start", e.target.value)}
                  />
                </Field>
                <Field label="Consultation End">
                  <input
                    className={inputCls()}
                    type="time"
                    value={form.consultationHours.end}
                    onChange={e => setHours("end", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Consultation Fee ($)">
                <input
                  className={inputCls()}
                  type="number" min="0"
                  value={form.consultationFee}
                  onChange={e => set("consultationFee", e.target.value)}
                  placeholder="e.g. 150"
                />
              </Field>

              {/* Summary preview */}
              <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-5 mt-2">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Summary Preview</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    ["Name",           `Dr. ${form.name || "—"}`],
                    ["Specialization", form.specialization || "—"],
                    ["Email",          form.email || "—"],
                    ["License",        form.licenseNumber || "—"],
                    ["Experience",     form.experience ? `${form.experience} yrs` : "—"],
                    ["Fee",            form.consultationFee ? `$${form.consultationFee}` : "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-slate-400 mb-0.5">{k}</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-500 text-sm font-semibold hover:border-slate-300 hover:text-slate-700 transition-all duration-150"
              >
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-150"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating Doctor…
                  </span>
                ) : "✓ Create Doctor"}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`
          fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-xl
          animate-[slideUp_0.3s_ease]
          ${toast.type === "success"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-emerald-100"
            : "bg-red-50 border border-red-200 text-red-700 shadow-red-100"
          }
        `}>
          <span className="text-base">{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Shared helpers ── */

function inputCls(err) {
  return `
    w-full px-4 py-2.5 rounded-xl border text-sm text-slate-700 bg-white
    placeholder:text-slate-300 outline-none transition-all duration-150
    ${err
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
    }
  `;
}

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{children}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function PasswordField({ value, onChange, error, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        className={inputCls(error)}
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingRight: "2.75rem" }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors text-base leading-none"
      >
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}