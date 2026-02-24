'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { History, Trash2, MessageSquare, FileText, ChevronRight, Scale } from 'lucide-react';

interface Session {
    _id?: string; id?: string;
    title: string; category: string;
    messages: any[];
    createdAt: string; updatedAt: string;
}

const categoryColor: Record<string, string> = {
    'Criminal': '#fca5a5', 'Civil': '#93c5fd', 'Cybercrime': '#c4b5fd',
    'Consumer Protection': '#6ee7b7', 'Property Dispute': '#fcd34d',
    'Family Dispute': '#f9a8d4', 'Employment': '#86efac', 'Other': '#94a3b8'
};

function HistoryContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        if (!user) { router.push('/login'); return; }
        fetchSessions();
    }, [user, isLoading, router]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/chat/sessions`);
            setSessions(res.data);
        } catch (e) { }
        finally { setLoading(false); }
    };

    const deleteSession = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/chat/session/${id}`);
            setSessions(prev => prev.filter(s => (s._id || s.id) !== id));
        } catch (e) { }
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ paddingTop: '64px', minHeight: '100vh', padding: '84px 24px 40px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F1E8D8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <History size={28} color="#C9A227" /> Case History
                        </h1>
                        <p style={{ color: '#9E9689', fontSize: '0.9rem' }}>Your past legal queries and AI guidance sessions</p>
                    </div>
                    <Link href="/chat" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', padding: '10px 18px' }}>
                        <MessageSquare size={15} /> New Legal Query
                    </Link>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="loading-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
                        <p style={{ color: '#9E9689' }}>Loading your history...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <Scale size={48} color="#9E9689" style={{ margin: '0 auto 20px' }} />
                        <h3 style={{ color: '#F1E8D8', marginBottom: '8px' }}>No History Yet</h3>
                        <p style={{ color: '#9E9689', marginBottom: '24px' }}>Your legal queries will appear here after you start a conversation.</p>
                        <Link href="/chat" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={16} /> Ask Your First Question
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {sessions.map(session => {
                            const sid = session._id || session.id || '';
                            const color = categoryColor[session.category] || '#94a3b8';
                            const msgCount = session.messages?.length || 0;
                            return (
                                <div key={sid} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', transition: 'transform 0.15s, box-shadow 0.15s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
                                    {/* Category dot */}
                                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MessageSquare size={18} color={color} />
                                    </div>

                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F1E8D8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</h3>
                                            <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}40`, flexShrink: 0 }}>{session.category}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', color: '#9E9689', fontSize: '0.78rem' }}>
                                            <span>📅 {formatDate(session.updatedAt || session.createdAt)}</span>
                                            <span>💬 {msgCount} message{msgCount !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                        <Link href={`/chat?session=${sid}`} className="btn-secondary" style={{ padding: '7px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Continue <ChevronRight size={13} />
                                        </Link>
                                        <button onClick={() => deleteSession(sid)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', color: '#fca5a5', padding: '7px 10px', display: 'flex', alignItems: 'center' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {sessions.length > 0 && (
                    <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#9E9689' }}>
                            🔒 Your conversations are private. You can delete any session at any time.
                            <br />NyayaAI does not share your legal queries with third parties.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HistoryPage() {
    return <><Navbar /><HistoryContent /></>;
}
