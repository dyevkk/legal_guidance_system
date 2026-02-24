'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Send, Mic, MicOff, Plus, MessageSquare, Trash2, Scale, AlertTriangle } from 'lucide-react';

interface Message { role: 'user' | 'ai'; content: string; timestamp: Date; }
interface Session { id: string; _id?: string; title: string; category: string; messages?: Message[]; }

// Format structured AI legal response
function LegalResponseCard({ content }: { content: string }) {
    const sections = [
        { key: '**Issue Identified:**', label: 'Issue Identified', color: '#C9A227' },
        { key: '**Case Category:**', label: 'Case Category', color: '#60a5fa' },
        { key: '**Applicable Law:**', label: 'Applicable Law', color: '#f472b6' },
        { key: '**Explanation (Simple Language):**', label: 'Simple Explanation', color: '#34d399' },
        { key: '**Explanation (Legal Terms):**', label: 'Legal Terms', color: '#a78bfa' },
        { key: '**Possible Penalties or Rights:**', label: 'Penalties / Rights', color: '#fb923c' },
        { key: '**Immediate Actions You Should Take:**', label: 'Immediate Actions', color: '#4ade80' },
        { key: '**When to Contact Police or Lawyer:**', label: 'When to Contact', color: '#fbbf24' },
    ];

    const parsed: { label: string; color: string; text: string }[] = [];
    let remainder = content;

    for (let i = 0; i < sections.length; i++) {
        const cur = sections[i];
        const next = sections[i + 1];
        const startIdx = remainder.indexOf(cur.key);
        if (startIdx === -1) continue;
        const afterKey = remainder.indexOf('\n', startIdx) + 1;
        const endIdx = next ? remainder.indexOf(next.key) : -1;
        const text = (endIdx > -1 ? remainder.substring(afterKey, endIdx) : remainder.substring(afterKey)).trim();
        if (text) parsed.push({ label: cur.label, color: cur.color, text });
    }

    // Extract disclaimer
    const disclaimerMatch = content.match(/\*Disclaimer:[\s\S]*?\*/) || content.match(/Disclaimer:.*/);
    const disclaimer = disclaimerMatch ? disclaimerMatch[0].replace(/\*/g, '') : '';

    if (parsed.length === 0) {
        // Fallback: plain text with basic markdown
        return (
            <div className="markdown-content" style={{ whiteSpace: 'pre-wrap' }}>
                {content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/---/g, '─'.repeat(30))}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parsed.map(({ label, color, text }) => (
                <div key={label} style={{ borderLeft: `3px solid ${color}`, paddingLeft: '12px', paddingTop: '4px', paddingBottom: '4px', background: `${color}08`, borderRadius: '0 6px 6px 0' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color, marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '0.87rem', color: '#D4CCBE', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{text.trim()}</div>
                </div>
            ))}
            {disclaimer && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={14} color="#fbbf24" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#D4CCBE', fontStyle: 'italic' }}>{disclaimer.trim()}</span>
                </div>
            )}
        </div>
    );
}

function ChatContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [listening, setListening] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/chat/sessions`);
            setSessions(res.data);
        } catch (e) { }
    }, []);

    useEffect(() => {
        if (isLoading) return; // wait for localStorage to be read
        if (!user) { router.push('/login'); return; }
        fetchSessions();
    }, [user, isLoading, router, fetchSessions]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Welcome message
    useEffect(() => {
        if (user && messages.length === 0 && !currentSession) {
            setMessages([{
                role: 'ai',
                content: `**Issue Identified:** Welcome to NyayaAI!

**Case Category:** General Inquiry

**Applicable Law:** All Indian Laws — IPC, CrPC, Consumer Act, IT Act, Labour Laws

**Explanation (Simple Language):** I am NyayaAI, your AI-powered legal guidance assistant. You can ask me any legal question in English or Hindi. I'll help you understand your rights, applicable laws, and the steps you should take.

**Explanation (Legal Terms):** I operate as an AI legal awareness system, providing jurisprudential guidance based on Indian statutory law.

**Possible Penalties or Rights:** This service is free and available 24/7 for all Indian citizens.

**Immediate Actions You Should Take:**
1. Describe your legal situation in detail
2. Mention the city/state if location matters
3. I'll provide structured legal guidance

**When to Contact Police or Lawyer:** I'll tell you specifically when your case warrants professional legal intervention.

