import React, { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Save, User, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: user?.address || '', skills: user?.skills?.join(', ') || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert('Error saving'); } finally { setSaving(false); }
  };

  const roleLabels = { admin: 'System Admin', senior_manager: 'Senior Manager', hr_recruiter: 'HR Recruiter', employee: 'Employee' };
  const roleColors = { admin: '#7c3aed', senior_manager: '#0891b2', hr_recruiter: '#059669', employee: '#d97706' };

  return (
    <div>
      <div className="page-header">
        <div><h1>My Profile</h1><p>Manage your personal information</p></div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: avatar + info */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `linear-gradient(135deg, ${roleColors[user?.role] || '#3b82f6'}, #3b82f6)`,
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 800, margin: '0 auto 16px'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 20 }}>{user?.name}</h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{user?.designation || user?.role}</div>
              <span style={{
                display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 20,
                background: `${roleColors[user?.role]}20`, color: roleColors[user?.role],
                fontSize: 12, fontWeight: 600
              }}>
                {roleLabels[user?.role]}
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Employee Info</span></div>
            <div style={{ padding: '8px 0' }}>
              {[
                { icon: User, label: 'Employee ID', value: user?.employeeId },
                { icon: Mail, label: 'Email', value: user?.email },
                { icon: Briefcase, label: 'Department', value: user?.department },
                { icon: Briefcase, label: 'Designation', value: user?.designation },
                { icon: Calendar, label: 'Joined', value: user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <item.icon size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: edit form */}
        <div className="card">
          <div className="card-header"><span className="card-title">Edit Profile</span></div>
          <div className="card-body">
            {saved && <div className="alert alert-success">Profile saved successfully!</div>}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" value={user?.email} disabled style={{ opacity: 0.6 }} />
              <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
            </div>
            <div className="form-group">
              <label className="form-label">Skills (comma separated)</label>
              <textarea className="form-control" rows={2} value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Python, Node.js, Machine Learning" />
            </div>

            {/* Skills display */}
            {form.skills && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.skills.split(',').map((s, i) => s.trim() && (
                    <span key={i} style={{ padding: '3px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><Save size={16} />Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
