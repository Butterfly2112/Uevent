import React, { useEffect, useState } from 'react';
import Logout from '../components/Logout';
import './Profile.css';
import planetIcon from '../assets/planet.svg';

interface Company {
  id: number;
  name: string;
  email_for_info: string;
  location: string;
  description: string;
  picture_url?: string;
}

const CompanyProfile: React.FC<{ id: number }> = ({ id }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/companies/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!ignore) setCompany(data);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : 'Loading error');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchCompany();
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <div className="profile-root"><div>Loading company...</div></div>;
  if (error) return <div className="profile-root"><div style={{ color: 'red' }}>{error}</div></div>;
  if (!company) return <div className="profile-root"><div>Company not found</div></div>;

  const isLoggedIn = !!localStorage.getItem('access_token');

  return (
    <div className="profile-root" style={{ minHeight: '100vh', background: '#fffbe6', display: 'flex', flexDirection: 'column' }}>
      <header className="home-header">
        <a href="/" className="logo-block" style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: 16, textDecoration: 'none' }}>
          <span className="logo-text" style={{ fontFamily: 'Kavivanar, cursive', fontSize: 32, color: '#111' }}>Uevent</span>
          <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
            <img src={planetIcon} alt="planet" style={{ width: 28, height: 28 }} />
          </span>
        </a>
        <nav className="main-nav">
          <a href="/">Home</a>
          <a href="/all-event-types">All Events</a>
          <a href="/profile">Profile</a>
        </nav>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
          {isLoggedIn ? (
            <Logout />
          ) : (
            <>
              <button className="sign-in-btn" onClick={() => window.location.href = '/login'}>Sign in</button>
              <button className="sign-in-btn" style={{marginLeft: 0}} onClick={() => window.location.href = '/register'}>Sign up</button>
            </>
          )}
        </div>
      </header>

      <div className="profile-header" style={{ background: '#f7f48b', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', padding: '32px 0 24px 0', display: 'flex', alignItems: 'center', gap: 32 }}>
        <div className="profile-avatar" style={{ width: 120, height: 120, borderRadius: '50%', background: '#d8d5c9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, color: '#888', marginLeft: 32, overflow: 'hidden' }}>
          {company.picture_url
            ? <img src={company.picture_url} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : <span role="img" aria-label="company">🏢</span>
          }
        </div>
        <div className="profile-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
          <h2 style={{ margin: 0, fontSize: 32, color: '#222' }}>{company.name}</h2>
          <div style={{ color: '#888', fontSize: 18 }}><b>Email:</b> {company.email_for_info}</div>
          <div style={{ color: '#888', fontSize: 18 }}><b>Location:</b> {company.location || <span style={{color:'#bbb'}}>Not specified</span>}</div>
        </div>
      </div>
      <div className="profile-info-card" style={{ width: '100%', maxWidth: 600, margin: '24px auto 0 auto', background: '#fffde7', borderRadius: 16, boxShadow: '0 2px 8px #ffe066', padding: '32px 32px 24px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 20, color: '#444', whiteSpace: 'pre-line' }}>{company.description}</div>
      </div>

      <footer className="home-footer" style={{ marginTop: 'auto' }}>
        <div className="footer-row">
          <a href="/all-event-types">All event types</a>
          <a href="/faqs">FAQs</a>
          <a href="/how-it-works">How it works</a>
          <a href="/about-us">About us</a>
        </div>
        <div className="footer-row copyright">© 2026 Uevent</div>
      </footer>
    </div>
  );
};

export default CompanyProfile;
