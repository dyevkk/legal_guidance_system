'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Scale, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

function LoginContent() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/chat');
        } catch (err: any) {
            if (err?.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err?.response?.status === 400) {
                setError('Invalid email or password. Please check your credentials.');
            } else if (err?.code === 'ERR_NETWORK' || !err?.response) {
                setError('Cannot connect to server. Make sure the backend is running on port 5000.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.06) 0%, transparent 50%)' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #C9A227, #E0C56E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Scale size={30} color="#0E0E10" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#F1E8D8', marginBottom: '6px' }}>Welcome Back</h1>
                    <p style={{ color: '#9E9689', fontSize: '0.9rem' }}>Sign in to NyayaAI Legal Portal</p>
                </div>

                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px' }}>
                        <AlertCircle size={16} color="#fca5a5" />
                        <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: '#D4CCBE', marginBottom: '6px', fontWeight: '500' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} color="#9E9689" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                className="input-field" placeholder="you@example.com" style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: '#D4CCBE', marginBottom: '6px', fontWeight: '500' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} color="#9E9689" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                className="input-field" placeholder="Enter your password" style={{ paddingLeft: '40px', paddingRight: '44px' }} />
                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9E9689', padding: '0' }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', fontSize: '0.95rem', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                        {loading ? <><div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> Signing in...</> : 'Sign In to NyayaAI'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#9E9689', fontSize: '0.87rem' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" style={{ color: '#C9A227', fontWeight: '600' }}>Create free account</Link>
                    </p>
                </div>

                <div style={{ marginTop: '20px', padding: '14px', borderRadius: '8px', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#9E9689' }}>🔒 Your data is encrypted and never shared</p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return <LoginContent />;
}
