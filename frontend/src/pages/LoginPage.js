import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const getDashboardPath = (role) => {
    const paths = { admin: '/admin/dashboard', doctor: '/doctor/dashboard', staff: '/staff/dashboard', patient: '/' };
    return paths[role] || '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(getDashboardPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <div style={styles.brandArea}>
          <div style={styles.brandLogo}>🏥</div>
          <h1 style={styles.brandName}>MediChannel</h1>
          <p style={styles.brandTagline}>Your trusted healthcare booking platform</p>
        </div>
        <div style={styles.features}>
          {['Book appointments instantly', 'Access your health records', 'Connect with top specialists', 'Secure & confidential'].map(f => (
            <div key={f} style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Enter your email and password to continue</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} type="email" value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} type="password" value={formData.password}
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password" required />
            </div>

            <div style={styles.forgotRow}>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>

            <button type="submit" style={styles.btnSubmit} disabled={loading}>
              {loading ? <span>Signing in...</span> : <span>Sign In</span>}
            </button>
          </form>

          <p style={styles.registerNote}>
            New patient?{' '}
            <Link to="/register" style={styles.link}>Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', fontFamily: "'Segoe UI', sans-serif" },
  leftPanel: { flex: 1, background: 'linear-gradient(160deg, #0f4c75 0%, #1b6ca8 50%, #0d7377 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: '#fff' },
  brandArea: { marginBottom: '3rem' },
  brandLogo: { fontSize: '3.5rem', marginBottom: '0.5rem' },
  brandName: { fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem' },
  brandTagline: { fontSize: '1.1rem', opacity: '0.85' },
  features: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  feature: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' },
  featureIcon: { width: '24px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 },
  rightPanel: { width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8f9fa' },
  card: { background: '#fff', borderRadius: '20px', padding: '2.5rem', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.25rem' },
  subtitle: { color: '#6c757d', margin: '0 0 1.5rem' },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' },
  roleBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: '2px solid #e9ecef', borderRadius: '10px', background: '#f8f9fa', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', color: '#495057', transition: 'all 0.2s' },
  roleBtnActive: { border: '2px solid #1b6ca8', background: '#e8f0fe', color: '#1b6ca8' },
  roleIcon: { fontSize: '1.2rem' },
  roleLabel: {},
  roleDesc: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0f7ff', border: '1px solid #d0e4f7', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.875rem', color: '#1b6ca8', marginBottom: '1.5rem' },
  roleDescIcon: { fontSize: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#495057', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
  forgotRow: { textAlign: 'right', marginBottom: '1rem' },
  forgotLink: { color: '#1b6ca8', fontSize: '0.875rem', textDecoration: 'none' },
  btnSubmit: { width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #1b6ca8, #0d7377)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' },
  registerNote: { textAlign: 'center', color: '#6c757d', fontSize: '0.9rem', marginTop: '1.25rem' },
  link: { color: '#1b6ca8', fontWeight: '600', textDecoration: 'none' },
};

export default LoginPage;