*Disclaimer: This is legal guidance information, not a substitute for professional legal advice.*`,
                timestamp: new Date()
            }]);
        }
    }, [user, messages.length, currentSession]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        const query = input;
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/chat/message`, { message: query, sessionId: currentSession });
            const aiMsg: Message = { role: 'ai', content: res.data.message.content, timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
            if (!currentSession) setCurrentSession(res.data.sessionId);
            fetchSessions();
        } catch (err: any) {
            const serverError = err.response?.data?.error;
            const explanation = serverError ? serverError : 'I could not reach the server. Please check that the backend is running and your Gemini API key is set in the .env file.';
            const errMsg: Message = { role: 'ai', content: `**Issue Identified:** Request Error\n\n**Explanation (Simple Language):** ${explanation}\n\n*Disclaimer: Please try again or check your backend logs for more details.*`, timestamp: new Date() };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    const loadSession = async (session: Session) => {
        const sid = session._id || session.id;
        try {
            const res = await axios.get(`${API_URL}/api/chat/session/${sid}`);
            setMessages(res.data.messages || []);
            setCurrentSession(sid);
        } catch (e) { }
    };

    const deleteSession = async (e: React.MouseEvent, session: Session) => {
        e.stopPropagation();
        const sid = session._id || session.id;
        try {
            await axios.delete(`${API_URL}/api/chat/session/${sid}`);
            setSessions(prev => prev.filter(s => (s._id || s.id) !== sid));
            if (currentSession === sid) { setCurrentSession(null); setMessages([]); }
        } catch (e) { }
    };

    const newChat = () => {
        setCurrentSession(null);
        setMessages([]);
    };

    const toggleVoice = () => {
        if (listening) {
            recognitionRef.current?.stop();
            setListening(false);
        } else {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) { alert('Speech recognition not supported in this browser. Try Chrome.'); return; }
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-IN';
            recognition.interimResults = false;
            recognition.onresult = (e: any) => {
                const transcript = e.results[0][0].transcript;
                setInput(prev => prev + transcript);
                setListening(false);
            };
            recognition.onerror = () => setListening(false);
            recognition.onend = () => setListening(false);
            recognition.start();
            recognitionRef.current = recognition;
            setListening(true);
        }
    };

    const categoryColor: Record<string, string> = {
        'Criminal': '#fca5a5', 'Civil': '#93c5fd', 'Cybercrime': '#c4b5fd',
        'Consumer Protection': '#6ee7b7', 'Property Dispute': '#fcd34d',
        'Family Dispute': '#f9a8d4', 'Employment': '#86efac', 'Other': '#94a3b8'
    };

    return (
        <div style={{ display: 'flex', height: '100vh', paddingTop: '64px' }}>
            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ paddingTop: '16px', display: sidebarOpen ? 'flex' : 'none', flexDirection: 'column' }}>
                <div style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={newChat} className="btn-primary" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <Plus size={16} /> New Legal Query
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1px', color: '#9E9689', padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase' }}>Recent Queries</div>
                    {sessions.length === 0 && <p style={{ color: '#9E9689', fontSize: '0.8rem', padding: '8px', textAlign: 'center' }}>No history yet</p>}
                    {sessions.map(session => {
                        const sid = session._id || session.id;
                        const dotColor = categoryColor[session.category] || '#94a3b8';
                        return (
                            <div key={sid} onClick={() => loadSession(session)} style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 10px',
                                borderRadius: '8px', marginBottom: '2px', cursor: 'pointer',
                                background: currentSession === sid ? 'rgba(201,162,39,0.1)' : 'transparent',
                                border: currentSession === sid ? '1px solid rgba(201,162,39,0.2)' : '1px solid transparent',
                                transition: 'all 0.15s ease'
                            }}
                                onMouseEnter={e => { if (currentSession !== sid) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseLeave={e => { if (currentSession !== sid) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#D4CCBE', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#9E9689' }}>{session.category}</div>
                                </div>
                                <button onClick={e => deleteSession(e, session)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9689', padding: '2px', opacity: 0.5 }}
                                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
                                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main chat */}
            <div style={{ flex: 1, marginLeft: sidebarOpen ? '260px' : '0', display: 'flex', flexDirection: 'column', transition: 'margin 0.3s ease' }} className="main-with-sidebar">
                {/* Chat header */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(14,14,16,0.8)', backdropFilter: 'blur(8px)' }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9689', padding: '4px' }}>
                        <MessageSquare size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Scale size={18} color="#C9A227" />
                        <span style={{ fontWeight: '700', color: '#F1E8D8', fontSize: '0.95rem' }}>NyayaAI Legal Chat</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#9E9689', marginLeft: 'auto' }}>Ask in English or Hindi</span>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeInUp 0.3s ease' }}>
                            {msg.role === 'user' ? (
                                <div className="chat-message-user">{msg.content}</div>
                            ) : (
                                <div className="chat-message-ai" style={{ width: '100%', maxWidth: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #C9A227, #E0C56E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Scale size={13} color="#0E0E10" />
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#C9A227', letterSpacing: '0.5px' }}>NYAYAAI LEGAL GUIDANCE</span>
                                    </div>
                                    <LegalResponseCard content={msg.content} />
                                </div>
                            )}
                            <span style={{ fontSize: '0.68rem', color: '#9E9689', marginTop: '4px' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}

                    {loading && (
                        <div className="chat-message-ai" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="loading-spinner" />
                            <span style={{ fontSize: '0.85rem', color: '#9E9689' }}>Analyzing your legal query...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(14,14,16,0.95)' }}>
                    <div style={{ display: 'flex', gap: '10px', maxWidth: '900px', margin: '0 auto' }}>
                        <button onClick={toggleVoice} style={{
                            width: '44px', height: '44px', borderRadius: '10px', border: `1px solid ${listening ? '#C9A227' : 'rgba(255,255,255,0.1)'}`,
                            background: listening ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            color: listening ? '#C9A227' : '#9E9689', animation: listening ? 'pulse-gold 1.5s infinite' : 'none'
                        }}>
                            {listening ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>

                        <textarea value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder="Describe your legal situation... (e.g., 'My landlord is refusing to return my deposit')"
                            className="input-field" rows={1} style={{ flex: 1, resize: 'none', minHeight: '44px', maxHeight: '120px', lineHeight: '1.5', paddingTop: '11px' }}
                        />

                        <button onClick={sendMessage} disabled={!input.trim() || loading} className="btn-primary" style={{
                            width: '44px', height: '44px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', flexShrink: 0,
                            opacity: !input.trim() || loading ? 0.5 : 1
                        }}>
                            <Send size={18} />
                        </button>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#9E9689', marginTop: '8px' }}>
                        Press Enter to send · Shift+Enter for new line · Click mic for voice input
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return <><Navbar /><ChatContent /></>;
}
