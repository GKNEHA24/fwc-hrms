import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Users, Eye, Briefcase } from 'lucide-react';

export default function Recruitment() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApps, setShowApps] = useState(false);
  const [form, setForm] = useState({ title: '', department: 'Engineering', description: '', requirements: '', skills: '', experience: '', salary: '', openings: 1, deadline: '' });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const { data } = await api.get('/recruitment'); setJobs(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await api.post('/recruitment', {
        ...form,
        requirements: form.requirements.split('\n').filter(Boolean),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      fetchJobs(); setShowModal(false);
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const viewApplications = async (job) => {
    setSelectedJob(job);
    const { data } = await api.get(`/recruitment/${job._id}/applications`);
    setApplications(data.applications || []);
    setShowApps(true);
  };

  const updateStatus = async (jobId, appId, status) => {
    await api.put(`/recruitment/${jobId}/applications/${appId}`, { status });
    viewApplications(selectedJob);
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await api.delete(`/recruitment/${id}`); fetchJobs();
  };

  const statusColor = { applied: 'badge-muted', screening: 'badge-warning', shortlisted: 'badge-info', interview_scheduled: 'badge-primary', interviewed: 'badge-primary', offered: 'badge-success', rejected: 'badge-danger' };

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-dark" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Recruitment</h1><p>{jobs.length} open positions</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Post Job</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {jobs.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1' }}><div className="empty-state"><Briefcase size={40} /><h3>No jobs posted yet</h3><p>Create your first job posting</p></div></div>
        ) : jobs.map(job => (
          <div className="card" key={job._id} style={{ cursor: 'pointer' }} onClick={() => viewApplications(job)}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.department} · {job.location || 'Bangalore'}</div>
                </div>
                <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-muted'}`}>{job.status}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{job.description?.substring(0, 100)}...</p>
              {job.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {job.skills.slice(0, 4).map((s, i) => <span key={i} style={{ padding: '2px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{s}</span>)}
                  {job.skills.length > 4 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{job.skills.length - 4} more</span>}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600 }}>{job.openings}</span> opening{job.openings > 1 ? 's' : ''}
                  {job.salary && <span> · {job.salary}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); viewApplications(job); }}><Eye size={13} />Applications</button>
                  <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); deleteJob(job._id); }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Job Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Post New Job</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Job Title *</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Department</label>
                  <select className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {['Engineering','HR','Marketing','Design','Finance','Operations'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Job Description *</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Requirements (one per line)</label><textarea className="form-control" rows={3} value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} placeholder="Bachelor's degree in CS&#10;2+ years experience&#10;Strong React skills" /></div>
              <div className="form-group"><label className="form-label">Skills (comma separated)</label><input className="form-control" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Python, MongoDB" /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Experience</label><input className="form-control" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="0-2 years / Fresher" /></div>
                <div className="form-group"><label className="form-label">Salary</label><input className="form-control" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="₹10 LPA" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Openings</label><input type="number" className="form-control" value={form.openings} onChange={e => setForm({ ...form, openings: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Deadline</label><input type="date" className="form-control" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!form.title || !form.description}>Post Job</button>
            </div>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApps && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowApps(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div><h3 style={{ fontWeight: 700 }}>Applications — {selectedJob?.title}</h3><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{applications.length} total</p></div>
              <button onClick={() => setShowApps(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {applications.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No applications yet</p>
                : applications.map((app, i) => (
                  <div key={i} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{app.candidateName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.email} · {app.phone}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${statusColor[app.status] || 'badge-muted'}`}>{app.status?.replace('_', ' ')}</span>
                        {app.aiScore > 0 && <div style={{ fontSize: 12, marginTop: 4, fontWeight: 600, color: app.aiScore >= 70 ? 'var(--success)' : 'var(--warning)' }}>AI Score: {app.aiScore}/100</div>}
                      </div>
                    </div>
                    {app.coverLetter && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{app.coverLetter.substring(0, 150)}...</p>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['screening', 'shortlisted', 'interview_scheduled', 'offered', 'rejected'].map(s => (
                        <button key={s} className={`btn btn-sm ${s === 'rejected' ? 'btn-danger' : s === 'offered' ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => updateStatus(selectedJob._id, app._id, s)} style={{ fontSize: 11 }}>
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
