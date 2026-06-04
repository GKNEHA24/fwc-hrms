import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, CheckCircle, XCircle } from 'lucide-react';

const TYPES = ['casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid'];

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
  const isEmployee = user.role === 'employee';

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(isEmployee ? '/leaves/my' : '/leaves');
      setLeaves(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApply = async () => {
    try {
      await api.post('/leaves', form);
      fetchLeaves(); setShowModal(false);
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleAction = async (id, action) => {
    const reason = action === 'rejected' ? prompt('Rejection reason (optional):') : '';
    try { await api.put(`/leaves/${id}/action`, { action, reason }); fetchLeaves(); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const statusBadge = (s) => {
    const m = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', cancelled: 'badge-muted' };
    return <span className={`badge ${m[s]}`}>{s}</span>;
  };

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-dark" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Leave Management</h1><p>{isEmployee ? 'Apply and track your leaves' : 'Manage team leave requests'}</p></div>
        {isEmployee && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Apply Leave</button>}
      </div>

      {/* Leave balance (employee) */}
      {isEmployee && (
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          {[{ label: 'Casual', total: 12 }, { label: 'Sick', total: 12 }, { label: 'Earned', total: 15 }].map(t => {
            const used = leaves.filter(l => l.leaveType === t.label.toLowerCase() && l.status === 'approved').reduce((s, l) => s + l.days, 0);
            return (
              <div className="card" key={t.label} style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.label} Leave</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{t.total - used} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>remaining</span></div>
                <div className="progress" style={{ marginTop: 8 }}>
                  <div className="progress-bar" style={{ width: `${(used / t.total) * 100}%`, background: used > t.total * 0.8 ? 'var(--danger)' : 'var(--primary-light)' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{used} used of {t.total}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title">Leave Requests</span></div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {!isEmployee && <th>Employee</th>}
                <th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th>
                {!isEmployee && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No leave requests</td></tr>
              ) : leaves.map((l, i) => (
                <tr key={i}>
                  {!isEmployee && <td><div style={{ fontWeight: 600, fontSize: 13 }}>{l.employee?.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.employee?.department}</div></td>}
                  <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{l.leaveType}</span></td>
                  <td>{new Date(l.startDate).toLocaleDateString('en-IN')}</td>
                  <td>{new Date(l.endDate).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: 600 }}>{l.days}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                  <td>{statusBadge(l.status)}</td>
                  {!isEmployee && l.status === 'pending' && (
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleAction(l._id, 'approved')}><CheckCircle size={13} />Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(l._id, 'rejected')}><XCircle size={13} />Reject</button>
                      </div>
                    </td>
                  )}
                  {!isEmployee && l.status !== 'pending' && <td>—</td>}
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
              <h3 style={{ fontWeight: 700 }}>Apply for Leave</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-control" value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">From Date</label><input type="date" className="form-control" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">To Date</label><input type="date" className="form-control" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Reason *</label><textarea className="form-control" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Briefly explain the reason..." /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApply} disabled={!form.startDate || !form.endDate || !form.reason}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
