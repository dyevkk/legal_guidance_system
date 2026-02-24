'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Scale, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

function RegisterContent() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await register(name, email, password);
            router.push('/chat');
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const benefits = ['Free AI legal guidance 24/7', 'Document analysis & risk detection', 'Secure & confidential conversations'];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.06) 0%, transparent 50%)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '860px', width: '100%', alignItems: 'center' }}>
                {/* Left side */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #C9A227, #E0C56E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Scale size={22} color="#0E0E10" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F1E8D8' }}>NyayaAI</div>
                            <div style={{ fontSize: '0.65rem', color: '#C9A227', letterSpacing: '1.5px', fontWeight: '600' }}>LEGAL GUIDANCE</div>
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#F1E8D8', marginBottom: '12px', lineHeight: '1.2' }}>
                        Your Legal Rights,<br /><span className="gold-gradient">Explained Simply.</span>
                    </h2>
                    <p style={{ color: '#D4CCBE', lineHeight: '1.7', marginBottom: '28px' }}>
                        Join thousands of Indian citizens using NyayaAI to understand their legal rights and navigate the justice system confidently.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {benefits.map(b => (
                            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle size={18} color="#34d399" />
                                <span style={{ color: '#D4CCBE', fontSize: '0.9rem' }}>{b}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="glass-card" style={{ padding: '36px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#F1E8D8', marginBottom: '24px' }}>Create Free Account</h3>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                            <AlertCircle size={15} color="#fca5a5" />
                            <span style={{ fontSize: '0.83rem', color: '#fca5a5' }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#D4CCBE', marginBottom: '5px', fontWeight: '500' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={15} color="#9E9689" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                    className="input-field" placeholder="Your full name" style={{ paddingLeft: '38px' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#D4CCBE', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color="#9E9689" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    className="input-field" placeholder="you@example.com" style={{ paddingLeft: '38px' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#D4CCBE', marginBottom: '5px', fontWeight: '500' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color="#9E9689" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                    className="input-field" placeholder="Min. 6 characters" style={{ paddingLeft: '38px', paddingRight: '42px' }} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9E9689' }}>
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                            {loading ? <><div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> Creating Account...</> : 'Create Free Account →'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#9E9689', fontSize: '0.85rem' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: '#C9A227', fontWeight: '600' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return <RegisterContent />;
}
