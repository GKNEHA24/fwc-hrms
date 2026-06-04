import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [month] = useState(new Date().getMonth() + 1);
  const [year] = useState(new Date().getFullYear());

  const isEmployee = user.role === 'employee';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (isEmployee) {
        const { data } = await api.get(`/attendance/my?month=${month}&year=${year}`);
        setRecords(data);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const t = data.find(r => new Date(r.date).toDateString() === today.toDateString());
        setTodayRecord(t || null);
      } else {
        const { data } = await api.get('/attendance');
        setRecords(data);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try { const { data } = await api.post('/attendance/checkin'); setTodayRecord(data); fetchData(); }
    catch (e) { alert(e.response?.data?.message || 'Error'); } finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try { const { data } = await api.post('/attendance/checkout'); setTodayRecord(data); fetchData(); }
    catch (e) { alert(e.response?.data?.message || 'Error'); } finally { setActionLoading(false); }
  };

  const statusBadge = (s) => {
    const m = { present: 'badge-success', absent: 'badge-danger', half_day: 'badge-warning', late: 'badge-info', on_leave: 'badge-primary' };
    return <span className={`badge ${m[s] || 'badge-muted'}`}>{s?.replace('_', ' ')}</span>;
  };

  const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const totalHours = records.reduce((s, r) => s + (r.workHours || 0), 0);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-dark" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Attendance</h1><p>{isEmployee ? `${month}/${year} — Your attendance` : 'Team attendance records'}</p></div>
      </div>

      {isEmployee && (
        <>
          {/* Today card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                  {todayRecord ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {todayRecord.checkIn && <span>In: {new Date(todayRecord.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} </span>}
                      {todayRecord.checkOut && <span>| Out: {new Date(todayRecord.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} </span>}
                      {todayRecord.workHours > 0 && <span>| {todayRecord.workHours}h worked</span>}
                    </div>
                  ) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Not checked in yet</p>}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {!todayRecord?.checkIn && (
                    <button className="btn btn-success btn-lg" onClick={handleCheckIn} disabled={actionLoading}>
                      <LogIn size={18} /> {actionLoading ? 'Processing...' : 'Check In'}
                    </button>
                  )}
                  {todayRecord?.checkIn && !todayRecord?.checkOut && (
                    <button className="btn btn-danger btn-lg" onClick={handleCheckOut} disabled={actionLoading}>
                      <LogOut size={18} /> {actionLoading ? 'Processing...' : 'Check Out'}
                    </button>
                  )}
                  {todayRecord?.checkOut && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontWeight: 600 }}>
                      <CheckCircle size={20} /> Day complete! {todayRecord.workHours}h worked
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Present Days', value: presentCount, color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
              { label: 'Absent Days', value: absentCount, color: '#ef4444', bg: '#fee2e2', icon: XCircle },
              { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, color: '#3b82f6', bg: '#dbeafe', icon: Clock },
              { label: 'Avg Hours/Day', value: presentCount > 0 ? `${(totalHours / presentCount).toFixed(1)}h` : '0h', color: '#8b5cf6', bg: '#ede9fe', icon: Clock },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">{isEmployee ? 'Monthly Records' : 'Attendance Logs'}</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {!isEmployee && <th>Employee</th>}
                <th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found</td></tr>
              ) : records.slice(0, 50).map((r, i) => (
                <tr key={i}>
                  {!isEmployee && <td><div style={{ fontWeight: 600, fontSize: 13 }}>{r.employee?.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.employee?.department}</div></td>}
                  <td style={{ fontWeight: 500 }}>{new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td>{r.workHours > 0 ? `${r.workHours}h` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
