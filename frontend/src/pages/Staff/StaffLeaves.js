import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { leaveAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import StaffSidebar from '../../components/nav/sidebar';

const StaffLeaves = () => {
  const { user, logout } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaves');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveAPI.getAllRequests();
      setLeaves(response.data?.leaves || []);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, { status });
      toast.success(`Leave request ${status}`);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
        <StaffSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
        <div style={{ flex: 1, marginLeft: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f9fc' }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading leave requests…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8f9fc' }}>
      <StaffSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />

      <main style={{ flex: 1, marginLeft: 256, padding: '40px 44px' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Staff Portal</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Leave Requests</h1>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 6px rgba(15,23,42,0.08)', border: '1px solid #e8edf5', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fc', borderBottom: '1.5px solid #e8edf5' }}>
                {['Doctor', 'Date Range', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No leave requests found.</td></tr>
              )}
              {leaves.map((leave, i) => (
                <tr key={leave._id} style={{ borderBottom: i < leaves.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    Dr. {leave.doctor?.firstName} {leave.doctor?.lastName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569' }}>
                    {leave.startDate} to {leave.endDate}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {leave.reason}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      fontSize: 12, fontWeight: 600, borderRadius: 20, padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 5,
                      color: leave.status === 'approved' ? '#16a34a' : leave.status === 'rejected' ? '#dc2626' : '#ea580c',
                      background: leave.status === 'approved' ? '#f0fdf4' : leave.status === 'rejected' ? '#fff1f2' : '#fff7ed'
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: leave.status === 'approved' ? '#22c55e' : leave.status === 'rejected' ? '#f43f5e' : '#f97316' }} />
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {leave.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleUpdateStatus(leave._id, 'approved')}
                          style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          Approve
                        </button>
                        <button onClick={() => handleUpdateStatus(leave._id, 'rejected')}
                          style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StaffLeaves;
