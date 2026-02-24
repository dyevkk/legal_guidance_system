'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Scale, MessageSquare, FileText, MapPin, History, LogOut, Menu, X, Shield } from 'lucide-react';

const navLinks = [
    { href: '/chat', label: 'Legal Chat', icon: MessageSquare },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/nearby', label: 'Find Help', icon: MapPin },
    { href: '/history', label: 'History', icon: History },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <>
            <nav style={{
                background: 'rgba(14, 14, 16, 0.95)',
                borderBottom: '1px solid rgba(201, 162, 39, 0.2)',
                backdropFilter: 'blur(12px)',
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '0 24px', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #C9A227, #E0C56E)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Scale size={20} color="#0E0E10" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: '#F1E8D8', lineHeight: '1' }}>NyayaAI</div>
                        <div style={{ fontSize: '0.6rem', color: '#C9A227', letterSpacing: '1.5px', fontWeight: '600' }}>LEGAL GUIDANCE</div>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
                    {user && navLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '500',
                            color: pathname === href ? '#C9A227' : '#D4CCBE',
                            background: pathname === href ? 'rgba(201, 162, 39, 0.1)' : 'transparent',
                            border: pathname === href ? '1px solid rgba(201, 162, 39, 0.3)' : '1px solid transparent',
                            transition: 'all 0.2s ease'
                        }}>
                            <Icon size={15} />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Auth area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #C9A227, #E0C56E)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: '700', color: '#0E0E10'
                                }}>
                                    {user.name[0].toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#D4CCBE', display: 'none' }} className="user-name">{user.name.split(' ')[0]}</span>
                            </div>
                            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <LogOut size={13} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Login</Link>
                            <Link href="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Get Started</Link>
                        </>
                    )}
                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} style={{
                        background: 'none', border: 'none', color: '#F1E8D8', cursor: 'pointer',
                        display: 'none', padding: '4px'
                    }} className="mobile-menu-btn">
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{
                    position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99,
                    background: '#2A2A2E', borderBottom: '1px solid rgba(201, 162, 39, 0.2)',
                    padding: '16px'
                }}>
                    {user && navLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px', color: '#F1E8D8', fontSize: '0.95rem',
                            borderRadius: '8px', marginBottom: '4px'
                        }}>
                            <Icon size={18} /> {label}
                        </Link>
                    ))}
                </div>
            )}

            <style>{`
        @media (min-width: 769px) { .user-name { display: inline !important; } }
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: block !important; } }
      `}</style>
        </>
    );
}
