import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';

const DEPTS = ['Engineering', 'HR', 'Marketing', 'Design', 'Finance', 'Operations', 'Management'];
const ROLES = [{ value: 'employee', label: 'Employee' }, { value: 'hr_recruiter', label: 'HR Recruiter' }, { value: 'senior_manager', label: 'Senior Manager' }];

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: 'FWC@12345', role: 'employee', department: 'Engineering', designation: '', phone: '', salary: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => {
    let f = employees;
    if (search) f = f.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.employeeId?.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter) f = f.filter(e => e.department === deptFilter);
    setFiltered(f);
  }, [employees, search, deptFilter]);

  const fetchEmployees = async () => {
    try { const { data } = await api.get('/employees'); setEmployees(data); setFiltered(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openCreate = () => { setSelected(null); setForm({ name: '', email: '', password: 'FWC@12345', role: 'employee', department: 'Engineering', designation: '', phone: '', salary: '', address: '' }); setShowModal(true); };
  const openEdit = (emp) => { setSelected(emp); setForm({ name: emp.name, email: emp.email, password: '', role: emp.role, department: emp.department, designation: emp.designation, phone: emp.phone, salary: emp.salary, address: emp.address }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selected) await api.put(`/employees/${selected._id}`, form);
      else await api.post('/employees', form);
      fetchEmployees(); setShowModal(false);
    } catch (e) { alert(e.response?.data?.message || 'Error saving'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return;
    await api.delete(`/employees/${id}`); fetchEmployees();
  };

  const roleColors = { admin: 'badge-primary', senior_manager: 'badge-info', hr_recruiter: 'badge-success', employee: 'badge-muted' };

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-dark" /><span>Loading...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Employees</h1><p>{filtered.length} total employees</p></div>
        {(user.role === 'admin' || user.role === 'hr_recruiter') && (
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} />Add Employee</button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Search by name, email, ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 180 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>ID</th><th>Department</th><th>Designation</th>
                <th>Role</th><th>Phone</th><th>Salary</th><th>Status</th>
                {user.role !== 'employee' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No employees found</td></tr>
              ) : filtered.map(emp => (
                <tr key={emp._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code style={{ fontSize: 12, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{emp.employeeId}</code></td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td><span className={`badge ${roleColors[emp.role] || 'badge-muted'}`}>{emp.role?.replace('_', ' ')}</span></td>
                  <td>{emp.phone || '-'}</td>
                  <td>{emp.salary ? `₹${emp.salary.toLocaleString('en-IN')}` : '-'}</td>
                  <td><span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>
                  {user.role !== 'employee' && (
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}><Edit2 size={13} /></button>
                        {user.role === 'admin' && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id)}><Trash2 size={13} /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>{selected ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!!selected} /></div>
              </div>
              {!selected && <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>}
              <div className="form-row">
                <div className="form-group"><label className="form-label">Role</label>
                  <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Department</label>
                  <select className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Designation</label><input className="form-control" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Salary (₹/month)</label><input type="number" className="form-control" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Address</label><textarea className="form-control" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : selected ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
