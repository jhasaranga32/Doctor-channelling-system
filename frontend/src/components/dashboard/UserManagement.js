import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['all', 'patient', 'doctor', 'staff', 'admin'];
const ROLE_COLORS = {
  patient: { bg: '#e8f5e9', color: '#2e7d32' },
  doctor: { bg: '#e3f2fd', color: '#1565c0' },
  staff: { bg: '#fff8e1', color: '#e65100' },
  admin: { bg: '#fce4ec', color: '#c62828' },
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', search: '', page: 1, limit: 10 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(null); // 'doctor' | 'staff' | 'admin' | null
  const [modalData, setModalData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: filter.page, limit: filter.limit };
      if (filter.role) params.role = filter.role;
      if (filter.search) params.search = filter.search;
      const res = await userAPI.getAll(params);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchStats = async () => {
    try {
      const res = await userAPI.getStats();
      setStats(res.data.stats);
    } catch {}
  };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, []);

  const handleToggleStatus = async (id, currentStatus, name) => {
    if (!window.confirm(`${currentStatus ? 'Deactivate' : 'Activate'} ${name}?`)) return;
    try {
      await userAPI.toggleStatus(id);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (showModal === 'doctor') await userAPI.createDoctor(modalData);
      else if (showModal === 'staff') await userAPI.createStaff(modalData);
      else if (showModal === 'admin') await userAPI.createAdmin(modalData);
      toast.success(`${showModal.charAt(0).toUpperCase() + showModal.slice(1)} created successfully`);
      setShowModal(null);
      setModalData({});
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.total || 0, icon: '👥', color: '#1b6ca8' },
    { label: 'Patients', value: stats?.byRole?.find(r => r._id === 'patient')?.total || 0, icon: '🧑‍⚕️', color: '#2e7d32' },
    { label: 'Doctors', value: stats?.byRole?.find(r => r._id === 'doctor')?.total || 0, icon: '👨‍⚕️', color: '#1565c0' },
    { label: 'Staff', value: stats?.byRole?.find(r => r._id === 'staff')?.total || 0, icon: '👩‍💼', color: '#e65100' },
    { label: 'Active', value: stats?.active || 0, icon: '✅', color: '#0d7377' },
    { label: 'New This Month', value: stats?.newThisMonth || 0, icon: '🆕', color: '#7b1fa2' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>User Management</h1>
        <div style={styles.createBtns}>
          <button style={{ ...styles.createBtn, background: '#1565c0' }} onClick={() => { setShowModal('doctor'); setModalData({}); }}>+ Add Doctor</button>
          <button style={{ ...styles.createBtn, background: '#e65100' }} onClick={() => { setShowModal('staff'); setModalData({}); }}>+ Add Staff</button>
          <button style={{ ...styles.createBtn, background: '#c62828' }} onClick={() => { setShowModal('admin'); setModalData({}); }}>+ Add Admin</button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {statCards.map(card => (
          <div key={card.label} style={styles.statCard}>
            <div style={styles.statIcon}>{card.icon}</div>
            <div>
              <div style={{ ...styles.statValue, color: card.color }}>{card.value}</div>
              <div style={styles.statLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input style={styles.searchInput} placeholder="Search by name or email..."
          value={filter.search} onChange={(e) => setFilter(p => ({ ...p, search: e.target.value, page: 1 }))} />
        <div style={styles.roleTabs}>
          {ROLES.map(r => (
            <button key={r} onClick={() => setFilter(p => ({ ...p, role: r === 'all' ? '' : r, page: 1 }))}
              style={{ ...styles.roleTab, ...(filter.role === (r === 'all' ? '' : r) ? styles.roleTabActive : {}) }}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.loadingMsg}>Loading users...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={styles.emptyCell}>No users found</td></tr>
              ) : users.map(user => (
                <tr key={user._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.avatar}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div style={styles.userName}>{user.firstName} {user.lastName}</div>
                        <div style={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...ROLE_COLORS[user.role] }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>{user.phone || '—'}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(user.isActive ? { bg: '#e8f5e9', color: '#2e7d32' } : { bg: '#ffebee', color: '#c62828' }), background: user.isActive ? '#e8f5e9' : '#ffebee', color: user.isActive ? '#2e7d32' : '#c62828' }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={{ ...styles.actionBtn, background: user.isActive ? '#fff8e1' : '#e8f5e9', color: user.isActive ? '#e65100' : '#2e7d32' }}
                        onClick={() => handleToggleStatus(user._id, user.isActive, `${user.firstName} ${user.lastName}`)}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button style={{ ...styles.actionBtn, background: '#ffebee', color: '#c62828' }}
                        onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <span style={styles.paginationInfo}>Showing {users.length} of {total} users</span>
        <div style={styles.paginationBtns}>
          <button style={styles.pageBtn} disabled={filter.page <= 1}
            onClick={() => setFilter(p => ({ ...p, page: p.page - 1 }))}>← Prev</button>
          <span style={styles.pageNum}>Page {filter.page} of {totalPages}</span>
          <button style={styles.pageBtn} disabled={filter.page >= totalPages}
            onClick={() => setFilter(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                Create New {showModal.charAt(0).toUpperCase() + showModal.slice(1)}
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowModal(null)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} style={styles.modalForm}>
              <div style={styles.formRow}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>First Name *</label>
                  <input style={styles.formInput} required value={modalData.firstName || ''}
                    onChange={e => setModalData(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Last Name *</label>
                  <input style={styles.formInput} required value={modalData.lastName || ''}
                    onChange={e => setModalData(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Email *</label>
                <input style={styles.formInput} type="email" required value={modalData.email || ''}
                  onChange={e => setModalData(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Password *</label>
                <input style={styles.formInput} type="password" required value={modalData.password || ''}
                  onChange={e => setModalData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 characters" />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Phone</label>
                <input style={styles.formInput} value={modalData.phone || ''}
                  onChange={e => setModalData(p => ({ ...p, phone: e.target.value }))} />
              </div>

              {showModal === 'doctor' && (
                <>
                  <div style={styles.formRow}>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Specialization *</label>
                      <input style={styles.formInput} required
                        value={modalData.doctorDetails?.specialization || ''}
                        onChange={e => setModalData(p => ({ ...p, doctorDetails: { ...p.doctorDetails, specialization: e.target.value } }))} />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>License No. *</label>
                      <input style={styles.formInput} required
                        value={modalData.doctorDetails?.licenseNumber || ''}
                        onChange={e => setModalData(p => ({ ...p, doctorDetails: { ...p.doctorDetails, licenseNumber: e.target.value } }))} />
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Consultation Fee (LKR) *</label>
                      <input style={styles.formInput} type="number" required
                        value={modalData.doctorDetails?.consultationFee || ''}
                        onChange={e => setModalData(p => ({ ...p, doctorDetails: { ...p.doctorDetails, consultationFee: e.target.value } }))} />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Years of Experience</label>
                      <input style={styles.formInput} type="number"
                        value={modalData.doctorDetails?.yearsOfExperience || ''}
                        onChange={e => setModalData(p => ({ ...p, doctorDetails: { ...p.doctorDetails, yearsOfExperience: e.target.value } }))} />
                    </div>
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Department</label>
                    <input style={styles.formInput}
                      value={modalData.doctorDetails?.department || ''}
                      onChange={e => setModalData(p => ({ ...p, doctorDetails: { ...p.doctorDetails, department: e.target.value } }))} />
                  </div>
                </>
              )}

              {showModal === 'staff' && (
                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Position *</label>
                    <input style={styles.formInput} required
                      value={modalData.staffDetails?.position || ''}
                      onChange={e => setModalData(p => ({ ...p, staffDetails: { ...p.staffDetails, position: e.target.value } }))} />
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Department *</label>
                    <input style={styles.formInput} required
                      value={modalData.staffDetails?.department || ''}
                      onChange={e => setModalData(p => ({ ...p, staffDetails: { ...p.staffDetails, department: e.target.value } }))} />
                  </div>
                </div>
              )}

              {showModal === 'admin' && (
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Permissions</label>
                  <p style={{ color: '#6c757d', fontSize: '0.85rem' }}>Default permissions will be assigned. You can update them after creation.</p>
                </div>
              )}

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(null)}>Cancel</button>
                <button type="submit" style={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Creating...' : `Create ${showModal.charAt(0).toUpperCase() + showModal.slice(1)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '2rem', fontFamily: "'Segoe UI', sans-serif", background: '#f8f9fa', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  createBtns: { display: 'flex', gap: '0.75rem' },
  createBtn: { padding: '0.6rem 1.2rem', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: '1.75rem' },
  statValue: { fontSize: '1.5rem', fontWeight: '700' },
  statLabel: { fontSize: '0.8rem', color: '#6c757d' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '200px', padding: '0.65rem 1rem', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' },
  roleTabs: { display: 'flex', gap: '0.5rem' },
  roleTab: { padding: '0.5rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', color: '#6c757d' },
  roleTabActive: { border: '2px solid #1b6ca8', background: '#e8f0fe', color: '#1b6ca8' },
  tableWrap: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8f9fa' },
  th: { padding: '1rem 1.25rem', textAlign: 'left', fontWeight: '700', fontSize: '0.8rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s' },
  td: { padding: '1rem 1.25rem', fontSize: '0.9rem', color: '#495057', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b6ca8, #0d7377)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 },
  userName: { fontWeight: '600', color: '#1a1a2e' },
  userEmail: { fontSize: '0.8rem', color: '#6c757d' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block' },
  actions: { display: 'flex', gap: '0.5rem' },
  actionBtn: { padding: '0.35rem 0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  loadingMsg: { padding: '3rem', textAlign: 'center', color: '#6c757d' },
  emptyCell: { padding: '3rem', textAlign: 'center', color: '#6c757d' },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
  paginationInfo: { color: '#6c757d', fontSize: '0.875rem' },
  paginationBtns: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  pageBtn: { padding: '0.5rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' },
  pageNum: { color: '#6c757d', fontSize: '0.875rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  modal: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 0' },
  modalTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6c757d' },
  modalForm: { padding: '1.25rem 1.5rem 1.5rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formField: { marginBottom: '1rem' },
  formLabel: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#495057', marginBottom: '0.35rem' },
  formInput: { width: '100%', padding: '0.65rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' },
  cancelBtn: { padding: '0.7rem 1.5rem', border: '2px solid #e9ecef', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#6c757d' },
  submitBtn: { padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #1b6ca8, #0d7377)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
};

export default UserManagement;
