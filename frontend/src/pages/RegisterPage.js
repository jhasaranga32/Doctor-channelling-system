import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '',
    patientDetails: {
      dateOfBirth: '', gender: '', bloodGroup: '',
      address: { street: '', city: '', state: '', postalCode: '', country: 'Sri Lanka' },
      emergencyContact: { name: '', phone: '', relationship: '' },
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'patientDetails') {
        setFormData(prev => ({
          ...prev,
          patientDetails: { ...prev.patientDetails, [child]: value },
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      patientDetails: {
        ...prev.patientDetails,
        [section]: { ...prev.patientDetails[section], [field]: value },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
      toast.success('Account created successfully! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join MediChannel as a Patient</p>
          <div style={styles.steps}>
            {[1, 2].map(s => (
              <div key={s} style={{ ...styles.step, ...(step >= s ? styles.stepActive : {}) }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {step === 1 && (
            <>
              <h3 style={styles.sectionTitle}>Basic Information</h3>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>First Name *</label>
                  <input style={styles.input} name="firstName" value={formData.firstName}
                    onChange={handleChange} placeholder="John" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Last Name *</label>
                  <input style={styles.input} name="lastName" value={formData.lastName}
                    onChange={handleChange} placeholder="Doe" required />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email Address *</label>
                <input style={styles.input} type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="john@example.com" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input style={styles.input} name="phone" value={formData.phone}
                  onChange={handleChange} placeholder="+94 77 123 4567" />
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Password *</label>
                  <input style={styles.input} type="password" name="password" value={formData.password}
                    onChange={handleChange} placeholder="Min. 6 characters" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Confirm Password *</label>
                  <input style={styles.input} type="password" name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} placeholder="Repeat password" required />
                </div>
              </div>
              <button type="button" style={styles.btnPrimary} onClick={() => setStep(2)}>
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={styles.sectionTitle}>Medical Information <span style={styles.optional}>(Optional)</span></h3>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Date of Birth</label>
                  <input style={styles.input} type="date" name="dateOfBirth"
                    value={formData.patientDetails.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, patientDetails: { ...prev.patientDetails, dateOfBirth: e.target.value }
                    }))} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Gender</label>
                  <select style={styles.input}
                    value={formData.patientDetails.gender}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, patientDetails: { ...prev.patientDetails, gender: e.target.value }
                    }))}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Blood Group</label>
                <select style={styles.input}
                  value={formData.patientDetails.bloodGroup}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, patientDetails: { ...prev.patientDetails, bloodGroup: e.target.value }
                  }))}>
                  <option value="">Select Blood Group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <h3 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>Address</h3>
              <div style={styles.field}>
                <label style={styles.label}>Street Address</label>
                <input style={styles.input} value={formData.patientDetails.address.street}
                  onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                  placeholder="123 Main Street" />
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>City</label>
                  <input style={styles.input} value={formData.patientDetails.address.city}
                    onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                    placeholder="Colombo" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Postal Code</label>
                  <input style={styles.input} value={formData.patientDetails.address.postalCode}
                    onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)}
                    placeholder="00100" />
                </div>
              </div>

              <h3 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>Emergency Contact</h3>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Contact Name</label>
                  <input style={styles.input} value={formData.patientDetails.emergencyContact.name}
                    onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                    placeholder="Jane Doe" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Contact Phone</label>
                  <input style={styles.input} value={formData.patientDetails.emergencyContact.phone}
                    onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                    placeholder="+94 77 987 6543" />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Relationship</label>
                <input style={styles.input} value={formData.patientDetails.emergencyContact.relationship}
                  onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                  placeholder="Spouse, Parent, Sibling..." />
              </div>

              <div style={styles.btnRow}>
                <button type="button" style={styles.btnSecondary} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" style={styles.btnPrimary} disabled={loading}>
                  {loading ? 'Creating Account...' : '✓ Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 50%, #0d7377 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" },
  card: { background: '#fff', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '560px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  logo: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', margin: '0' },
  subtitle: { color: '#6c757d', margin: '0.25rem 0 1rem' },
  steps: { display: 'flex', justifyContent: 'center', gap: '1rem' },
  step: { width: '32px', height: '32px', borderRadius: '50%', background: '#e9ecef', color: '#6c757d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.875rem' },
  stepActive: { background: '#1b6ca8', color: '#fff' },
  form: {},
  sectionTitle: { fontSize: '1rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '1rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' },
  optional: { color: '#6c757d', fontWeight: 'normal', fontSize: '0.85rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#495057', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.7rem 1rem', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #1b6ca8, #0d7377)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  btnSecondary: { padding: '0.85rem 1.5rem', background: '#f8f9fa', color: '#495057', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnRow: { display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' },
  footer: { textAlign: 'center', color: '#6c757d', fontSize: '0.9rem', marginTop: '1.5rem' },
  link: { color: '#1b6ca8', fontWeight: '600', textDecoration: 'none' },
};

export default RegisterPage;
