import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { appointmentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import StaffSidebar from '../../components/nav/sidebar';

const StaffAppointments = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll();
      setAppointments(response.data?.appointments || []);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
        <StaffSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
        <div style={{ flex: 1, marginLeft: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f9fc' }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading appointments…</div>
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
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Appointment Management</h1>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 6px rgba(15,23,42,0.08)', border: '1px solid #e8edf5', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fc', borderBottom: '1.5px solid #e8edf5' }}>
                {['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Reason'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No appointments found.</td></tr>
              )}
              {appointments.map((appt, i) => (
                <tr key={appt._id} style={{ borderBottom: i < appointments.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {appt.patient?.firstName} {appt.patient?.lastName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#475569' }}>
                    Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569' }}>
                    {new Date(appt.appointmentDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569', fontWeight: 600 }}>
                    {appt.appointmentTime}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      fontSize: 12, fontWeight: 600, borderRadius: 20, padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 5,
                      color: appt.status === 'confirmed' ? '#16a34a' : appt.status === 'cancelled' ? '#dc2626' : '#ea580c',
                      background: appt.status === 'confirmed' ? '#f0fdf4' : appt.status === 'cancelled' ? '#fff1f2' : '#fff7ed'
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: appt.status === 'confirmed' ? '#22c55e' : appt.status === 'cancelled' ? '#f43f5e' : '#f97316' }} />
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {appt.reason || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Showing <b style={{ color: '#475569' }}>{appointments.length}</b> appointments
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffAppointments;
