'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, MessageSquare, FileText, MapPin, Shield, ChevronRight, Star, Users, BookOpen, Zap } from 'lucide-react';
import { useAuth, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

const features = [
  {
    icon: MessageSquare, color: '#C9A227',
    title: 'AI Legal Chat',
    desc: 'Ask any legal question in plain Hindi or English. Get structured guidance with IPC sections, procedures, and rights.'
  },
  {
    icon: FileText, color: '#60a5fa',
    title: 'Document Analyzer',
    desc: 'Upload FIRs, contracts, rental agreements, court notices. AI identifies risks, obligations, and next steps.'
  },
  {
    icon: MapPin, color: '#34d399',
    title: 'Find Legal Help Nearby',
    desc: 'Locate police stations, courts, lawyers, and legal aid centers near you across major Indian cities.'
  },
  {
    icon: Shield, color: '#f472b6',
    title: '100% Confidential',
    desc: 'Your legal matters are private. Encrypted data, JWT authentication, and personal information masking.'
  }
];

const stats = [
  { icon: Users, label: 'Citizens Helped', value: '50,000+' },
  { icon: BookOpen, label: 'Legal Provisions', value: '2,500+' },
  { icon: MapPin, label: 'Cities Covered', value: '100+' },
  { icon: Zap, label: 'Avg Response', value: '< 3s' },
];

const legalCategories = [
  { name: 'Criminal Law', icon: '⚖️', desc: 'IPC sections, FIR filing, bail procedures' },
  { name: 'Consumer Rights', icon: '🛡️', desc: 'Consumer protection, refunds, complaints' },
  { name: 'Employment', icon: '💼', desc: 'Salary disputes, wrongful termination, PF' },
  { name: 'Family Law', icon: '👨‍👩‍👧', desc: 'Divorce, custody, succession, marriage' },
  { name: 'Property', icon: '🏠', desc: 'Land disputes, tenant rights, title deeds' },
  { name: 'Cybercrime', icon: '🔐', desc: 'Online fraud, identity theft, IT Act' },
];

const demoScenario = {
  query: 'My employer has not paid my salary for 3 months. What should I do?',
  category: 'Employment',
  lawApplied: 'Payment of Wages Act, 1936 · Section 25-F of Industrial Disputes Act · Labour Court jurisdiction',
  immediateAction: 'Send a written demand notice to employer → File complaint with Labour Commissioner → Approach Payment of Wages Authority'
};

function HomeContent() {
  const { user } = useAuth();
  const [demoVisible, setDemoVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDemoVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main style={{ paddingTop: '64px' }}>
      {/* Hero */}
      <section style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.08) 0%, transparent 60%), linear-gradient(180deg, #0E0E10 0%, #151517 100%)',
        padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%',
              border: `1px solid rgba(201,162,39,${0.05 - i * 0.01})`,
              width: `${300 + i * 200}px`, height: `${300 + i * 200}px`,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `spin ${20 + i * 10}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`
            }} />
          ))}
        </div>

        <div style={{ maxWidth: '800px', position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '20px', marginBottom: '32px',
            background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)',
            fontSize: '0.78rem', color: '#C9A227', fontWeight: '600', letterSpacing: '0.5px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', animation: 'pulse-gold 2s infinite' }} />
            POWERED BY GEMINI AI · INDIAN LAW DATABASE
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', color: '#F1E8D8' }}>
            Your AI-Powered<br />
            <span className="gold-gradient">Legal Rights Advisor</span>
            <br />for India
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#D4CCBE', lineHeight: '1.8', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Understand your legal rights, analyze documents, find legal aid near you — all in simple language, powered by AI trained on Indian law.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <Link href={user ? '/chat' : '/register'} className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} />
              {user ? 'Ask a Legal Question' : 'Get Free Legal Guidance'}
              <ChevronRight size={16} />
            </Link>
            <Link href="/nearby" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} />
              Find Legal Help Nearby
            </Link>
          </div>

          {/* Demo preview */}
          {demoVisible && (
            <div className="glass-card" style={{ padding: '20px', textAlign: 'left', maxWidth: '580px', margin: '0 auto', animation: 'fadeInUp 0.6s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }} />
                <span style={{ fontSize: '0.72rem', color: '#9E9689', marginLeft: '8px' }}>NyayaAI Demo</span>
              </div>
              <div className="chat-message-user" style={{ marginBottom: '12px', fontSize: '0.85rem' }}>
                &ldquo;{demoScenario.query}&rdquo;
              </div>
              <div style={{ fontSize: '0.78rem' }}>
                <div className="legal-section" style={{ marginBottom: '8px' }}>
                  <div className="legal-section-label">Applicable Law</div>
                  <div style={{ color: '#E0C56E', fontWeight: '500' }}>{demoScenario.lawApplied}</div>
                </div>
                <div className="legal-section">
                  <div className="legal-section-label">Immediate Action</div>
                  <div style={{ color: '#D4CCBE' }}>{demoScenario.immediateAction}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 24px', background: 'rgba(201,162,39,0.04)', borderTop: '1px solid rgba(201,162,39,0.1)', borderBottom: '1px solid rgba(201,162,39,0.1)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <Icon size={28} color="#C9A227" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#F1E8D8' }}>{value}</div>
              <div style={{ fontSize: '0.82rem', color: '#9E9689', fontWeight: '500' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: '800', color: '#F1E8D8', marginBottom: '16px' }}>
            Everything You Need for <span className="gold-gradient">Legal Clarity</span>
          </h2>
          <p style={{ color: '#D4CCBE', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
            From understanding your rights to finding a lawyer — NyayaAI guides you every step of the way.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="glass-card" style={{ padding: '28px', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Icon size={24} color={color} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F1E8D8', marginBottom: '10px' }}>{title}</h3>
              <p style={{ color: '#9E9689', fontSize: '0.9rem', lineHeight: '1.6' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Categories */}
      <section style={{ padding: '60px 24px', background: 'rgba(42,42,46,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#F1E8D8', marginBottom: '12px' }}>Legal Areas We Cover</h2>
          <p style={{ color: '#9E9689', marginBottom: '48px' }}>AI-powered guidance across all major areas of Indian law</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {legalCategories.map(({ name, icon, desc }) => (
              <Link key={name} href="/chat" style={{
                display: 'block', padding: '24px 16px', borderRadius: '12px', textAlign: 'center',
                background: 'rgba(42,42,46,0.8)', border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s ease', color: 'inherit',
              }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(201,162,39,0.4)'; (e.currentTarget).style.background = 'rgba(201,162,39,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget).style.background = 'rgba(42,42,46,0.8)'; }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
                <div style={{ fontWeight: '700', color: '#F1E8D8', marginBottom: '6px', fontSize: '0.9rem' }}>{name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9E9689' }}>{desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚖️</div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#F1E8D8', marginBottom: '16px' }}>
            Know Your Rights.<br /><span className="gold-gradient">Act with Confidence.</span>
          </h2>
          <p style={{ color: '#D4CCBE', marginBottom: '32px', fontSize: '1.05rem' }}>
            NyayaAI gives every Indian citizen access to legal knowledge — free, fast, and in plain language.
          </p>
          <Link href={user ? '/chat' : '/register'} className="btn-primary" style={{ fontSize: '1rem', padding: '14px 40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {user ? 'Start a Legal Query' : 'Create Free Account'}
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center', color: '#9E9689', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <Scale size={16} color="#C9A227" />
          <span style={{ color: '#C9A227', fontWeight: '700' }}>NyayaAI</span>
        </div>
        <p>⚠️ This platform provides legal information for awareness only. It is not a substitute for advice from a qualified legal professional.</p>
        <p style={{ marginTop: '8px' }}>© 2024 NyayaAI. Built for Indian Citizens. | IPC · CrPC · Consumer Act · IT Act</p>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <Navbar />
      <HomeContent />
    </AuthProvider>
  );
}
