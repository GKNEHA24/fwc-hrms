import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/shared/Dashboard';
import Employees from './pages/admin/Employees';
import Attendance from './pages/shared/Attendance';
import Payroll from './pages/shared/Payroll';
import Performance from './pages/shared/Performance';
import Leaves from './pages/shared/Leaves';
import Recruitment from './pages/hr/Recruitment';
import AIResumeScreener from './pages/hr/AIResumeScreener';
import AIChatbot from './pages/shared/AIChatbot';
import AIScheduler from './pages/hr/AIScheduler';
import VideoInterview from './pages/hr/VideoInterview';
import Profile from './pages/shared/Profile';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner spinner-dark" />
      <span>Loading...</span>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/employees" element={<PrivateRoute roles={['admin','hr_recruiter','senior_manager']}><Employees /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/payroll" element={<PrivateRoute><Payroll /></PrivateRoute>} />
          <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />
          <Route path="/leaves" element={<PrivateRoute><Leaves /></PrivateRoute>} />
          <Route path="/recruitment" element={<PrivateRoute roles={['admin','hr_recruiter']}><Recruitment /></PrivateRoute>} />
          <Route path="/ai/resume-screener" element={<PrivateRoute roles={['admin','hr_recruiter']}><AIResumeScreener /></PrivateRoute>} />
          <Route path="/ai/chatbot" element={<PrivateRoute><AIChatbot /></PrivateRoute>} />
          <Route path="/ai/scheduler" element={<PrivateRoute roles={['admin','hr_recruiter']}><AIScheduler /></PrivateRoute>} />
          <Route path="/ai/video-interview" element={<PrivateRoute roles={['admin','hr_recruiter']}><VideoInterview /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
