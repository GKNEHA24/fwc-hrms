import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Users, Clock, DollarSign, Briefcase, TrendingUp, Calendar, Star, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-dark" /><span>Loading dashboard...</span></div>;

  const isAdmin = user.role === 'admin' || user.role === 'senior_manager';
  const isHR = user.role === 'hr_recruiter';

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Good morning, {user.name.split(' ')[0]}! 👋</h2>
          <p style={{ opacity: 0.8, marginTop: 4, fontSize: 14 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ textAlign: 'right', opacity: 0.9 }}>
          <div style={{ fontSize: 12 }}>Employee ID</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{user.employeeId}</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>{user.designation || user.role}</div>
        </div>
      </div>

      {/* Admin/Manager Dashboard */}
      {isAdmin && data && (
        <>
          <div className="stat-grid">
            {[
              { label: 'Total Employees', value: data.stats?.totalEmployees || 0, icon: Users, color: '#3b82f6', bg: '#dbeafe' },
              { label: 'Present Today', value: data.stats?.activeToday || 0, icon: Clock, color: '#10b981', bg: '#d1fae5' },
              { label: 'Pending Leaves', value: data.stats?.pendingLeaves || 0, icon: Calendar, color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Open Positions', value: data.stats?.openJobs || 0, icon: Briefcase, color: '#8b5cf6', bg: '#ede9fe' },
              { label: 'Monthly Payroll', value: `₹${((data.stats?.monthlyPayroll || 0) / 100000).toFixed(1)}L`, icon: DollarSign, color: '#ef4444', bg: '#fee2e2' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon" style={{ background: s.bg }}>
                  <s.icon size={22} color={s.color} />
                </div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Dept chart */}
            <div className="card">
              <div className="card-header"><span className="card-title">Employees by Department</span></div>
              <div className="card-body" style={{ padding: '16px' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.deptStats || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, count }) => `${_id}: ${count}`} labelLine={false} fontSize={11}>
                      {(data.deptStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top performers */}
            <div className="card">
              <div className="card-header"><span className="card-title">Top Performers</span></div>
              <div style={{ padding: '8px 0' }}>
                {(data.topPerformers || []).length === 0 ? (
                  <div className="empty-state"><TrendingUp size={32} /><h3>No reviews yet</h3></div>
                ) : (data.topPerformers || []).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLORS[i], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.employee?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.employee?.department}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontWeight: 700 }}>
                      <Star size={14} fill="#fbbf24" />
                      {p.overallRating?.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* HR Dashboard */}
      {isHR && data && (
        <>
          <div className="stat-grid">
            {[
              { label: 'Total Employees', value: data.stats?.totalEmployees || 0, icon: Users, color: '#3b82f6', bg: '#dbeafe' },
              { label: 'Pending Leaves', value: data.stats?.pendingLeaves || 0, icon: Calendar, color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Open Positions', value: data.stats?.openJobs || 0, icon: Briefcase, color: '#8b5cf6', bg: '#ede9fe' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Recent Applications by Job</span></div>
            <div className="card-body">
              {(data.recentApplications || []).map((j, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13 }}>{j.title}</span>
                  <span className="badge badge-info">{j.count} applications</span>
                </div>
              ))}
              {!data.recentApplications?.length && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No open jobs yet</p>}
            </div>
          </div>
        </>
      )}

      {/* Employee Dashboard */}
      {user.role === 'employee' && data && (
        <>
          <div className="stat-grid">
            {[
              { label: 'Days Present (Month)', value: data.stats?.presentDays || 0, icon: Clock, color: '#10b981', bg: '#d1fae5' },
              { label: 'Total Work Hours', value: `${data.stats?.totalWorkHours || 0}h`, icon: TrendingUp, color: '#3b82f6', bg: '#dbeafe' },
              { label: 'Net Salary', value: data.stats?.netSalary ? `₹${data.stats.netSalary.toLocaleString('en-IN')}` : 'N/A', icon: DollarSign, color: '#8b5cf6', bg: '#ede9fe' },
              { label: 'Avg Rating', value: data.stats?.avgRating ? `${data.stats.avgRating}/5` : 'N/A', icon: Star, color: '#f59e0b', bg: '#fef3c7' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">Recent Leave Requests</span></div>
              <div style={{ padding: '8px 0' }}>
                {(data.myLeaves || []).length === 0 ? <div className="empty-state" style={{ padding: 24 }}><p>No leave requests</p></div>
                  : (data.myLeaves || []).slice(0, 4).map((l, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{l.leaveType} Leave</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.days} day(s)</div>
                      </div>
                      <span className={`badge ${l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">Performance Reviews</span></div>
              <div style={{ padding: '8px 0' }}>
                {(data.myReviews || []).length === 0 ? <div className="empty-state" style={{ padding: 24 }}><p>No reviews yet</p></div>
                  : (data.myReviews || []).map((r, i) => (
                    <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.period}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>
                          <Star size={13} fill="#fbbf24" />{r.overallRating?.toFixed(1)}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.status}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
