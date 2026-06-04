import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { data } = await api.post('/auth/seed');
      alert(`Demo users created!\n\n${data.credentials.map(u => `${u.role}: ${u.email} / ${u.password}`).join('\n')}`);
    } catch (err) {
      alert('Seed failed: ' + (err.response?.data?.message || err.message));
    } finally { setSeeding(false); }
  };

  const quickLogin = (role) => {
    const creds = {
      admin: { email: 'admin@fwc.co.in', password: 'Admin@123' },
      senior_manager: { email: 'manager@fwc.co.in', password: 'Manager@123' },
      hr_recruiter: { email: 'hr@fwc.co.in', password: 'Hr@123456' },
      employee: { email: 'employee@fwc.co.in', password: 'Emp@12345' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, background: '#3b82f6',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24, fontWeight: 900, color: 'white'
          }}>FW</div>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>FWC HRMS</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>AI-Powered HR Management System</p>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Sign in to your account</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-control" value={email}
                onChange={e => setEmail(e.target.value)} required placeholder="you@fwc.co.in" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password}
                onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Quick Login */}
          <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Demo Login</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { role: 'admin', label: 'Admin', color: '#7c3aed' },
                { role: 'senior_manager', label: 'Manager', color: '#0891b2' },
                { role: 'hr_recruiter', label: 'HR', color: '#059669' },
                { role: 'employee', label: 'Employee', color: '#d97706' },
              ].map(r => (
                <button key={r.role} onClick={() => quickLogin(r.role)}
                  style={{ padding: '8px', borderRadius: 8, border: `1px solid ${r.color}20`,
                    background: `${r.color}10`, color: r.color, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={handleSeed} disabled={seeding}
              style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none',
                border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              {seeding ? 'Seeding...' : '🔧 Seed demo users (first time setup)'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 24 }}>
          © 2026 FWC IT Services Pvt Ltd · Bangalore
        </p>
      </div>
    </div>
  );
}
