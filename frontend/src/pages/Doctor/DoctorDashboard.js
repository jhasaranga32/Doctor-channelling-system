import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone || '',
    doctorDetails: { ...user?.doctorDetails },
  });
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await appointmentAPI.getAll();
      setAppointments(res.data.appointments || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoadingAppts(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profileData);
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      toast.success('Password changed');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const TABS = [
    { id: 'overview', label: '🏠 Overview' },
    { id: 'appointments', label: '📅 Appointments' },
    { id: 'profile', label: '👤 My Profile' },
    { id: 'security', label: '🔒 Security' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={{ fontSize: '1.75rem' }}>🏥</span>
          <span style={styles.brandName}>MediChannel</span>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <div style={styles.userName}>Dr. {user?.firstName} {user?.lastName}</div>
          <div style={styles.userBadge}>👨‍⚕️ Doctor</div>
          <div style={styles.specBadge}>{user?.doctorDetails?.specialization || 'Specialist'}</div>
        </div>
        <nav style={styles.nav}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ ...styles.navItem, ...(activeTab === tab.id ? styles.navActive : {}) }}>
              {tab.label}
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={logout}>🚪 Sign Out</button>
      </div>

      <div style={styles.main}>
        {activeTab === 'overview' && (
          <div>
            <h1 style={styles.title}>Doctor Dashboard</h1>
            <p style={styles.subtitle}>Welcome, Dr. {user?.firstName}. Manage your profile and schedule.</p>
            <div style={styles.statsRow}>
              {[
                { icon: '⭐', label: 'Rating', value: user?.doctorDetails?.rating?.toFixed(1) || '0.0', color: '#e65100' },
                { icon: '💬', label: 'Reviews', value: user?.doctorDetails?.totalReviews || 0, color: '#1565c0' },
                { icon: '💰', label: 'Fee (LKR)', value: user?.doctorDetails?.consultationFee || 0, color: '#2e7d32' },
                { icon: '🏥', label: 'Experience', value: `${user?.doctorDetails?.yearsOfExperience || 0} yrs`, color: '#7b1fa2' },
              ].map(s => (
                <div key={s.label} style={styles.statCard}>
                  <div style={styles.statIcon}>{s.icon}</div>
                  <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Professional Information</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}><span style={styles.iLabel}>Specialization</span><span style={styles.iValue}>{user?.doctorDetails?.specialization || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.iLabel}>License No.</span><span style={styles.iValue}>{user?.doctorDetails?.licenseNumber || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.iLabel}>Department</span><span style={styles.iValue}>{user?.doctorDetails?.department || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.iLabel}>Status</span><span style={{ ...styles.badge, background: '#e8f5e9', color: '#2e7d32' }}>Active</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h1 style={styles.title}>My Appointments</h1>
            <p style={styles.subtitle}>Manage your upcoming patient appointments.</p>
            <div style={styles.formCard}>
              {loadingAppts ? (
                <div style={{ textAlign: 'center', color: '#6c757d' }}>Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>You have no appointments.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        <th style={styles.th}>Patient Name</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Time</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={styles.td}>{appt.patient?.firstName} {appt.patient?.lastName}</td>
                          <td style={styles.td}>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                          <td style={styles.td}>{appt.appointmentTime}</td>
                          <td style={styles.td}>
                            <span style={{ 
                              ...styles.badge, 
                              background: appt.status === 'confirmed' ? '#e8f5e9' : appt.status === 'cancelled' ? '#ffebee' : '#fff3e0',
                              color: appt.status === 'confirmed' ? '#2e7d32' : appt.status === 'cancelled' ? '#c62828' : '#ef6c00'
                            }}>
                              {appt.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}>{appt.reason || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <div style={styles.tabHeader}>
              <h1 style={styles.title}>My Profile</h1>
              {!editing && <button style={styles.editBtn} onClick={() => setEditing(true)}>✏️ Edit</button>}
            </div>
            <div style={styles.formCard}>
              <form onSubmit={handleProfileSave}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
                <div style={styles.formRow}>
                  <div style={styles.fField}>
                    <label style={styles.label}>First Name</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }}
                      value={profileData.firstName} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div style={styles.fField}>
                    <label style={styles.label}>Last Name</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }}
                      value={profileData.lastName} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div style={styles.fField}>
                  <label style={styles.label}>Email</label>
                  <input style={{ ...styles.input, ...styles.inputRO }} value={user?.email} readOnly />
                </div>
                <div style={styles.fField}>
                  <label style={styles.label}>Phone</label>
                  <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }}
                    value={profileData.phone} readOnly={!editing}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} />
                </div>

                <h3 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>Professional Details</h3>
                <div style={styles.formRow}>
                  <div style={styles.fField}>
                    <label style={styles.label}>Specialization</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }}
                      value={profileData.doctorDetails?.specialization || ''} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, doctorDetails: { ...p.doctorDetails, specialization: e.target.value } }))} />
                  </div>
                  <div style={styles.fField}>
                    <label style={styles.label}>Department</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }}
                      value={profileData.doctorDetails?.department || ''} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, doctorDetails: { ...p.doctorDetails, department: e.target.value } }))} />
                  </div>
                </div>
                <div style={styles.fField}>
                  <label style={styles.label}>Bio</label>
                  <textarea style={{ ...styles.input, ...(editing ? {} : styles.inputRO), minHeight: '80px', resize: 'vertical' }}
                    value={profileData.doctorDetails?.bio || ''} readOnly={!editing}
                    onChange={e => setProfileData(p => ({ ...p, doctorDetails: { ...p.doctorDetails, bio: e.target.value } }))} />
                </div>

                {editing && (
                  <div style={styles.formActions}>
                    <button type="button" style={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                    <button type="submit" style={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h1 style={styles.title}>Security Settings</h1>
            <div style={styles.formCard}>
              <h3 style={styles.sectionTitle}>Change Password</h3>
              <form onSubmit={handlePasswordChange}>
                {['currentPassword', 'newPassword', 'confirmPassword'].map(field => (
                  <div key={field} style={styles.fField}>
                    <label style={styles.label}>{field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
                    <input style={styles.input} type="password" value={pwData[field]}
                      onChange={e => setPwData(p => ({ ...p, [field]: e.target.value }))} required />
                  </div>
                ))}
                <button type="submit" style={styles.saveBtn} disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f8f9fa' },
  sidebar: { width: '260px', background: 'linear-gradient(180deg, #0d3b66 0%, #1565c0 100%)', display: 'flex', flexDirection: 'column', padding: '1.5rem', color: '#fff', flexShrink: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  brandName: { fontSize: '1.1rem', fontWeight: '700' },
  userInfo: { textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  avatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d7377, #14a085)', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700' },
  userName: { fontWeight: '700', fontSize: '0.95rem' },
  userBadge: { fontSize: '0.8rem', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '0.2rem 0.75rem', display: 'inline-block', marginTop: '0.5rem' },
  specBadge: { fontSize: '0.75rem', opacity: '0.75', marginTop: '0.4rem' },
  nav: { flex: 1 },
  navItem: { display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', textAlign: 'left', cursor: 'pointer', borderRadius: '10px', fontSize: '0.95rem', marginBottom: '0.25rem' },
  navActive: { background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: '600' },
  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', width: '100%', fontSize: '0.95rem', marginTop: '1rem' },
  main: { flex: 1, padding: '2.5rem', overflowY: 'auto' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.25rem' },
  subtitle: { color: '#6c757d', marginBottom: '2rem' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  editBtn: { padding: '0.6rem 1.25rem', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' },
  statCard: { background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center' },
  statIcon: { fontSize: '1.75rem', marginBottom: '0.5rem' },
  statValue: { fontSize: '1.6rem', fontWeight: '800' },
  statLabel: { fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' },
  infoCard: { background: '#fff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  infoTitle: { fontWeight: '700', color: '#1a1a2e', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f0f0f0', fontSize: '1.05rem' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  iLabel: { fontSize: '0.8rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  iValue: { fontSize: '0.95rem', color: '#1a1a2e', fontWeight: '500' },
  formCard: { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  sectionTitle: { fontWeight: '700', color: '#1a1a2e', marginBottom: '1.25rem', paddingBottom: '0.6rem', borderBottom: '2px solid #f0f0f0', fontSize: '1rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  fField: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#495057', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  inputRO: { background: '#f8f9fa', color: '#6c757d', cursor: 'not-allowed' },
  formActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  cancelBtn: { padding: '0.7rem 1.5rem', border: '2px solid #e9ecef', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#6c757d' },
  saveBtn: { padding: '0.7rem 1.75rem', background: 'linear-gradient(135deg, #1565c0, #0d7377)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block' },
  th: { padding: '1rem', color: '#495057', fontWeight: '600', fontSize: '0.9rem' },
  td: { padding: '1rem', color: '#1a1a2e', fontSize: '0.9rem' },
};

export default DoctorDashboard;
