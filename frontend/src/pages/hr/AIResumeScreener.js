import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Brain, Upload, Zap, CheckCircle, AlertCircle, FileText, X } from 'lucide-react';

// Extract text from PDF using pdf.js (loaded via CDN script tag)
async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        // Use pdfjsLib if available (loaded via CDN), else fallback
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
          }
          resolve(text.trim());
        } else {
          reject(new Error('PDF library not loaded'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function PDFUploader({ label, value, onChange, placeholder }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    setError('');
    setFileName(file.name);
    setExtracting(true);
    try {
      const text = await extractTextFromPDF(file);
      if (!text || text.length < 10) {
        setError('Could not extract text from this PDF. It may be scanned. Please try a different file.');
        setExtracting(false);
        return;
      }
      onChange(text);
    } catch (err) {
      setError('Failed to read PDF. Please try again.');
    } finally {
      setExtracting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const clearFile = () => {
    setFileName('');
    setError('');
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      {/* Load pdf.js from CDN */}
      {!window.pdfjsLib && (
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          onLoad={() => {}}
        />
      )}

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !fileName && inputRef.current?.click()}
        style={{
          border: `2px dashed ${value ? 'var(--success)' : error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: fileName ? 'default' : 'pointer',
          background: value ? '#f0fdf4' : error ? '#fff5f5' : 'var(--bg)',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />

        {extracting ? (
          <div>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28, margin: '0 auto 8px' }} />
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Extracting text from PDF...</div>
          </div>
        ) : value ? (
          <div>
            <FileText size={28} color="var(--success)" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--success)', marginBottom: 4 }}>{fileName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              ✓ Text extracted successfully ({value.length} characters)
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <Upload size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{placeholder || 'Click or drag & drop PDF here'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports PDF files only</div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}
    </div>
  );
}

// Inject pdfjs script once on mount
function PdfJsLoader() {
  useEffect(() => {
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
  return null;
}

export default function AIResumeScreener() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [activeTab, setActiveTab] = useState('single');

  useEffect(() => {
    api.get('/recruitment').then(r => setJobs(r.data)).catch(console.error);
  }, []);

  const screenResume = async () => {
    if (!selectedJob || !resumeText) return alert('Select a job and upload a resume PDF');
    setLoading(true); setAnalysis(null);
    const job = jobs.find(j => j._id === selectedJob);
    try {
      const { data } = await api.post('/ai/screen-resume', {
        jobId: selectedJob,
        resumeText,
        jobDescription: `${job?.title} - ${job?.description}. Required skills: ${job?.skills?.join(', ')}`
      });
      setAnalysis(data.analysis);
    } catch (e) { alert('AI screening failed. Check your API key.'); }
    finally { setLoading(false); }
  };

  const bulkScreen = async () => {
    if (!selectedJob) return alert('Select a job first');
    setBulkLoading(true); setBulkResults([]);
    try {
      const { data } = await api.post(`/ai/bulk-screen/${selectedJob}`);
      setBulkResults(data.results || []);
    } catch (e) { alert('Bulk screening failed. Check your API key.'); }
    finally { setBulkLoading(false); }
  };

  const getScoreColor = (score) => score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const getVerdictBadge = (verdict) => {
    const m = { 'Strongly Recommended': 'badge-success', 'Recommended': 'badge-info', 'Neutral': 'badge-warning', 'Not Recommended': 'badge-danger' };
    return m[verdict] || 'badge-muted';
  };

  return (
    <div>
      <PdfJsLoader />
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="white" />
            </div>
            AI Resume Screener
          </h1>
          <p>Powered by Claude AI · Screen candidates instantly</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>Single Resume</button>
        <button className={`tab ${activeTab === 'bulk' ? 'active' : ''}`} onClick={() => setActiveTab('bulk')}>Bulk Screen All</button>
      </div>

      {activeTab === 'single' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Resume Input</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Select Job Position *</label>
                  <select className="form-control" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
                    <option value="">Choose a job...</option>
                    {jobs.map(j => <option key={j._id} value={j._id}>{j.title} — {j.department}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Candidate Name</label><input className="form-control" value={candidateName} onChange={e => setCandidateName(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} /></div>
                </div>

                <PDFUploader
                  label="Resume PDF *"
                  value={resumeText}
                  onChange={setResumeText}
                  placeholder="Click or drag & drop Resume PDF here"
                />

                <PDFUploader
                  label="Cover Letter PDF (optional)"
                  value={coverLetterText}
                  onChange={setCoverLetterText}
                  placeholder="Click or drag & drop Cover Letter PDF here"
                />

                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={screenResume} disabled={loading || !selectedJob || !resumeText}>
                  {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing with AI...</> : <><Brain size={16} />Screen with AI</>}
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div>
            {!analysis && !loading && (
              <div className="card">
                <div className="empty-state" style={{ padding: 60 }}>
                  <Brain size={48} />
                  <h3>AI Analysis</h3>
                  <p>Upload a resume PDF and click "Screen with AI" to get instant analysis</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="card">
                <div className="loading-overlay" style={{ padding: 80 }}>
                  <div className="spinner spinner-dark" style={{ width: 40, height: 40, borderWidth: 3 }} />
                  <p style={{ marginTop: 16, fontWeight: 600 }}>Claude is analyzing the resume...</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Checking skills, experience, and fit</p>
                </div>
              </div>
            )}

            {analysis && (
              <div>
                <div className="card" style={{ marginBottom: 16, background: `linear-gradient(135deg, ${getScoreColor(analysis.score)}22, ${getScoreColor(analysis.score)}11)`, border: `1px solid ${getScoreColor(analysis.score)}40` }}>
                  <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 56, fontWeight: 900, color: getScoreColor(analysis.score), lineHeight: 1 }}>{analysis.score}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>AI Match Score / 100</div>
                    <span className={`badge ${getVerdictBadge(analysis.verdict)}`} style={{ fontSize: 13, padding: '6px 16px' }}>{analysis.verdict}</span>
                    <p style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6 }}>{analysis.summary}</p>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><span className="card-title">Skills Analysis</span></div>
                  <div className="card-body">
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>✅ Matched Skills</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(analysis.keySkillsMatch || []).map((s, i) => <span key={i} style={{ padding: '3px 10px', background: '#d1fae5', color: '#065f46', borderRadius: 4, fontSize: 12 }}>{s}</span>)}
                      </div>
                    </div>
                    {analysis.missingSkills?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>❌ Missing Skills</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {analysis.missingSkills.map((s, i) => <span key={i} style={{ padding: '3px 10px', background: '#fee2e2', color: '#991b1b', borderRadius: 4, fontSize: 12 }}>{s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: 16 }}>
                  <div className="card">
                    <div className="card-header"><span className="card-title" style={{ color: 'var(--success)' }}>Strengths</span></div>
                    <div className="card-body" style={{ padding: '12px 16px' }}>
                      {(analysis.strengths || []).map((s, i) => <div key={i} style={{ padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}><CheckCircle size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />{s}</div>)}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header"><span className="card-title" style={{ color: 'var(--warning)' }}>Gaps</span></div>
                    <div className="card-body" style={{ padding: '12px 16px' }}>
                      {(analysis.gaps || []).map((g, i) => <div key={i} style={{ padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}><AlertCircle size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />{g}</div>)}
                    </div>
                  </div>
                </div>

                {analysis.interviewQuestions?.length > 0 && (
                  <div className="card">
                    <div className="card-header"><span className="card-title">Suggested Interview Questions</span></div>
                    <div className="card-body" style={{ padding: '12px 16px' }}>
                      {analysis.interviewQuestions.map((q, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13, display: 'flex', gap: 8 }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>Q{i+1}.</span>{q}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, margin: 0, minWidth: 240 }}>
                  <label className="form-label">Select Job to Screen All Applications</label>
                  <select className="form-control" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
                    <option value="">Choose a job...</option>
                    {jobs.map(j => <option key={j._id} value={j._id}>{j.title} — {j.department}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary btn-lg" onClick={bulkScreen} disabled={bulkLoading || !selectedJob}>
                  {bulkLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Screening all...</> : <><Zap size={16} />Bulk Screen All</>}
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>This will screen all applications for the selected job and rank them by AI score.</p>
            </div>
          </div>

          {bulkResults.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Ranked Candidates ({bulkResults.length})</span></div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Rank</th><th>Candidate</th><th>AI Score</th><th>Verdict</th><th>Summary</th></tr></thead>
                  <tbody>
                    {bulkResults.map((r, i) => (
                      <tr key={i}>
                        <td><div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? ['#fbbf24','#9ca3af','#cd7c3f'][i] : 'var(--border)', color: i < 3 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{i+1}</div></td>
                        <td style={{ fontWeight: 600 }}>{r.candidateName}</td>
                        <td><span style={{ fontWeight: 800, fontSize: 16, color: getScoreColor(r.score) }}>{r.score}</span><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</span></td>
                        <td><span className={`badge ${getVerdictBadge(r.verdict)}`}>{r.verdict}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
