import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Star, Brain, TrendingUp } from 'lucide-react';

const RatingInput = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <label className="form-label" style={{ margin: 0 }}>{label}</label>
      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>{value}/5</span>
    </div>
    <input type="range" min={1} max={5} step={0.5} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ width: '100%', accentColor: 'var(--primary)' }} />
  </div>
);

export default function Performance() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [aiInsights, setAiInsights] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [form, setForm] = useState({
    employee: '', period: 'Q2 2026', year: 2026, quarter: 2,
    ratings: { technical: 3, communication: 3, teamwork: 3, leadership: 3, punctuality: 3, initiative: 3 },
    strengths: '', areasOfImprovement: '', managerComments: ''
  });

  const isEmployee = user.role === 'employee';

  useEffect(() => {
    fetchReviews();
    if (!isEmployee) fetchEmployees();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(isEmployee ? '/performance/my' : '/performance');
      setReviews(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    const { data } = await api.get('/employees');
    setEmployees(data.filter(e => e.role === 'employee'));
  };

  const handleSave = async () => {
    try {
      await api.post('/performance', { ...form, employee: form.employee });
      fetchReviews(); setShowModal(false);
      alert('Review submitted!');
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const getAIInsights = async (empId) => {
    setLoadingAI(true); setSelectedEmployee(empId);
    try {
      const { data } = await api.post(`/ai/performance-insights/${empId}`);
      setAiInsights(data.insights);
    } catch (e) { setAiInsights('Could not generate insights. Check your API key.'); }
    finally { setLoadingAI(false); }
  };

  const renderStars = (rating) => (
    <div className="rating">
      {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= Math.round(rating) ? '' : 'empty'}`}>★</span>)}
      <span style={{ fontSize: 12, marginLeft: 4, fontWeight: 600 }}>{rating?.toFixed(1)}</span>
    </div>
  );

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-dark" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Performance</h1><p>{isEmployee ? 'Your performance reviews' : 'Team performance overview'}</p></div>
        {!isEmployee && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Add Review</button>}
      </div>

      {/* AI Insights for my own perf (employee) */}
      {isEmployee && (
        <div className="card" style={{ marginBottom: 24, border: '1px solid #dbeafe', background: '#f0f9ff' }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>AI Performance Insights</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by Claude AI</div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}
                onClick={() => getAIInsights(user._id)} disabled={loadingAI}>
                {loadingAI ? <><div className="spinner" style={{ width: 14, height: 14 }} />Analyzing...</> : '✨ Get AI Insights'}
              </button>
            </div>
            {aiInsights && <div style={{ fontSize: 13, lineHeight: 1.7, background: 'white', padding: 16, borderRadius: 8, border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{aiInsights}</div>}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviews.length === 0 ? (
          <div className="card"><div className="empty-state"><TrendingUp size={40} /><h3>No reviews yet</h3><p>Performance reviews will appear here</p></div></div>
        ) : reviews.map((r, i) => (
          <div className="card" key={i}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  {!isEmployee && <div style={{ fontWeight: 700, fontSize: 15 }}>{r.employee?.name} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>({r.employee?.department})</span></div>}
                  <div style={{ fontWeight: isEmployee ? 700 : 600, fontSize: isEmployee ? 15 : 13, color: isEmployee ? 'var(--text)' : 'var(--text-muted)' }}>{r.period} — {r.year}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reviewed by: {r.reviewer?.name || 'System'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {renderStars(r.overallRating)}
                  <span className={`badge ${r.status === 'completed' ? 'badge-success' : r.status === 'reviewed' ? 'badge-info' : 'badge-warning'}`} style={{ marginTop: 8, display: 'inline-block' }}>{r.status}</span>
                </div>
              </div>

              <div className="form-row" style={{ gap: 12 }}>
                {Object.entries(r.ratings || {}).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{key}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(val/5)*100}%`, height: '100%', background: 'var(--primary-light)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{val}/5</span>
                    </div>
                  </div>
                ))}
              </div>

              {r.strengths && <div style={{ marginTop: 12 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--success)' }}>Strengths</div><p style={{ fontSize: 13 }}>{r.strengths}</p></div>}
              {r.areasOfImprovement && <div style={{ marginTop: 8 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--warning)' }}>Areas for Improvement</div><p style={{ fontSize: 13 }}>{r.areasOfImprovement}</p></div>}
              {r.aiInsights && <div style={{ marginTop: 12, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}><div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--primary)' }}>🤖 AI Insights</div><p style={{ fontSize: 12, lineHeight: 1.6 }}>{r.aiInsights.substring(0, 300)}...</p></div>}

              {!isEmployee && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => getAIInsights(r.employee?._id)}>
                    <Brain size={13} /> {loadingAI && selectedEmployee === r.employee?._id ? 'Analyzing...' : 'Get AI Insights'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {aiInsights && !isEmployee && (
        <div className="card" style={{ marginTop: 24, border: '1px solid #dbeafe' }}>
          <div className="card-header"><span className="card-title">🤖 AI Performance Analysis</span></div>
          <div className="card-body"><pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{aiInsights}</pre></div>
        </div>
      )}

      {/* Create Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Create Performance Review</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Employee *</label>
                  <select className="form-control" value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.department})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Period</label>
                  <input className="form-control" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. Q2 2026" />
                </div>
              </div>
              <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Ratings</h4>
                {Object.entries(form.ratings).map(([key, val]) => (
                  <RatingInput key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val}
                    onChange={v => setForm({ ...form, ratings: { ...form.ratings, [key]: v } })} />
                ))}
              </div>
              <div className="form-group"><label className="form-label">Strengths</label><textarea className="form-control" rows={2} value={form.strengths} onChange={e => setForm({ ...form, strengths: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Areas for Improvement</label><textarea className="form-control" rows={2} value={form.areasOfImprovement} onChange={e => setForm({ ...form, areasOfImprovement: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Manager Comments</label><textarea className="form-control" rows={2} value={form.managerComments} onChange={e => setForm({ ...form, managerComments: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.employee}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
