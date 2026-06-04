import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Clock, DollarSign, TrendingUp,
  Calendar, Briefcase, Brain, MessageSquare, CalendarClock,
  LogOut, User, ChevronRight
} from 'lucide-react';

const navConfig = {
  admin: [
    { section: 'Overview', items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }] },
    { section: 'HR Management', items: [
      { label: 'Employees', icon: Users, path: '/employees' },
      { label: 'Attendance', icon: Clock, path: '/attendance' },
      { label: 'Payroll', icon: DollarSign, path: '/payroll' },
      { label: 'Leaves', icon: Calendar, path: '/leaves' },
      { label: 'Performance', icon: TrendingUp, path: '/performance' },
    ]},
    { section: 'Recruitment', items: [
      { label: 'Job Postings', icon: Briefcase, path: '/recruitment' },
      { label: 'Resume Screener', icon: Brain, path: '/ai/resume-screener' },
      { label: 'Interview Scheduler', icon: CalendarClock, path: '/ai/scheduler' },
    ]},
    { section: 'AI Tools', items: [
      { label: 'HR Chatbot', icon: MessageSquare, path: '/ai/chatbot' },
    ]},
  ],
  senior_manager: [
    { section: 'Overview', items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }] },
    { section: 'Team', items: [
      { label: 'Employees', icon: Users, path: '/employees' },
      { label: 'Attendance', icon: Clock, path: '/attendance' },
      { label: 'Performance', icon: TrendingUp, path: '/performance' },
      { label: 'Leaves', icon: Calendar, path: '/leaves' },
    ]},
    { section: 'AI Tools', items: [
      { label: 'HR Chatbot', icon: MessageSquare, path: '/ai/chatbot' },
    ]},
  ],
  hr_recruiter: [
    { section: 'Overview', items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }] },
    { section: 'HR', items: [
      { label: 'Employees', icon: Users, path: '/employees' },
      { label: 'Attendance', icon: Clock, path: '/attendance' },
      { label: 'Leaves', icon: Calendar, path: '/leaves' },
      { label: 'Payroll', icon: DollarSign, path: '/payroll' },
    ]},
    { section: 'Recruitment', items: [
      { label: 'Job Postings', icon: Briefcase, path: '/recruitment' },
      { label: 'Resume Screener', icon: Brain, path: '/ai/resume-screener' },
      { label: 'Interview Scheduler', icon: CalendarClock, path: '/ai/scheduler' },
    ]},
    { section: 'AI Tools', items: [
      { label: 'HR Chatbot', icon: MessageSquare, path: '/ai/chatbot' },
    ]},
  ],
  employee: [
    { section: 'Overview', items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }] },
    { section: 'My Space', items: [
      { label: 'My Attendance', icon: Clock, path: '/attendance' },
      { label: 'My Payroll', icon: DollarSign, path: '/payroll' },
      { label: 'My Performance', icon: TrendingUp, path: '/performance' },
      { label: 'Leave Requests', icon: Calendar, path: '/leaves' },
    ]},
    { section: 'AI Tools', items: [
      { label: 'HR Chatbot', icon: MessageSquare, path: '/ai/chatbot' },
    ]},
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = navConfig[user?.role] || [];

  const roleLabels = {
    admin: 'System Admin', senior_manager: 'Senior Manager',
    hr_recruiter: 'HR Recruiter', employee: 'Employee'
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">FW</div>
        <div>
          <span>FWC HRMS</span>
          <small>IT Services Pvt Ltd</small>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {nav.map(section => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-label">{section.section}</div>
            {section.items.map(item => (
              <button
                key={item.path}
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="icon" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {location.pathname === item.path && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 0' }}>
        <button className="sidebar-item" onClick={() => navigate('/profile')}>
          <User className="icon" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{roleLabels[user?.role]}</div>
          </div>
        </button>
        <button className="sidebar-item" onClick={logout} style={{ color: '#ef4444' }}>
          <LogOut className="icon" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
