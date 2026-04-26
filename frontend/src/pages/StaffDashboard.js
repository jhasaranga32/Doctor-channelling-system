import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
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
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
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

  const TABS = [{ id: 'overview', label: '🏠 Overview' }, { id: 'profile', label: '👤 My Profile' }, { id: 'security', label: '🔒 Security' }];

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.brand}><span style={{ fontSize: '1.75rem' }}>🏥</span><span style={styles.brandName}>MediChannel</span></div>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <div style={styles.userName}>{user?.firstName} {user?.lastName}</div>
          <div style={styles.badge}>👩‍💼 Staff</div>
          <div style={styles.position}>{user?.staffDetails?.position || 'Staff Member'}</div>
        </div>
        <nav style={styles.nav}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ ...styles.navItem, ...(activeTab === t.id ? styles.navActive : {}) }}>{t.label}</button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={logout}>🚪 Sign Out</button>
      </div>

      <div style={styles.main}>
        {activeTab === 'overview' && (
          <div>
            <h1 style={styles.title}>Staff Dashboard</h1>
            <p style={styles.subtitle}>Welcome, {user?.firstName}. Here's your work overview.</p>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>My Work Details</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}><span style={styles.iLabel}>Position</span><span style={styles.iValue}>{user?.staffDetails?.position || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.iLabel}>Department</span><span style={styles.iValue}>{user?.staffDetails?.department || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.iLabel}>Employee ID</span><span style={styles.iValue}>{user?.staffDetails?.employeeId || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.iLabel}>Shift</span><span style={styles.iValue}>{user?.staffDetails?.shift || '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.iLabel}>Joining Date</span><span style={styles.iValue}>{user?.staffDetails?.joiningDate ? new Date(user.staffDetails.joiningDate).toLocaleDateString() : '—'}</span></div>
                <div style={styles.infoItem}><span style={styles.iLabel}>Account Status</span><span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', background: '#e8f5e9', color: '#2e7d32' }}>Active</span></div>
              </div>
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
                <div style={styles.formRow}>
                  <div style={styles.fField}>
                    <label style={styles.label}>First Name</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }} value={profileData.firstName} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div style={styles.fField}>
                    <label style={styles.label}>Last Name</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }} value={profileData.lastName} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div style={styles.fField}>
                  <label style={styles.label}>Email</label>
                  <input style={{ ...styles.input, ...styles.inputRO }} value={user?.email} readOnly />
                </div>
                <div style={styles.fField}>
                  <label style={styles.label}>Phone</label>
                  <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }} value={profileData.phone} readOnly={!editing}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} />
                </div>
                {editing && (
                  <div style={styles.formActions}>
                    <button type="button" style={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                    <button type="submit" style={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
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
                    <label style={styles.label}>{field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm Password'}</label>
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
  sidebar: { width: '260px', background: 'linear-gradient(180deg, #2e3b2e 0%, #4caf50 100%)', display: 'flex', flexDirection: 'column', padding: '1.5rem', color: '#fff', flexShrink: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  brandName: { fontSize: '1.1rem', fontWeight: '700' },
  userInfo: { textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  avatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700' },
  userName: { fontWeight: '700', fontSize: '0.95rem' },
  badge: { fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '0.2rem 0.75rem', display: 'inline-block', marginTop: '0.5rem' },
  position: { fontSize: '0.75rem', opacity: '0.75', marginTop: '0.4rem' },
  nav: { flex: 1 },
  navItem: { display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', textAlign: 'left', cursor: 'pointer', borderRadius: '10px', fontSize: '0.95rem', marginBottom: '0.25rem' },
  navActive: { background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: '600' },
  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', width: '100%', marginTop: '1rem' },
  main: { flex: 1, padding: '2.5rem', overflowY: 'auto' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.25rem' },
  subtitle: { color: '#6c757d', marginBottom: '2rem' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  editBtn: { padding: '0.6rem 1.25rem', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  infoCard: { background: '#fff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  infoTitle: { fontWeight: '700', color: '#1a1a2e', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f0f0f0' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  iLabel: { fontSize: '0.8rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase' },
  iValue: { fontSize: '0.95rem', color: '#1a1a2e', fontWeight: '500' },
  formCard: { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  sectionTitle: { fontWeight: '700', color: '#1a1a2e', marginBottom: '1.25rem', paddingBottom: '0.6rem', borderBottom: '2px solid #f0f0f0' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  fField: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#495057', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  inputRO: { background: '#f8f9fa', color: '#6c757d', cursor: 'not-allowed' },
  formActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
  cancelBtn: { padding: '0.7rem 1.5rem', border: '2px solid #e9ecef', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#6c757d' },
  saveBtn: { padding: '0.7rem 1.75rem', background: 'linear-gradient(135deg, #2e7d32, #4caf50)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
};

export default StaffDashboard;
