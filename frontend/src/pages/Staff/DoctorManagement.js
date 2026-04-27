import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import StaffSidebar from '../../components/nav/sidebar';
import AddDoctor from './Adddoctor';

const SPECIALIZATIONS = [
  'Cardiology','Dermatology','Endocrinology','Gastroenterology','General Practice',
  'Geriatrics','Gynecology & Obstetrics','Hematology','Infectious Disease',
  'Internal Medicine','Nephrology','Neurology','Oncology','Ophthalmology',
  'Orthopedics','Otolaryngology (ENT)','Pathology','Pediatrics','Psychiatry',
  'Pulmonology','Radiology','Rheumatology','Surgery (General)','Surgery (Cardiothoracic)',
  'Surgery (Neurosurgery)','Surgery (Orthopedic)','Surgery (Plastic)','Urology',
];

const DoctorManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);

  // ── Edit state ──────────────────────────────────────────────
  const [editDoctor, setEditDoctor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // ── Delete state ────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const response = await userAPI.getAll({ role: 'doctor', limit: 100 });
      setDoctors(response.data?.users || []);
    } catch (error) {
      toast.error('Failed to fetch doctors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorAdded = () => { setShowAddForm(false); fetchDoctors(); };

  // ── Edit handlers ───────────────────────────────────────────
  const openEdit = (doctor) => {
    setEditDoctor(doctor);
    setEditForm({
      firstName:       doctor.firstName       || '',
      lastName:        doctor.lastName        || '',
      specialization:  doctor.doctorDetails?.specialization || '',
      licenseNumber:   doctor.doctorDetails?.licenseNumber || '',
      phone:           doctor.phone           || '',
      department:      doctor.doctorDetails?.department || '',
      qualification:   doctor.doctorDetails?.qualifications?.join(', ') || '',
      experience:      doctor.doctorDetails?.yearsOfExperience || '',
      isActive:        doctor.isActive       || true,
      bio:             doctor.doctorDetails?.bio || '',
    });
  };

  const closeEdit = () => { setEditDoctor(null); setEditForm({}); };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const payload = { ...editForm };
      delete payload.email;

      // Process qualifications
      if (payload.qualification) {
        payload.doctorDetails = {
          ...payload.doctorDetails,
          qualifications: payload.qualification.split(',').map(s => s.trim()).filter(Boolean),
        };
        delete payload.qualification;
      }
      // Move other fields to doctorDetails
      payload.doctorDetails = {
        ...payload.doctorDetails,
        specialization: payload.specialization,
        licenseNumber:  payload.licenseNumber,
        department:     payload.department,
        yearsOfExperience: Number(payload.experience) || 0,
        bio: payload.bio,
      };
      // Remove fields that are not in user schema
      delete payload.specialization;
      delete payload.licenseNumber;
      delete payload.department;
      delete payload.experience;
      delete payload.bio;

      const res = await userAPI.update(editDoctor._id, payload);
      toast.success('Doctor updated successfully');
      setDoctors(prev =>
        prev.map(d => d._id === editDoctor._id ? { ...d, ...res.data?.user } : d)
      );
      closeEdit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete handlers ─────────────────────────────────────────
  const openDelete  = (doctor) => setDeleteTarget(doctor);
  const closeDelete = () => setDeleteTarget(null);

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await userAPI.delete(deleteTarget._id);
      toast.success(`Dr. ${deleteTarget.firstName} ${deleteTarget.lastName} deleted`);
      setDoctors(prev => prev.filter(d => d._id !== deleteTarget._id));
      closeDelete();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
    return (
      fullName.toLowerCase().includes(q) ||
      doc.email?.toLowerCase().includes(q) ||
      doc.doctorDetails?.specialization?.toLowerCase().includes(q)
    );
  });

  const getInitials = (name, lastName) =>
    `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

  const avatarColors = ['#4f7cff','#ff6b6b','#43d99a','#f59e0b','#a78bfa','#ec4899','#06b6d4','#84cc16'];
  const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) ?? 0) % avatarColors.length];

  if (loading) {
    return (
      <div style={{ display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
        <StaffSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
        <div style={{ flex: 1, marginLeft: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f9fc' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={styles.spinner} />
            <p style={{ color: '#94a3b8', marginTop: 16, fontSize: 14 }}>Loading doctors…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .dm-row { transition: background 0.15s ease; }
        .dm-row:hover { background: #f0f5ff !important; }
        .dm-add-btn { transition: background 0.18s, transform 0.15s, box-shadow 0.18s; }
        .dm-add-btn:hover { background: #2552e0 !important; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(79,124,255,0.35) !important; }
        .dm-action { transition: color 0.15s, background 0.15s, transform 0.12s; }
        .dm-action:hover { transform: translateY(-1px); }
        .dm-search:focus { border-color: #4f7cff !important; box-shadow: 0 0 0 3px rgba(79,124,255,0.15) !important; }
        .edit-input { transition: border-color 0.18s, box-shadow 0.18s; }
        .edit-input:focus { border-color: #4f7cff !important; box-shadow: 0 0 0 3px rgba(79,124,255,0.12) !important; outline: none; }
      `}</style>

      <div style={{ display:'flex', fontFamily:"'DM Sans', sans-serif", minHeight:'100vh', background:'#f8f9fc' }}>
        <StaffSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />

        <main style={{ flex:1, marginLeft:256, padding:'40px 44px', animation:'fadeUp 0.45s ease both' }}>

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
            <div>
              <p style={{ color:'#94a3b8', fontSize:13, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 4px' }}>Staff Portal</p>
              <h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:30, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.02em' }}>Doctor Management</h1>
            </div>
            <button className="dm-add-btn" onClick={() => setShowAddForm(true)}
              style={{ background:'#4f7cff', color:'#fff', border:'none', borderRadius:12, padding:'12px 22px', fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 14px rgba(79,124,255,0.25)', fontFamily:"'DM Sans', sans-serif" }}>
              <span style={{ fontSize:18, lineHeight:1 }}>+</span> Add Doctor
            </button>
          </div>

          {/* Stats strip */}
          <div style={{ display:'flex', gap:16, marginBottom:28 }}>
            {[
              { label:'Total Doctors', value:doctors.length,                                    color:'#4f7cff', bg:'#eef2ff' },
              { label:'Active',        value:doctors.filter(d => d.isActive).length,  color:'#22c55e', bg:'#f0fdf4' },
              { label:'Inactive',      value:doctors.filter(d => !d.isActive).length,  color:'#f43f5e', bg:'#fff1f2' },
            ].map((stat) => (
              <div key={stat.label} style={{ background:'#fff', borderRadius:14, padding:'16px 24px', flex:1, boxShadow:'0 1px 4px rgba(15,23,42,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #e8edf5' }}>
                <span style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>{stat.label}</span>
                <span style={{ fontSize:22, fontWeight:700, color:stat.color, background:stat.bg, borderRadius:8, padding:'2px 12px', fontFamily:"'Syne', sans-serif" }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position:'relative', marginBottom:20, maxWidth:340 }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:16, pointerEvents:'none' }}>🔍</span>
            <input className="dm-search" type="text" placeholder="Search by name, email, specialization…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width:'100%', padding:'10px 14px 10px 40px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:13, fontFamily:"'DM Sans', sans-serif", background:'#fff', color:'#0f172a', outline:'none', transition:'border-color 0.2s, box-shadow 0.2s', boxSizing:'border-box' }} />
          </div>

          {/* Table */}
          <div style={{ background:'#fff', borderRadius:18, boxShadow:'0 1px 6px rgba(15,23,42,0.08)', border:'1px solid #e8edf5', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8f9fc', borderBottom:'1.5px solid #e8edf5' }}>
                  {['Doctor','Email','Specialization','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 && (
                  <tr><td colSpan={5} style={{ padding:'48px 20px', textAlign:'center', color:'#94a3b8', fontSize:14 }}>No doctors found.</td></tr>
                )}
                {filteredDoctors.map((doctor, i) => {
                  const initials = getInitials(doctor.firstName, doctor.lastName);
                  const avatarBg = getAvatarColor(doctor.firstName);
                  const isActive = doctor.isActive;
                  return (
                    <tr key={doctor._id} className="dm-row"
                      onMouseEnter={() => setHoveredRow(doctor._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ borderBottom: i < filteredDoctors.length - 1 ? '1px solid #f1f5f9' : 'none', background:'#fff' }}>

                      <td style={{ padding:'14px 20px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:38, height:38, borderRadius:10, background:avatarBg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>{initials}</div>
                          <span style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>Dr. {doctor.firstName} {doctor.lastName}</span>
                        </div>
                      </td>

                      <td style={{ padding:'14px 20px' }}>
                        <span style={{ fontSize:13, color:'#475569' }}>{doctor.email}</span>
                      </td>

                      <td style={{ padding:'14px 20px' }}>
                        <span style={{ fontSize:12, fontWeight:600, color:'#4f7cff', background:'#eef2ff', borderRadius:6, padding:'3px 10px' }}>{doctor.doctorDetails?.specialization ?? '—'}</span>
                      </td>

                      <td style={{ padding:'14px 20px' }}>
                        <span style={{ fontSize:12, fontWeight:600, color: isActive ? '#16a34a' : '#dc2626', background: isActive ? '#f0fdf4' : '#fff1f2', borderRadius:20, padding:'4px 12px', display:'inline-flex', alignItems:'center', gap:5 }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background: isActive ? '#22c55e' : '#f43f5e', display:'inline-block' }} />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td style={{ padding:'14px 20px' }}>
                        <div style={{ display:'flex', gap:8 }}>
                          <button className="dm-action" onClick={() => openEdit(doctor)}
                            style={{ background:'#f0f5ff', color:'#4f7cff', border:'none', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>
                            Edit
                          </button>
                          <button className="dm-action" onClick={() => openDelete(doctor)}
                            style={{ background:'#fff1f2', color:'#f43f5e', border:'none', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding:'12px 20px', borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, color:'#94a3b8' }}>
                Showing <b style={{ color:'#475569' }}>{filteredDoctors.length}</b> of <b style={{ color:'#475569' }}>{doctors.length}</b> doctors
              </span>
            </div>
          </div>
        </main>

        {/* ── Add Modal (unchanged) ── */}
        {showAddForm && (
          <div style={styles.overlay}>
            <div style={styles.modalBox}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <h2 style={styles.modalTitle}>Add New Doctor</h2>
                <button onClick={() => setShowAddForm(false)} style={styles.closeBtn}>✕</button>
              </div>
              <AddDoctor onSuccess={handleDoctorAdded} />
            </div>
          </div>
        )}

        {/* ── Edit Modal ── */}
        {editDoctor && (
          <div style={styles.overlay}>
            <div style={{ ...styles.modalBox, maxWidth:640 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:getAvatarColor(editDoctor.firstName), display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13 }}>
                    {getInitials(editDoctor.firstName, editDoctor.lastName)}
                  </div>
                  <div>
                    <h2 style={styles.modalTitle}>Edit Doctor</h2>
                    <p style={{ margin:0, fontSize:12, color:'#94a3b8' }}>Dr. {editDoctor.firstName} {editDoctor.lastName}</p>
                  </div>
                </div>
                <button onClick={closeEdit} style={styles.closeBtn}>✕</button>
              </div>

              <form onSubmit={handleEditSave}>
                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.label}>Doctor Name</label>
                    <div style={{ ...styles.input, background: '#f8fafc', color: '#475569', minHeight: 44, display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0' }}>
                      Dr. {editDoctor.firstName} {editDoctor.lastName}
                    </div>
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.label}>Email</label>
                    <input className="edit-input" style={{ ...styles.input, background: '#f8fafc', cursor: 'not-allowed' }} type="email"
                      value={editDoctor.email} readOnly placeholder="Email address" />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.label}>Phone</label>
                    <input className="edit-input" style={styles.input} value={editForm.phone}
                      onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0100" />
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.label}>Specialization</label>
                    <select className="edit-input" style={{ ...styles.input, appearance:'none', cursor:'pointer' }} value={editForm.specialization}
                      onChange={e => setEditForm(f => ({ ...f, specialization: e.target.value }))}>
                      <option value="">— Select —</option>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.label}>License Number</label>
                    <input className="edit-input" style={styles.input} value={editForm.licenseNumber}
                      onChange={e => setEditForm(f => ({ ...f, licenseNumber: e.target.value }))} placeholder="e.g. SLMC-12345" />
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.label}>Department</label>
                    <input className="edit-input" style={styles.input} value={editForm.department}
                      onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Cardiac Care" />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.label}>Qualification</label>
                    <input className="edit-input" style={styles.input} value={editForm.qualification}
                      onChange={e => setEditForm(f => ({ ...f, qualification: e.target.value }))} placeholder="e.g. MBBS, MD" />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.label}>Experience (years)</label>
                    <input className="edit-input" style={styles.input} type="number" min="0" max="60" value={editForm.experience}
                      onChange={e => setEditForm(f => ({ ...f, experience: e.target.value }))} placeholder="e.g. 10" />
                  </div>
                </div>

                {/* Status toggle */}
                <div style={{ marginBottom:16 }}>
                  <label style={styles.label}>Status</label>
                  <div style={{ display:'flex', gap:10 }}>
                    {[
                      { val: true, label: '✅ Active', color: '#22c55e', bg: '#f0fdf4', textColor: '#16a34a' },
                      { val: false, label: '❌ Inactive', color: '#f43f5e', bg: '#fff1f2', textColor: '#dc2626' }
                    ].map(({ val, label, color, bg, textColor }) => (
                      <button key={String(val)} type="button" onClick={() => setEditForm(f => ({ ...f, isActive: val }))}
                        style={{ flex:1, padding:'9px 0', borderRadius:10, border:'1.5px solid', fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s',
                          borderColor: editForm.isActive === val ? color : '#e2e8f0',
                          background:  editForm.isActive === val ? bg  : '#fafafa',
                          color:       editForm.isActive === val ? textColor  : '#94a3b8',
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div style={{ marginBottom:20 }}>
                  <label style={styles.label}>Bio</label>
                  <textarea className="edit-input" maxLength={500}
                    style={{ ...styles.input, resize:'vertical', minHeight:80, lineHeight:1.6 }}
                    value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Short professional summary…" />
                  <p style={{ fontSize:11, color:'#94a3b8', margin:'4px 0 0', textAlign:'right' }}>{editForm.bio.length}/500</p>
                </div>

                <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
                  <button type="button" onClick={closeEdit}
                    style={{ padding:'10px 22px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={editSaving}
                    style={{ padding:'10px 28px', borderRadius:10, border:'none', background: editSaving ? '#93c5fd' : '#4f7cff', color:'#fff', fontWeight:700, fontSize:14, cursor: editSaving ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans', sans-serif", boxShadow:'0 4px 14px rgba(79,124,255,0.25)', transition:'background .2s' }}>
                    {editSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        {deleteTarget && (
          <div style={styles.overlay}>
            <div style={{ background:'#fff', borderRadius:20, padding:'36px 32px', maxWidth:420, width:'94%', boxShadow:'0 24px 64px rgba(15,23,42,0.2)', animation:'modalIn 0.22s cubic-bezier(0.22,1,0.36,1) both', textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'#fff1f2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 20px' }}>🗑</div>
              <h2 style={{ fontFamily:"'Syne', sans-serif", fontSize:20, fontWeight:800, color:'#0f172a', margin:'0 0 10px' }}>Delete Doctor?</h2>
              <p style={{ fontSize:14, color:'#64748b', lineHeight:1.6, margin:'0 0 28px' }}>
                You are about to permanently delete<br />
                <strong style={{ color:'#0f172a' }}>Dr. {deleteTarget.firstName} {deleteTarget.lastName}</strong>.<br />
                This action cannot be undone.
              </p>
              <div style={{ display:'flex', gap:12 }}>
                <button onClick={closeDelete} disabled={deleteLoading}
                  style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>
                  Cancel
                </button>
                <button onClick={handleDeleteConfirm} disabled={deleteLoading}
                  style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background: deleteLoading ? '#fca5a5' : '#f43f5e', color:'#fff', fontWeight:700, fontSize:14, cursor: deleteLoading ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans', sans-serif", boxShadow:'0 4px 14px rgba(244,63,94,0.3)', transition:'background .2s' }}>
                  {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  spinner: { width:36, height:36, border:'3px solid #e2e8f0', borderTop:'3px solid #4f7cff', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' },
  overlay: { position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 },
  modalBox: { background:'#fff', borderRadius:20, padding:'32px 36px', maxWidth:780, width:'94%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(15,23,42,0.2)', animation:'modalIn 0.25s cubic-bezier(0.22,1,0.36,1) both' },
  modalTitle: { fontFamily:"'Syne', sans-serif", fontSize:22, fontWeight:800, color:'#0f172a', margin:0 },
  closeBtn: { width:32, height:32, borderRadius:8, border:'none', background:'#f1f5f9', color:'#64748b', cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' },
  formRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 },
  formField: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em' },
  input: { padding:'10px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:13, fontFamily:"'DM Sans', sans-serif", color:'#0f172a', background:'#fff', width:'100%', boxSizing:'border-box' },
};

export default DoctorManagement;