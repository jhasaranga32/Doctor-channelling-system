import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/dashboard/UserManagement';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { id: 'overview', label: '🏠 Overview', role: ['admin'] },
  { id: 'users', label: '👥 User Management', role: ['admin'] },
  { id: 'profile', label: '👤 My Profile', role: ['admin'] },
  { id: 'security', label: '🔒 Security', role: ['admin'] },
];

const AdminDashboard = () => {
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
      toast.error(err.response?.data?.message || 'Failed to update');
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

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <span style={styles.brandLogo}>🏥</span>
          <span style={styles.brandName}>MediChannel</span>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <div style={styles.userName}>{user?.firstName} {user?.lastName}</div>
          <div style={styles.userBadge}>
            {user?.adminDetails?.isSuperAdmin ? '⭐ Super Admin' : '🛡️ Admin'}
          </div>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{ ...styles.navItem, ...(activeTab === item.id ? styles.navActive : {}) }}>
              {item.label}
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={logout}>🚪 Sign Out</button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'overview' && (
          <div style={styles.inner}>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            <p style={styles.pageSubtitle}>Welcome back, {user?.firstName}. Here's a system overview.</p>
            <div style={styles.quickCards}>
              {[
                { icon: '👥', title: 'Manage Users', desc: 'Add doctors, staff, view patients', action: () => setActiveTab('users'), color: '#1b6ca8' },
                { icon: '📅', title: 'Appointments', desc: 'Coming soon — manage bookings', color: '#0d7377' },
                { icon: '📊', title: 'Reports', desc: 'Coming soon — analytics & stats', color: '#7b1fa2' },
                { icon: '⚙️', title: 'Settings', desc: 'Coming soon — system config', color: '#e65100' },
              ].map(card => (
                <div key={card.title} style={styles.quickCard} onClick={card.action}>
                  <div style={{ ...styles.quickIcon, background: card.color }}>{card.icon}</div>
                  <div style={styles.quickTitle}>{card.title}</div>
                  <div style={styles.quickDesc}>{card.desc}</div>
                  {card.action && <div style={{ ...styles.quickArrow, color: card.color }}>→ Open</div>}
                </div>
              ))}
            </div>
            <div style={styles.permissionsCard}>
              <h3 style={styles.permTitle}>Your Permissions</h3>
              <div style={styles.permList}>
                {(user?.adminDetails?.permissions || []).map(p => (
                  <span key={p} style={styles.permBadge}>{p.replace(/_/g, ' ')}</span>
                ))}
                {(!user?.adminDetails?.permissions || user.adminDetails.permissions.length === 0) && (
                  <span style={{ color: '#6c757d' }}>No specific permissions assigned</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}

        {activeTab === 'profile' && (
          <div style={styles.inner}>
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
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }}
                      value={profileData.firstName} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.label}>Last Name</label>
                    <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }}
                      value={profileData.lastName} readOnly={!editing}
                      onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div style={styles.formField}>
                  <label style={styles.label}>Email Address</label>
                  <input style={{ ...styles.input, ...styles.inputRO }} value={user?.email} readOnly />
                </div>
                <div style={styles.formField}>
                  <label style={styles.label}>Phone</label>
                  <input style={{ ...styles.input, ...(editing ? {} : styles.inputRO) }}
                    value={profileData.phone} readOnly={!editing}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} />
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
          <div style={styles.inner}>
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
                    onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))} required />
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
  sidebar: { width: '260px', background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', flexDirection: 'column', padding: '1.5rem', color: '#fff', flexShrink: 0 },
  sidebarBrand: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  brandLogo: { fontSize: '1.75rem' },
  brandName: { fontSize: '1.1rem', fontWeight: '700' },
  userInfo: { textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  avatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #c62828, #e53935)', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700' },
  userName: { fontWeight: '700', fontSize: '1rem' },
  userBadge: { fontSize: '0.8rem', opacity: '0.85', marginTop: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.2rem 0.75rem', display: 'inline-block' },
  nav: { flex: 1 },
  navItem: { display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', textAlign: 'left', cursor: 'pointer', borderRadius: '10px', fontSize: '0.95rem', marginBottom: '0.25rem' },
  navActive: { background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: '600' },
  logoutBtn: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', width: '100%', fontSize: '0.95rem', marginTop: '1rem' },
  content: { flex: 1, overflowY: 'auto' },
  inner: { padding: '2.5rem' },
  pageTitle: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.25rem' },
  pageSubtitle: { color: '#6c757d', marginBottom: '2rem' },
  quickCards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' },
  quickCard: { background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' },
  quickIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1rem' },
  quickTitle: { fontWeight: '700', color: '#1a1a2e', marginBottom: '0.4rem' },
  quickDesc: { fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.75rem' },
  quickArrow: { fontSize: '0.875rem', fontWeight: '600' },
  permissionsCard: { background: '#fff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  permTitle: { fontWeight: '700', color: '#1a1a2e', marginBottom: '1rem', fontSize: '1.05rem' },
  permList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  permBadge: { padding: '0.35rem 0.9rem', background: '#fce4ec', color: '#c62828', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  editBtn: { padding: '0.6rem 1.25rem', background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  formCard: { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formField: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#495057', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  inputRO: { background: '#f8f9fa', color: '#6c757d', cursor: 'not-allowed' },
  formActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
  cancelBtn: { padding: '0.7rem 1.5rem', border: '2px solid #e9ecef', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#6c757d' },
  saveBtn: { padding: '0.7rem 1.75rem', background: 'linear-gradient(135deg, #c62828, #e53935)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  sectionTitle: { fontWeight: '700', color: '#1a1a2e', marginBottom: '1.5rem', fontSize: '1.05rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f0f0f0' },
};

export default AdminDashboard;
