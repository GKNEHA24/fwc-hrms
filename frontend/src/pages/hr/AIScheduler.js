import React, { useState } from 'react';
import api from '../../utils/api';
import { CalendarClock, Send, Sparkles, FileText } from 'lucide-react';

export default function AIScheduler() {
  const [tab, setTab] = useState('schedule');
  const [form, setForm] = useState({
    candidateName: '', candidateEmail: '', jobTitle: '',
    interviewerName: '', preferredDates: '', interviewType: 'technical'
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const [jdForm, setJdForm] = useState({ role: '', department: 'Engineering', experience: 'fresher', skills: '' });
  const [jdResult, setJdResult] = useState('');
  const [jdLoading, setJdLoading] = useState(false);

  const scheduleInterview = async () => {
    setLoading(true); setResult('');
    try {
      const { data } = await api.post('/ai/schedule-interview', form);
      setResult(data.schedule);
    } catch (e) { setResult('Error: ' + (e.response?.data?.message || 'Check your API key')); }
    finally { setLoading(false); }
  };

  const generateJD = async () => {
    setJdLoading(true); setJdResult('');
    try {
      const { data } = await api.post('/ai/generate-jd', jdForm);
      setJdResult(data.jobDescription);
    } catch (e) { setJdResult('Error: ' + (e.response?.data?.message || 'Check your API key')); }
    finally { setJdLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #059669, #0ea5e9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarClock size={18} color="white" />
            </div>
            AI Interview Scheduler
          </h1>
          <p>Powered by Claude AI · Generate schedules and job descriptions</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>Schedule Interview</button>
        <button className={`tab ${tab === 'jd' ? 'active' : ''}`} onClick={() => setTab('jd')}>Generate Job Description</button>
      </div>

      {tab === 'schedule' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Interview Details</span></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Candidate Name *</label>
                  <input className="form-control" value={form.candidateName} onChange={e => setForm({ ...form, candidateName: e.target.value })} placeholder="Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label className="form-label">Candidate Email *</label>
                  <input className="form-control" value={form.candidateEmail} onChange={e => setForm({ ...form, candidateEmail: e.target.value })} placeholder="rahul@email.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-control" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} placeholder="AI/ML Fullstack Engineer" />
              </div>
              <div className="form-group">
                <label className="form-label">Interviewer Name</label>
                <input className="form-control" value={form.interviewerName} onChange={e => setForm({ ...form, interviewerName: e.target.value })} placeholder="Priya Sharma" />
              </div>
              <div className="form-group">
                <label className="form-label">Interview Type</label>
                <select className="form-control" value={form.interviewType} onChange={e => setForm({ ...form, interviewType: e.target.value })}>
                  <option value="technical">Technical Round</option>
                  <option value="hr">HR Round</option>
                  <option value="managerial">Managerial Round</option>
                  <option value="final">Final Round</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Dates / Times</label>
                <input className="form-control" value={form.preferredDates} onChange={e => setForm({ ...form, preferredDates: e.target.value })} placeholder="June 10-12, mornings (10 AM - 12 PM)" />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={scheduleInterview} disabled={loading || !form.candidateName || !form.jobTitle}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Generating...</> : <><Sparkles size={16} />Generate with AI</>}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">AI Generated Output</span>
              {result && (
                <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(result); alert('Copied!'); }}>
                  Copy
                </button>
              )}
            </div>
            <div className="card-body">
              {!result && !loading && (
                <div className="empty-state">
                  <CalendarClock size={40} />
                  <h3>Interview Email & Details</h3>
                  <p>Fill in the form and click Generate to get a professional interview schedule, email draft, and preparation tips</p>
                </div>
              )}
              {loading && (
                <div className="loading-overlay">
                  <div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
                  <p style={{ fontWeight: 600, marginTop: 12 }}>Claude is drafting your interview schedule...</p>
                </div>
              )}
              {result && (
                <pre style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)' }}>
                  {result}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'jd' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Job Details</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Job Role *</label>
                <input className="form-control" value={jdForm.role} onChange={e => setJdForm({ ...jdForm, role: e.target.value })} placeholder="AI/ML Fullstack Engineer" />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={jdForm.department} onChange={e => setJdForm({ ...jdForm, department: e.target.value })}>
                  {['Engineering', 'HR', 'Marketing', 'Design', 'Finance', 'Operations'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select className="form-control" value={jdForm.experience} onChange={e => setJdForm({ ...jdForm, experience: e.target.value })}>
                  <option value="fresher">Fresher / 0-1 year</option>
                  <option value="junior">Junior / 1-3 years</option>
                  <option value="mid">Mid / 3-5 years</option>
                  <option value="senior">Senior / 5+ years</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Key Skills (comma separated)</label>
                <textarea className="form-control" rows={3} value={jdForm.skills} onChange={e => setJdForm({ ...jdForm, skills: e.target.value })} placeholder="React, Node.js, Python, Claude API, MongoDB, TailwindCSS" />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={generateJD} disabled={jdLoading || !jdForm.role}>
                {jdLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Generating...</> : <><FileText size={16} />Generate JD with AI</>}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Generated Job Description</span>
              {jdResult && (
                <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(jdResult); alert('Copied!'); }}>
                  Copy
                </button>
              )}
            </div>
            <div className="card-body">
              {!jdResult && !jdLoading && (
                <div className="empty-state">
                  <FileText size={40} />
                  <h3>AI Job Description</h3>
                  <p>Fill in the role details and Claude will generate a complete, professional job description for FWC</p>
                </div>
              )}
              {jdLoading && (
                <div className="loading-overlay">
                  <div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
                  <p style={{ fontWeight: 600, marginTop: 12 }}>Generating job description...</p>
                </div>
              )}
              {jdResult && (
                <pre style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)' }}>
                  {jdResult}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
