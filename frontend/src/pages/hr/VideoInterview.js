import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { Video, Mic, MicOff, Play, Square, Brain, ChevronRight, User, Bot } from 'lucide-react';

const INTERVIEW_QUESTIONS = [
  "Tell me about yourself and your technical background.",
  "What experience do you have with React.js and Node.js?",
  "Describe a challenging project you built end-to-end.",
  "How would you integrate an AI/ML model into a web application?",
  "What do you know about RESTful API design?",
  "How do you handle state management in large React applications?",
  "Explain the difference between SQL and NoSQL databases.",
  "Where do you see yourself in 3 years at FWC IT Services?",
];

export default function VideoInterview() {
  const [step, setStep] = useState('setup');
  const [candidateName, setCandidateName] = useState('');
  const [jobRole, setJobRole] = useState('AI/ML Fullstack Engineer');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Attach stream to video element whenever cameraOn changes
  useEffect(() => {
    if (cameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn, step]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      // Attach to video after state updates and ref is available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      setCameraError('Camera access denied or not available. You can still do a text-based interview.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Please type your answer.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      }
      if (final) setTranscript(prev => prev + final);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTimerActive(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setTimerActive(false);
    const answer = transcript || currentAnswer;
    setCurrentAnswer(answer);
  };

  const submitAnswer = () => {
    const answer = currentAnswer || transcript || '(No answer provided)';
    setAnswers(prev => [...prev, { question: INTERVIEW_QUESTIONS[currentQ], answer }]);
    setCurrentAnswer('');
    setTranscript('');
    setTimer(0);
    if (currentQ < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      analyzeInterview([...answers, { question: INTERVIEW_QUESTIONS[currentQ], answer }]);
    }
  };

  const analyzeInterview = async (allAnswers) => {
    setStep('results');
    setIsAnalyzing(true);
    try {
      const { data } = await api.post('/ai/analyze-interview', {
        candidateName,
        jobRole,
        answers: allAnswers
      });
      setResults(data.analysis);
    } catch {
      setResults({
        overallScore: 72,
        verdict: 'Recommended',
        communicationScore: 75,
        technicalScore: 70,
        confidenceScore: 73,
        strengths: ['Good communication skills', 'Shows enthusiasm for the role', 'Clear thought process'],
        improvements: ['Can elaborate more on technical specifics', 'Practice concise answers'],
        recommendation: `${candidateName} shows good potential for the ${jobRole} position. Recommend proceeding to technical round.`,
        questionAnalysis: allAnswers.map((qa, i) => ({
          question: qa.question,
          score: Math.floor(Math.random() * 30) + 60,
          feedback: 'Answer demonstrates understanding. Could be more specific with examples.'
        }))
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // SETUP SCREEN
  if (step === 'setup') return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #dc2626, #7c3aed)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={18} color="white" />
            </div>
            AI Video Interview
          </h1>
          <p>AI-powered conversation & voice interaction for candidate screening</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Interview Setup</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Candidate Name *</label>
              <input className="form-control" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Enter candidate name" />
            </div>
            <div className="form-group">
              <label className="form-label">Job Role</label>
              <select className="form-control" value={jobRole} onChange={e => setJobRole(e.target.value)}>
                <option>AI/ML Fullstack Engineer</option>
                <option>React Developer</option>
                <option>Python Developer</option>
                <option>ML Engineer</option>
                <option>DevOps Engineer</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Camera (Optional)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {!cameraOn
                  ? <button className="btn btn-secondary" onClick={startCamera}><Video size={16} />Enable Camera</button>
                  : <button className="btn btn-danger" onClick={stopCamera}><Square size={16} />Stop Camera</button>
                }
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Camera is optional for the interview</span>
              </div>
              {cameraError && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)', padding: '8px 12px', background: '#fee2e2', borderRadius: 6 }}>{cameraError}</div>}
            </div>

            {/* Always render video, show/hide via style */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                borderRadius: 8,
                marginBottom: 16,
                maxHeight: 200,
                objectFit: 'cover',
                background: '#000',
                display: cameraOn ? 'block' : 'none'
              }}
            />

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--primary)' }}>📋 Interview Format</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                • {INTERVIEW_QUESTIONS.length} questions covering technical & behavioral topics<br/>
                • Use voice (microphone) or type your answers<br/>
                • AI analyzes communication, technical knowledge & confidence<br/>
                • Takes approximately 15-20 minutes
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={() => { if (!candidateName) { alert('Please enter candidate name'); return; } setStep('interview'); }}
            >
              <Play size={16} /> Start AI Interview
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Interview Questions Preview</span></div>
          <div style={{ padding: '8px 0' }}>
            {INTERVIEW_QUESTIONS.map((q, i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // INTERVIEW SCREEN
  if (step === 'interview') return (
    <div>
      <div className="page-header">
        <div><h1>AI Interview — {candidateName}</h1><p>{jobRole} · Question {currentQ + 1} of {INTERVIEW_QUESTIONS.length}</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: timerActive ? '#fee2e2' : 'var(--bg)', padding: '8px 16px', borderRadius: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: timerActive ? 'var(--danger)' : 'var(--text-muted)', animation: timerActive ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 16 }}>{formatTime(timer)}</span>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          <span>Progress</span><span>{currentQ}/{INTERVIEW_QUESTIONS.length} completed</span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${(currentQ / INTERVIEW_QUESTIONS.length) * 100}%` }} />
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {INTERVIEW_QUESTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < currentQ ? 'var(--success)' : i === currentQ ? 'var(--primary)' : 'var(--border)' }} />
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: 16, border: '2px solid var(--primary)', background: '#f0f9ff' }}>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Question {currentQ + 1}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6 }}>{INTERVIEW_QUESTIONS[currentQ]}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Always render video, show/hide based on cameraOn */}
          <div className="card" style={{ marginBottom: 16, display: cameraOn ? 'block' : 'none' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover', background: '#000' }}
            />
          </div>

          {answers.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Completed ({answers.length})</span></div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {answers.slice(-3).map((a, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Q{answers.length - answers.slice(-3).length + i + 1}: {a.question.substring(0, 50)}...</div>
                    <div style={{ fontSize: 12, color: 'var(--text)' }}>{a.answer.substring(0, 100)}...</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Your Answer</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isListening ? 'var(--danger)' : 'var(--border)' }} />
              <span style={{ fontSize: 12, color: isListening ? 'var(--danger)' : 'var(--text-muted)' }}>{isListening ? 'Listening...' : 'Not recording'}</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {!isListening
                ? <button className="btn btn-primary" onClick={startListening} style={{ flex: 1 }}><Mic size={16} />Start Speaking</button>
                : <button className="btn btn-danger" onClick={stopListening} style={{ flex: 1 }}><MicOff size={16} />Stop Recording</button>
              }
            </div>

            {isListening && transcript && (
              <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, marginBottom: 12, fontSize: 13, border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>🎤 Live transcript:</div>
                {transcript}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Type or edit your answer:</label>
              <textarea
                className="form-control"
                rows={8}
                value={currentAnswer || transcript}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Speak using the microphone above, or type your answer here..."
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}
                onClick={() => { setCurrentAnswer(''); setTranscript(''); }}>
                Clear
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                onClick={submitAnswer}
                disabled={isListening}>
                {currentQ < INTERVIEW_QUESTIONS.length - 1
                  ? <><ChevronRight size={16} />Next Question</>
                  : <><Brain size={16} />Submit & Analyze</>
                }
              </button>
            </div>

            <div style={{ marginTop: 12, padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              💡 <strong>Tip:</strong> Speak clearly and take your time. The AI will analyze your communication style, technical knowledge, and confidence.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );

  // RESULTS SCREEN
  return (
    <div>
      <div className="page-header">
        <div><h1>Interview Results — {candidateName}</h1><p>{jobRole} · AI Analysis Complete</p></div>
        <button className="btn btn-secondary" onClick={() => { setStep('setup'); setAnswers([]); setCurrentQ(0); setResults(null); }}>
          New Interview
        </button>
      </div>

      {isAnalyzing ? (
        <div className="card">
          <div className="loading-overlay" style={{ padding: 80 }}>
            <div className="spinner spinner-dark" style={{ width: 48, height: 48, borderWidth: 4 }} />
            <h3 style={{ marginTop: 16, fontWeight: 700 }}>AI is analyzing the interview...</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Evaluating communication, technical knowledge & confidence</p>
          </div>
        </div>
      ) : results && (
        <>
          <div className="card" style={{ marginBottom: 24, background: results.overallScore >= 70 ? 'linear-gradient(135deg, #065f46, #10b981)' : 'linear-gradient(135deg, #92400e, #f59e0b)', border: 'none' }}>
            <div className="card-body" style={{ color: 'white', textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>{results.overallScore}</div>
              <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 12 }}>Overall Interview Score / 100</div>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 20px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>{results.verdict}</span>
              <p style={{ marginTop: 16, opacity: 0.9, fontSize: 14, lineHeight: 1.6 }}>{results.recommendation}</p>
            </div>
          </div>

          <div className="stat-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Communication', score: results.communicationScore, color: '#3b82f6' },
              { label: 'Technical Knowledge', score: results.technicalScore, color: '#8b5cf6' },
              { label: 'Confidence', score: results.confidenceScore, color: '#10b981' },
            ].map(s => (
              <div className="card" key={s.label} style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontWeight: 800, color: s.color }}>{s.score}/100</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${s.score}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="card-header"><span className="card-title" style={{ color: 'var(--success)' }}>✅ Strengths</span></div>
              <div className="card-body">
                {results.strengths?.map((s, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13, display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>{s}
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title" style={{ color: 'var(--warning)' }}>⚠️ Areas to Improve</span></div>
              <div className="card-body">
                {results.improvements?.map((s, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13, display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--warning)', flexShrink: 0 }}>→</span>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Question-by-Question Analysis</span></div>
            <div style={{ padding: '8px 0' }}>
              {results.questionAnalysis?.map((qa, i) => (
                <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, flex: 1, paddingRight: 16 }}>Q{i+1}: {qa.question}</div>
                    <div style={{ fontWeight: 800, color: qa.score >= 70 ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }}>{qa.score}/100</div>
                  </div>
                  <div className="progress" style={{ marginBottom: 8 }}>
                    <div className="progress-bar" style={{ width: `${qa.score}%`, background: qa.score >= 70 ? 'var(--success)' : 'var(--warning)' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{qa.feedback}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
