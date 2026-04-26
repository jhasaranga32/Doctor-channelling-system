import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone || '' });
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profileData);
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      toast.success('Password changed successfully');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const TABS = [
    { id: 'overview', label: '🏠 Overview' },
    { id: 'profile', label: '👤 My Profile' },
    { id: 'security', label: '🔒 Security' },
  ];

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <span style={styles.sidebarLogo}>🏥</span>
          <span style={styles.sidebarName}>MediChannel</span>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <div style={styles.userName}>{user?.firstName} {user?.lastName}</div>
          <div style={styles.userRole}>Patient</div>
        </div>
        <nav style={styles.nav}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ ...styles.navItem, ...(activeTab === tab.id ? styles.navItemActive : {}) }}>
              {tab.label}
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={logout}>🚪 Sign Out</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {activeTab === 'overview' && (
          <div>
            <h1 style={styles.pageTitle}>Welcome back, {user?.firstName}! 👋</h1>
            <p style={styles.pageSubtitle}>Manage your health appointments and profile from here.</p>
            <div style={styles.overviewCards}>
              {[
                { icon: '📅', title: 'Appointments', value: '0', desc: 'Upcoming appointments', color: '#1b6ca8' },
                { icon: '👨‍⚕️', title: 'My Doctors', value: '0', desc: 'Consulted doctors', color: '#0d7377' },
                { icon: '📋', title: 'Prescriptions', value: '0', desc: 'Active prescriptions', color: '#7b1fa2' },
              ].map(card => (
                <div key={card.title} style={styles.overviewCard}>
                  <div style={{ ...styles.overviewIcon, background: card.color }}>{card.icon}</div>
                  <div style={styles.overviewValue}>{card.value}</div>
                  <div style={styles.overviewTitle}>{card.title}</div>
                  <div style={styles.overviewDesc}>{card.desc}</div>
                </div>
              ))}
            </div>

            {/* Patient details summary */}
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>My Health Information</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}><span style={styles.infoLabel}>Blood Group</span><span style={styles.infoValue}>{user?.patientDetails?.bloodGroup || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.infoLabel}>Gender</span><span style={styles.infoValue}>{user?.patientDetails?.gender || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.infoLabel}>Date of Birth</span><span style={styles.infoValue}>{user?.patientDetails?.dateOfBirth ? new Date(user.patientDetails.dateOfBirth).toLocaleDateString() : '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.infoLabel}>City</span><span style={styles.infoValue}>{user?.patientDetails?.address?.city || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.infoLabel}>Emergency Contact</span><span style={styles.infoValue}>{user?.patientDetails?.emergencyContact?.name || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.infoLabel}>Account Status</span><span style={{ ...styles.badge, background: '#e8f5e9', color: '#2e7d32' }}>Active</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <div style={styles.tabHeader}>
              <h1 style={styles.pageTitle}>My Profile</h1>
              {!editing && (
                <button style={styles.editBtn} onClick={() => setEditing(true)}>✏️ Edit Profile</button>
              )}
            </div>
            <div style={styles.formCard}>
              <form onSubmit={handleProfileSave}>
                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.label}>First Name</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputReadOnly) }}
                      value={profileData.firstName} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.label}>Last Name</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputReadOnly) }}
                      value={profileData.lastName} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div style={styles.formField}>
                  <label style={styles.label}>Email Address</label>
                  <input style={{ ...styles.input, ...styles.inputReadOnly }} value={user?.email} readOnly />
                  <small style={styles.hint}>Email cannot be changed</small>
                </div>
                <div style={styles.formField}>
                  <label style={styles.label}>Phone Number</label>
                  <input style={{ ...styles.input, ...(editing ? {} : styles.inputReadOnly) }}
                    value={profileData.phone} readOnly={!editing}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+94 77 123 4567" />
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
            <h1 style={styles.pageTitle}>Security Settings</h1>
            <div style={styles.formCard}>
              <h3 style={styles.sectionTitle}>Change Password</h3>
              <form onSubmit={handlePasswordChange}>
                <div style={styles.formField}>
                  <label style={styles.label}>Current Password</label>
                  <input style={styles.input} type="password" value={pwData.currentPassword}
                    onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))} required />
                </div>
                <div style={styles.formField}>
                  <label style={styles.label}>New Password</label>
                  <input style={styles.input} type="password" value={pwData.newPassword}
                    onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min. 6 characters" required />
                </div>
                <div style={styles.formField}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input style={styles.input} type="password" value={pwData.confirmPassword}
                    onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
                <button type="submit" style={styles.saveBtn} disabled={saving}>
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
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
  sidebar: { width: '260px', background: 'linear-gradient(180deg, #0f4c75 0%, #1b6ca8 100%)', display: 'flex', flexDirection: 'column', padding: '1.5rem', color: '#fff', flexShrink: 0 },
  sidebarBrand: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  sidebarLogo: { fontSize: '1.75rem' },
  sidebarName: { fontSize: '1.1rem', fontWeight: '700' },
  userInfo: { textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  userAvatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700' },
  userName: { fontWeight: '700', fontSize: '1rem' },
  userRole: { fontSize: '0.8rem', opacity: '0.8', marginTop: '0.25rem', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '0.2rem 0.75rem', display: 'inline-block', marginTop: '0.5rem' },
  nav: { flex: 1 },
  navItem: { display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', textAlign: 'left', cursor: 'pointer', borderRadius: '10px', fontSize: '0.95rem', marginBottom: '0.25rem', transition: 'all 0.2s' },
  navItemActive: { background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: '600' },
  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', width: '100%', fontSize: '0.95rem', marginTop: '1rem' },
  main: { flex: 1, padding: '2.5rem', overflowY: 'auto' },
  pageTitle: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.25rem' },
  pageSubtitle: { color: '#6c757d', marginBottom: '2rem' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  editBtn: { padding: '0.6rem 1.25rem', background: '#e8f0fe', color: '#1b6ca8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  overviewCards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
  overviewCard: { background: '#fff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' },
  overviewIcon: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem' },
  overviewValue: { fontSize: '2rem', fontWeight: '800', color: '#1a1a2e' },
  overviewTitle: { fontWeight: '700', color: '#1a1a2e', marginTop: '0.25rem' },
  overviewDesc: { fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' },
  infoCard: { background: '#fff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  infoTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f0f0f0' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  infoLabel: { fontSize: '0.8rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  infoValue: { fontSize: '0.95rem', color: '#1a1a2e', fontWeight: '500' },
  formCard: { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formField: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#495057', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  inputReadOnly: { background: '#f8f9fa', color: '#6c757d', cursor: 'not-allowed' },
  hint: { color: '#6c757d', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' },
  formActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  cancelBtn: { padding: '0.7rem 1.5rem', border: '2px solid #e9ecef', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#6c757d' },
  saveBtn: { padding: '0.7rem 1.75rem', background: 'linear-gradient(135deg, #1b6ca8, #0d7377)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f0f0f0' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block' },
};

export default PatientDashboard;
