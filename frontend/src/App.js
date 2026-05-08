import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/User/PatientDashboard';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import StaffDashboard from './pages/Staff/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Homepage from './pages/Homepage';
import DoctorManagement from './pages/Staff/DoctorManagement';
import AddDoctor from './pages/Staff/Adddoctor';
import DoctorsPage from './pages/User/Doctorspage';
import AppointmentPage from './pages/User/AppointmentPage';
import AIChatbot from './pages/User/AIChatBot';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: "'Segoe UI', sans-serif", fontSize: '0.9rem' },
            success: { iconTheme: { primary: '#0d7377', secondary: '#fff' } },
            error: { iconTheme: { primary: '#c62828', secondary: '#fff' } },
          }}
        />




       <Routes>
  {/* Public Routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/" element={<Homepage />} />

  {/* Patient Dashboard */}
  <Route path="/dashboard" element={
    <ProtectedRoute allowedRoles={['patient']}>
      <PatientDashboard />
    </ProtectedRoute>
  } />

  {/* Doctor Dashboard */}
  <Route path="/doctor/dashboard" element={
    <ProtectedRoute allowedRoles={['doctor']}>
      <DoctorDashboard />
    </ProtectedRoute>
  } />

  {/* Staff Dashboard */}
  <Route path="/staff/dashboard" element={
    <ProtectedRoute allowedRoles={['staff']}>
      <StaffDashboard />
    </ProtectedRoute>
  } />

  {/* Admin Dashboard */}
  <Route path="/admin/dashboard" element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } />

  {/* Add Doctor */}
  <Route path="/add-doctor" element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AddDoctor />
    </ProtectedRoute>
  } />

  {/* Doctors Page */}
  <Route path="/doctors" element={
    <DoctorsPage />
  } />
  <Route path="/appointments" element={
    <ProtectedRoute allowedRoles={['patient']}>
      <AppointmentPage />
    </ProtectedRoute>
  } />
  <Route path="/doctormanagement" element={<DoctorManagement/>} />
  <Route path="/adddoctor" element={<AddDoctor/>} />
  <Route path="/ai" element={<AIChatbot />} />

  {/* Redirects */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>




      </Router>
    </AuthProvider>
  );
}

export default App;
