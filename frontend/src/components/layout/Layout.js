import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/payroll': 'Payroll',
  '/performance': 'Performance',
  '/leaves': 'Leaves',
  '/recruitment': 'Recruitment',
  '/ai/resume-screener': 'Resume Screener',
  '/ai/chatbot': 'HR Chatbot (ARIA)',
  '/ai/scheduler': 'Interview Scheduler',
  '/ai/video-interview': 'AI Video Interview',
  '/profile': 'My Profile',
};

export default function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'FWC HRMS';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="topbar-title">{title}</div>
          </div>
          <div className="topbar-right">
            <Bell size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            <div className="user-avatar" onClick={() => navigate('/profile')} title={user?.name}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="topbar-user-info">
              <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.employeeId}</div>
            </div>
          </div>
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
