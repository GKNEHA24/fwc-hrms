import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard', '/employees': 'Employee Management',
  '/attendance': 'Attendance', '/payroll': 'Payroll',
  '/performance': 'Performance Reviews', '/leaves': 'Leave Management',
  '/recruitment': 'Recruitment', '/ai/resume-screener': 'AI Resume Screener',
  '/ai/chatbot': 'HR AI Chatbot (ARIA)', '/ai/scheduler': 'AI Interview Scheduler',
  '/profile': 'My Profile',
};

export default function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'FWC HRMS';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
          </div>
          <div className="topbar-right">
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="var(--text-muted)" />
            </div>
            <div
              className="user-avatar"
              onClick={() => navigate('/profile')}
              title={user?.name}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
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
