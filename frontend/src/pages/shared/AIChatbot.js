import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const QUICK_QUESTIONS = [
  "What is the leave policy?",
  "When is salary credited?",
  "How many casual leaves do I have?",
  "What are the working hours?",
  "How does the performance review work?",
  "Who should I contact for HR queries?",
];

export default function AIChatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi ${user.name.split(' ')[0]}! 👋 I'm **ARIA** — your AI HR Assistant at FWC IT Services.\n\nI can help you with leave policies, payroll queries, attendance rules, performance reviews, and more. How can I assist you today?`
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const history = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0);
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: msg,
        conversationHistory: history.slice(-6)
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Sorry, I\'m having trouble connecting. Please check your API key configuration or try again.' }]);
    } finally { setLoading(false); }
  };

  const renderMessage = (content) => {
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('\n').join('<br/>');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1e40af, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="white" />
            </div>
            ARIA — HR AI Chatbot
          </h1>
          <p>Powered by Claude AI · Ask anything about HR policies</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Chat */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="card">
            {/* Messages */}
            <div style={{ height: 480, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'assistant' ? 'linear-gradient(135deg, #1e40af, #8b5cf6)' : 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {msg.role === 'assistant' ? <Bot size={16} color="white" /> : <User size={16} color="white" />}
                  </div>
                  <div style={{
                    padding: '12px 16px', borderRadius: 16, fontSize: 13, lineHeight: 1.6,
                    background: msg.role === 'user' ? 'var(--primary)' : 'white',
                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                    boxShadow: 'var(--shadow)',
                  }} dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }} />
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 10, maxWidth: '85%' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="white" />
                  </div>
                  <div style={{ padding: '12px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 16, borderBottomLeftRadius: 4 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0, 0.2, 0.4].map((d, i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: `bounce 1s ${d}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  style={{ padding: '5px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 20, fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <input
                className="form-control"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask ARIA anything about HR policies, leaves, payroll..."
                disabled={loading}
              />
              <button className="btn btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ flexShrink: 0 }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
