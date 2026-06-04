import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, appointmentAPI, leaveAPI, aiAPI } from '../../utils/api';
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
  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // AI Chatbot state
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hello! 👋 I'm MedAssist, your AI medical triage assistant. Describe the patient's symptoms and I'll recommend the right specialist.", timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    const userMsg = { role: 'user', content: userText, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);

    // Build conversation history for the API
    const apiMessages = chatMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));
    apiMessages.push({ role: 'user', content: userText });

    try {
      const res = await aiAPI.ollamaChat(apiMessages);
      const reply = res.data?.message || 'Sorry, I could not process that. Please try again.';
      const recommendation = res.data?.recommendation || null;

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        recommendation,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('AI Chat error:', err);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Unable to connect to the AI service. Please ensure the AI server is running.',
        timestamp: new Date()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      { role: 'assistant', content: "Hello! 👋 I'm MedAssist, your AI medical triage assistant. Describe the patient's symptoms and I'll recommend the right specialist.", timestamp: new Date() }
    ]);
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'emergency': return { bg: '#ffebee', color: '#c62828', label: '🚨 EMERGENCY' };
      case 'urgent': return { bg: '#fff3e0', color: '#e65100', label: '⚠️ URGENT' };
      case 'soon': return { bg: '#fffde7', color: '#f9a825', label: '📅 See Soon' };
      default: return { bg: '#e8f5e9', color: '#2e7d32', label: '✅ Routine' };
    }
  };

  useEffect(() => {
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'leaves') fetchLeaves();
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

  const fetchLeaves = async () => {
    setLoadingLeaves(true);
    try {
      const res = await leaveAPI.getMyRequests();
      setLeaves(res.data.leaves || []);
    } catch (err) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoadingLeaves(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    try {
      await leaveAPI.createRequest(leaveForm);
      toast.success('Leave request submitted!');
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
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
    { id: 'aibot', label: '🤖 AI Assistant' },
    { id: 'leaves', label: '🏖️ Leave Requests' },
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

        {activeTab === 'aibot' && (
          <div style={{ height: 'calc(100vh - 5rem)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h1 style={styles.title}>AI Symptom Assistant</h1>
                <p style={{ ...styles.subtitle, marginBottom: 0 }}>Describe patient symptoms to get specialist recommendations powered by AI.</p>
              </div>
              <button onClick={clearChat} style={styles.clearChatBtn} id="clear-chat-btn">
                🗑️ New Chat
              </button>
            </div>

            {/* Chat Container */}
            <div style={styles.chatContainer} id="ai-chat-container">
              {/* Messages Area */}
              <div style={styles.chatMessages} id="ai-chat-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '1rem',
                    animation: 'fadeInUp 0.3s ease-out'
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={styles.botAvatar}>🤖</div>
                    )}
                    <div style={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
                        <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                      </div>

                      {/* Recommendation Card */}
                      {msg.recommendation && (
                        <div style={styles.recCard}>
                          <div style={styles.recHeader}>
                            <span style={{ fontSize: '1.5rem' }}>{msg.recommendation.icon || '🩺'}</span>
                            <div>
                              <div style={styles.recSpecialty}>{msg.recommendation.specialty_name}</div>
                              <div style={styles.recReason}>{msg.recommendation.reason}</div>
                            </div>
                          </div>
                          <div style={styles.recBadges}>
                            {(() => {
                              const u = getUrgencyStyle(msg.recommendation.urgency);
                              return (
                                <span style={{ ...styles.recBadge, background: u.bg, color: u.color }}>{u.label}</span>
                              );
                            })()}
                            <span style={{
                              ...styles.recBadge,
                              background: msg.recommendation.confidence === 'high' ? '#e8f5e9' : msg.recommendation.confidence === 'medium' ? '#fff3e0' : '#ffebee',
                              color: msg.recommendation.confidence === 'high' ? '#2e7d32' : msg.recommendation.confidence === 'medium' ? '#e65100' : '#c62828'
                            }}>
                              {msg.recommendation.confidence === 'high' ? '🎯' : msg.recommendation.confidence === 'medium' ? '🔍' : '❓'} {msg.recommendation.confidence?.toUpperCase()} confidence
                            </span>
                          </div>
                        </div>
                      )}

                      <div style={{ fontSize: '0.7rem', color: '#adb5bd', padding: '0 0.25rem' }}>
                        {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div style={styles.userAvatar}>{user?.firstName?.[0] || 'D'}</div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {chatLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={styles.botAvatar}>🤖</div>
                    <div style={{ ...styles.botBubble, display: 'flex', alignItems: 'center', gap: '6px', padding: '1rem 1.25rem' }}>
                      <span style={styles.typingDot1}></span>
                      <span style={styles.typingDot2}></span>
                      <span style={styles.typingDot3}></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestions */}
              {chatMessages.length <= 1 && (
                <div style={styles.quickSuggestions}>
                  {[
                    '🤕 Patient has persistent headaches and dizziness',
                    '💓 Patient complains of chest tightness and palpitations',
                    '🦴 Patient has severe lower back pain for 2 weeks',
                    '🤧 Patient has recurring skin rashes and itching'
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      style={styles.suggestionBtn}
                      onClick={() => { setChatInput(suggestion.slice(2).trim()); }}
                      id={`suggestion-btn-${idx}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div style={styles.chatInputArea}>
                <input
                  style={styles.chatInput}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  placeholder="Describe the patient's symptoms..."
                  disabled={chatLoading}
                  id="ai-chat-input"
                />
                <button
                  style={{ ...styles.chatSendBtn, ...(chatLoading || !chatInput.trim() ? styles.chatSendBtnDisabled : {}) }}
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  id="ai-chat-send-btn"
                >
                  {chatLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={styles.spinnerSmall}></span>
                    </span>
                  ) : '➤'}
                </button>
              </div>
            </div>

            {/* Inline keyframes via style tag */}
            <style>{`
              @keyframes chatPulse {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                40% { transform: scale(1); opacity: 1; }
              }
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              #ai-chat-input:focus {
                border-color: #1565c0 !important;
                box-shadow: 0 0 0 3px rgba(21,101,192,0.12) !important;
              }
              .suggestion-hover:hover {
                background: linear-gradient(135deg, #e3f2fd, #f3e5f5) !important;
                transform: translateY(-1px) !important;
              }
            `}</style>
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

        {activeTab === 'leaves' && (
          <div>
            <h1 style={styles.title}>Leave Requests</h1>
            <p style={styles.subtitle}>Apply for leave and view your request history.</p>
            
            <div style={{ ...styles.formCard, marginBottom: '2rem' }}>
              <h3 style={styles.sectionTitle}>Apply for Leave</h3>
              <form onSubmit={handleLeaveSubmit}>
                <div style={styles.formRow}>
                  <div style={styles.fField}>
                    <label style={styles.label}>Start Date</label>
                    <input style={styles.input} type="date" required 
                           min={new Date().toISOString().split('T')[0]}
                           value={leaveForm.startDate} 
                           onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div style={styles.fField}>
                    <label style={styles.label}>End Date</label>
                    <input style={styles.input} type="date" required 
                           min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                           value={leaveForm.endDate} 
                           onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
                <div style={styles.fField}>
                  <label style={styles.label}>Reason</label>
                  <textarea style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} required
                            value={leaveForm.reason} 
                            onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} 
                            placeholder="Please provide a brief reason for your leave" />
                </div>
                <button type="submit" style={styles.saveBtn} disabled={submittingLeave}>
                  {submittingLeave ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            <div style={styles.formCard}>
              <h3 style={styles.sectionTitle}>My Request History</h3>
              {loadingLeaves ? (
                <div style={{ textAlign: 'center', color: '#6c757d' }}>Loading...</div>
              ) : leaves.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No leave requests found.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        <th style={styles.th}>Date Range</th>
                        <th style={styles.th}>Reason</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Staff Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((l) => (
                        <tr key={l._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={styles.td}>{l.startDate} to {l.endDate}</td>
                          <td style={styles.td}>{l.reason}</td>
                          <td style={styles.td}>
                            <span style={{ 
                              ...styles.badge, 
                              background: l.status === 'approved' ? '#e8f5e9' : l.status === 'rejected' ? '#ffebee' : '#fff3e0',
                              color: l.status === 'approved' ? '#2e7d32' : l.status === 'rejected' ? '#c62828' : '#ef6c00'
                            }}>
                              {l.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}>{l.staffNotes || '—'}</td>
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

  // AI Chatbot styles
  chatContainer: {
    flex: 1,
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem 1.5rem 0.5rem',
    background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)',
  },
  botAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
    marginRight: '0.75rem',
    marginTop: '2px',
    boxShadow: '0 3px 12px rgba(102,126,234,0.3)',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0d7377, #14a085)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
    marginLeft: '0.75rem',
    marginTop: '2px',
    boxShadow: '0 3px 12px rgba(13,115,119,0.3)',
  },
  botBubble: {
    background: '#f0f2f8',
    borderRadius: '4px 18px 18px 18px',
    padding: '0.85rem 1.15rem',
    color: '#1a1a2e',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  userBubble: {
    background: 'linear-gradient(135deg, #1565c0, #0d7377)',
    borderRadius: '18px 4px 18px 18px',
    padding: '0.85rem 1.15rem',
    color: '#fff',
    boxShadow: '0 3px 12px rgba(21,101,192,0.2)',
  },
  recCard: {
    background: 'linear-gradient(135deg, #f8f9ff, #f3f0ff)',
    border: '1.5px solid #e0d6ff',
    borderRadius: '16px',
    padding: '1.15rem',
    boxShadow: '0 4px 16px rgba(102,126,234,0.1)',
  },
  recHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  recSpecialty: {
    fontWeight: '700',
    fontSize: '1rem',
    color: '#1a1a2e',
  },
  recReason: {
    fontSize: '0.82rem',
    color: '#6c757d',
    marginTop: '0.2rem',
    lineHeight: '1.4',
  },
  recBadges: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  recBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-block',
  },
  quickSuggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
    padding: '0 1.5rem 1rem',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '1rem',
  },
  suggestionBtn: {
    padding: '0.55rem 1rem',
    borderRadius: '20px',
    border: '1.5px solid #e0e0e0',
    background: '#fafafa',
    color: '#495057',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500',
  },
  chatInputArea: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f0f0f0',
    background: '#fff',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    padding: '0.85rem 1.15rem',
    borderRadius: '14px',
    border: '2px solid #e9ecef',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: "'Segoe UI', sans-serif",
    background: '#fafbfc',
  },
  chatSendBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #1565c0, #0d7377)',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(21,101,192,0.3)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  chatSendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  clearChatBtn: {
    padding: '0.6rem 1.25rem',
    background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
    color: '#495057',
    border: '1px solid #dee2e6',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  typingDot1: {
    width: '8px', height: '8px', borderRadius: '50%', background: '#6c757d',
    animation: 'chatPulse 1.4s infinite ease-in-out',
    animationDelay: '0s',
  },
  typingDot2: {
    width: '8px', height: '8px', borderRadius: '50%', background: '#6c757d',
    animation: 'chatPulse 1.4s infinite ease-in-out',
    animationDelay: '0.2s',
  },
  typingDot3: {
    width: '8px', height: '8px', borderRadius: '50%', background: '#6c757d',
    animation: 'chatPulse 1.4s infinite ease-in-out',
    animationDelay: '0.4s',
  },
  spinnerSmall: {
    width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
};

export default DoctorDashboard;
