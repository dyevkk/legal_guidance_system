'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Upload, FileText, AlertTriangle, CheckCircle, ArrowRight, Trash2, MessageSquare, X, Send } from 'lucide-react';

interface DocResult {
    id: string;
    originalName: string;
    docType: string;
    summary: string;
    risks: string[];
    obligations: string[];
    rights: string[];
    suggestedSteps: string[];
    createdAt: string;
}

interface QA { question: string; answer: string; }

function DocumentsContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [currentDoc, setCurrentDoc] = useState<DocResult | null>(null);
    const [documents, setDocuments] = useState<DocResult[]>([]);
    const [question, setQuestion] = useState('');
    const [qaHistory, setQaHistory] = useState<QA[]>([]);
    const [qaLoading, setQaLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoading) return;
        if (!user) { router.push('/login'); return; }
        fetchDocuments();
    }, [user, isLoading, router]);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/documents`);
            setDocuments(res.data);
        } catch (e) { }
    };

    const handleFile = async (file: File) => {
        if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) { setError('Only PDF and Image files are supported.'); return; }
        if (file.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return; }
        setError('');
        setUploading(true);
        setAnalyzing(true);
        setCurrentDoc(null);
        setQaHistory([]);

        const formData = new FormData();
        formData.append('document', file);
        try {
            const res = await axios.post(`${API_URL}/api/documents/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setCurrentDoc(res.data);
            fetchDocuments();
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Upload failed.');
        } finally {
            setUploading(false);
            setAnalyzing(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, []);

    const askQuestion = async () => {
        if (!question.trim() || !currentDoc || qaLoading) return;
        const q = question;
        setQuestion('');
        setQaLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/documents/${currentDoc.id}/ask`, { question: q });
            setQaHistory(prev => [...prev, { question: q, answer: res.data.answer }]);
        } catch (e) { setQaHistory(prev => [...prev, { question: q, answer: 'Could not answer. Please try again.' }]); }
        finally { setQaLoading(false); }
    };

    const deleteDoc = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/documents/${id}`);
            setDocuments(prev => prev.filter(d => d.id !== id));
            if (currentDoc?.id === id) { setCurrentDoc(null); setQaHistory([]); }
        } catch (e) { }
    };

    const docTypeColor: Record<string, string> = {
        'FIR': '#fca5a5', 'Contract': '#93c5fd', 'Rental Agreement': '#6ee7b7',
        'Court Notice': '#fcd34d', 'Affidavit': '#c4b5fd', 'Legal Complaint': '#f9a8d4', 'Other': '#94a3b8'
    };

    return (
        <div style={{ paddingTop: '64px', minHeight: '100vh', padding: '84px 24px 40px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F1E8D8', marginBottom: '8px' }}>Legal Document Analyzer</h1>
                    <p style={{ color: '#9E9689' }}>Upload any legal document — FIR, contract, rental agreement, court notice — and get AI-powered analysis.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: documents.length > 0 ? '280px 1fr' : '1fr', gap: '24px' }}>
                    {/* Sidebar: past documents */}
                    {documents.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '1px', color: '#9E9689', marginBottom: '12px', textTransform: 'uppercase' }}>My Documents</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {documents.map(doc => (
                                    <div key={doc.id} onClick={() => { setCurrentDoc(doc); setQaHistory([]); }}
                                        className="glass-card" style={{ padding: '12px', cursor: 'pointer', border: currentDoc?.id === doc.id ? '1px solid rgba(201,162,39,0.5)' : undefined, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <span className="badge" style={{ background: `${docTypeColor[doc.docType]}20`, color: docTypeColor[doc.docType], border: `1px solid ${docTypeColor[doc.docType]}40`, fontSize: '0.65rem' }}>{doc.docType}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#D4CCBE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>{doc.originalName}</div>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); deleteDoc(doc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9689', padding: '2px' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main area */}
                    <div>
                        {/* Upload zone */}
                        {!currentDoc && !analyzing && (
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                style={{
                                    border: `2px dashed ${dragOver ? '#C9A227' : 'rgba(201,162,39,0.3)'}`,
                                    borderRadius: '16px', padding: '60px 24px', textAlign: 'center',
                                    background: dragOver ? 'rgba(201,162,39,0.05)' : 'rgba(42,42,46,0.4)',
                                    transition: 'all 0.2s ease', cursor: 'pointer',
                                }}
                                onClick={() => document.getElementById('fileInput')?.click()}>
                                <input id="fileInput" type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={e => e.target.files && handleFile(e.target.files[0])} />
                                <Upload size={48} color="#C9A227" style={{ margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#F1E8D8', marginBottom: '8px' }}>Drop your PDF or Image here</h3>
                                <p style={{ color: '#9E9689', marginBottom: '20px' }}>or click to browse — FIR, contracts, agreements, court notices</p>
                                <button className="btn-primary" style={{ pointerEvents: 'none' }}>Choose File</button>
                                {error && <div style={{ marginTop: '16px', color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
                            </div>
                        )}

                        {/* Analyzing state */}
                        {analyzing && (
                            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                                <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 20px' }} />
                                <h3 style={{ color: '#F1E8D8', marginBottom: '8px' }}>AI Analyzing Your Document...</h3>
                                <p style={{ color: '#9E9689', fontSize: '0.9rem' }}>Extracting text, detecting type, identifying risks and obligations</p>
                            </div>
                        )}

                        {/* Analysis result */}
                        {currentDoc && !analyzing && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Header */}
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FileText size={20} color="#C9A227" />
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#F1E8D8', fontSize: '0.95rem' }}>{currentDoc.originalName}</div>
                                            <span className="badge badge-gold" style={{ marginTop: '4px' }}>{currentDoc.docType}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => { setCurrentDoc(null); setQaHistory([]); document.getElementById('fileInput2')?.click(); }}
                                            className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Upload size={13} /> Upload New
                                        </button>
                                        <input id="fileInput2" type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={e => e.target.files && handleFile(e.target.files[0])} />
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="glass-card" style={{ padding: '20px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1px', color: '#C9A227', marginBottom: '10px', textTransform: 'uppercase' }}>Document Summary</div>
                                    <p style={{ color: '#D4CCBE', lineHeight: '1.7', fontSize: '0.9rem' }}>{currentDoc.summary}</p>
                                </div>

                                {/* 3-col grid: risks, obligations, rights */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    {/* Risks */}
                                    <div className="glass-card" style={{ padding: '16px', borderLeft: '3px solid #fca5a5' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                            <AlertTriangle size={15} color="#fca5a5" />
                                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '1px' }}>Risk Clauses ({currentDoc.risks.length})</span>
                                        </div>
                                        {currentDoc.risks.length === 0 ? <p style={{ color: '#9E9689', fontSize: '0.82rem' }}>No major risks detected.</p> :
                                            currentDoc.risks.map((r, i) => <div key={i} style={{ marginBottom: '8px', fontSize: '0.82rem', color: '#D4CCBE', paddingLeft: '8px', borderLeft: '2px solid rgba(252,165,165,0.3)' }}>{r}</div>)}
                                    </div>
                                    {/* Obligations */}
                                    <div className="glass-card" style={{ padding: '16px', borderLeft: '3px solid #fcd34d' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                            <ArrowRight size={15} color="#fcd34d" />
                                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '1px' }}>Obligations ({currentDoc.obligations.length})</span>
                                        </div>
                                        {currentDoc.obligations.length === 0 ? <p style={{ color: '#9E9689', fontSize: '0.82rem' }}>None identified.</p> :
                                            currentDoc.obligations.map((o, i) => <div key={i} style={{ marginBottom: '8px', fontSize: '0.82rem', color: '#D4CCBE', paddingLeft: '8px', borderLeft: '2px solid rgba(252,211,77,0.3)' }}>{o}</div>)}
                                    </div>
                                    {/* Rights */}
                                    <div className="glass-card" style={{ padding: '16px', borderLeft: '3px solid #6ee7b7' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                            <CheckCircle size={15} color="#6ee7b7" />
                                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Rights ({currentDoc.rights.length})</span>
                                        </div>
                                        {currentDoc.rights.length === 0 ? <p style={{ color: '#9E9689', fontSize: '0.82rem' }}>None detected.</p> :
                                            currentDoc.rights.map((r, i) => <div key={i} style={{ marginBottom: '8px', fontSize: '0.82rem', color: '#D4CCBE', paddingLeft: '8px', borderLeft: '2px solid rgba(110,231,183,0.3)' }}>{r}</div>)}
                                    </div>
                                </div>

                                {/* Suggested steps */}
                                {currentDoc.suggestedSteps.length > 0 && (
                                    <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #C9A227' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#C9A227', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Suggested Next Steps</div>
                                        <ol style={{ paddingLeft: '20px', color: '#D4CCBE', fontSize: '0.88rem', lineHeight: '2' }}>
                                            {currentDoc.suggestedSteps.map((s, i) => <li key={i}>{s}</li>)}
                                        </ol>
                                    </div>
                                )}

                                {/* Q&A */}
                                <div className="glass-card" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                        <MessageSquare size={16} color="#C9A227" />
                                        <span style={{ fontWeight: '700', color: '#F1E8D8', fontSize: '0.9rem' }}>Ask Questions About This Document</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input value={question} onChange={e => setQuestion(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && askQuestion()}
                                            className="input-field" placeholder="e.g., What are the termination clauses?" style={{ flex: 1 }} />
                                        <button onClick={askQuestion} disabled={!question.trim() || qaLoading} className="btn-primary" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {qaLoading ? <div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <Send size={16} />}
                                        </button>
                                    </div>
                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {qaHistory.map((qa, i) => (
                                            <div key={i}>
                                                <div style={{ fontSize: '0.82rem', color: '#C9A227', fontWeight: '600', marginBottom: '4px' }}>Q: {qa.question}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#D4CCBE', lineHeight: '1.6', background: 'rgba(201,162,39,0.04)', borderLeft: '3px solid rgba(201,162,39,0.3)', padding: '8px 12px', borderRadius: '0 6px 6px 0' }}>{qa.answer}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DocumentsPage() {
    return <><Navbar /><DocumentsContent /></>;
}
