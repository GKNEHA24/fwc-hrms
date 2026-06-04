import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, RefreshCw, CheckCircle } from 'lucide-react';

export default function Payroll() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year] = useState(new Date().getFullYear());
  const isEmployee = user.role === 'employee';

  useEffect(() => { fetchPayroll(); }, [month]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      if (isEmployee) { const { data } = await api.get('/payroll/my'); setRecords(data); }
      else { const { data } = await api.get(`/payroll?month=${month}&year=${year}`); setRecords(data); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const generatePayroll = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/payroll/generate', { month, year });
      alert(data.message); fetchPayroll();
    } catch (e) { alert(e.response?.data?.message || 'Error'); } finally { setGenerating(false); }
  };

  const markPaid = async (id) => {
    try { await api.put(`/payroll/${id}/pay`); fetchPayroll(); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-dark" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Payroll</h1><p>{isEmployee ? 'Your salary statements' : `Month: ${months[month-1]} ${year}`}</p></div>
        {!isEmployee && (
          <div style={{ display: 'flex', gap: 12 }}>
            <select className="form-control" style={{ width: 140 }} value={month} onChange={e => setMonth(e.target.value)}>
              {months.map((m, i) => <option key={i} value={i+1}>{m} {year}</option>)}
            </select>
            {user.role === 'admin' || user.role === 'hr_recruiter' ? (
              <button className="btn btn-primary" onClick={generatePayroll} disabled={generating}>
                <RefreshCw size={16} className={generating ? 'spinning' : ''} />
                {generating ? 'Generating...' : 'Generate Payroll'}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {isEmployee && records.length > 0 && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #1e40af, #3b82f6)', border: 'none' }}>
          <div className="card-body" style={{ color: 'white' }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Latest Net Salary</div>
            <div style={{ fontSize: 36, fontWeight: 900, margin: '8px 0' }}>₹{records[0]?.netSalary?.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>For {months[records[0]?.month - 1]} {records[0]?.year} · Status: {records[0]?.status}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title">{isEmployee ? 'Salary History' : 'Payroll Records'}</span></div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {!isEmployee && <th>Employee</th>}
                <th>Period</th><th>Basic</th><th>HRA</th><th>Allowances</th>
                <th>Deductions</th><th>Net Salary</th><th>Days</th><th>Status</th>
                {user.role === 'admin' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No payroll records. Generate payroll to populate.</td></tr>
              ) : records.map((r, i) => (
                <tr key={i}>
                  {!isEmployee && <td><div style={{ fontWeight: 600, fontSize: 13 }}>{r.employee?.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.employee?.department}</div></td>}
                  <td style={{ fontWeight: 600 }}>{months[r.month - 1]} {r.year}</td>
                  <td>₹{r.basicSalary?.toLocaleString('en-IN')}</td>
                  <td>₹{Math.round(r.hra)?.toLocaleString('en-IN')}</td>
                  <td>₹{Math.round(r.allowances)?.toLocaleString('en-IN')}</td>
                  <td style={{ color: 'var(--danger)' }}>-₹{Math.round(r.deductions)?.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{r.netSalary?.toLocaleString('en-IN')}</td>
                  <td>{r.presentDays}/{r.workingDays}</td>
                  <td><span className={`badge ${r.status === 'paid' ? 'badge-success' : r.status === 'processed' ? 'badge-info' : 'badge-warning'}`}>{r.status}</span></td>
                  {user.role === 'admin' && <td>
                    {r.status !== 'paid' && <button className="btn btn-success btn-sm" onClick={() => markPaid(r._id)}><CheckCircle size={13} />Mark Paid</button>}
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
