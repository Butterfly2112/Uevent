
import React, { useEffect, useState } from 'react';
import Logout from '../components/Logout';
import { EventRegistrationForm } from '../components/EventRegistrationForm';
import type { EventFormData } from '../components/EventRegistrationForm';
import { useNavigate } from 'react-router-dom';
import planetIcon from '../assets/planet.svg';
import './Home.css';

const CreateEventPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
  const [company, setCompany] = useState<{ id: number; name?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('access_token'));
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const user = JSON.parse(profileStr);
        setCompany(user.company && user.company.id ? user.company : null);
      } catch {
        setCompany(null);
      }
    } else {
      setCompany(null);
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
      const profileStr = localStorage.getItem('profile');
      if (profileStr) {
        try {
          const user = JSON.parse(profileStr);
          setCompany(user.company && user.company.id ? user.company : null);
        } catch {
          setCompany(null);
        }
      } else {
        setCompany(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSubmit = async (data: EventFormData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'poster_url' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
          const token = localStorage.getItem('access_token');
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch('/api/events', {
            method: 'POST',
            headers,
            body: formData,
          });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create event');
      }
      const event = await response.json();
      // Redirect to the new event page
      navigate(`/event/${event.id}`);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || 'Failed to create event');
      } else {
        setError('Failed to create event');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-root">
      <header className="home-header">
        <a href="/" className="logo-block" style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: 16, textDecoration: 'none' }}>
          <span className="logo-text" style={{ fontFamily: 'Kavivanar, cursive', fontSize: 32, color: '#111' }}>Uevent</span>
          <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
            <img src={planetIcon} alt="planet" style={{ width: 28, height: 28 }} />
          </span>
        </a>
        <nav className="main-nav">
          <a href="/all-event-types">Browse Events</a>
          <a href="/profile">My tickets</a>
          {isLoggedIn && company && company.id ? (
            <a href={`/company/${company.id}`}>View Company{company.name ? `: ${company.name}` : ''}</a>
          ) : isLoggedIn ? (
            <a href="/register-company">Register Company</a>
          ) : null}
        </nav>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
          {isLoggedIn ? (
            <>
              <div
                onClick={() => window.location.href = '/profile'}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#e0e0d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 22,
                  border: '1px solid #bbb',
                }}
                title="Profile"
              >
                <span role="img" aria-label="profile">👤</span>
              </div>
              <Logout />
            </>
          ) : (
            <>
              <button className="sign-in-btn" onClick={() => window.location.href = '/login'}>Sign in</button>
              <button className="sign-in-btn" style={{marginLeft: 0}} onClick={() => window.location.href = '/register'}>Sign up</button>
            </>
          )}
        </div>
      </header>

      <main className="main-content" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!isLoggedIn ? (
          <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, background: '#fffbe6', borderRadius: 16, boxShadow: '0 2px 12px #ffe066', textAlign: 'center' }}>
            <h2 style={{ color: '#222', marginBottom: 24 }}>Create Event</h2>
            <p style={{ fontSize: 18, color: '#444', marginBottom: 32 }}>To create an event, please sign in or register.</p>
            <button onClick={() => navigate('/login')} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, color: '#222', cursor: 'pointer', marginRight: 16 }}>Sign in</button>
            <button onClick={() => navigate('/register')} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, color: '#222', cursor: 'pointer' }}>Sign up</button>
          </div>
        ) : !company ? (
          <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, background: '#fffbe6', borderRadius: 16, boxShadow: '0 2px 12px #ffe066', textAlign: 'center' }}>
            <h2 style={{ color: '#222', marginBottom: 24 }}>Create Event</h2>
            <p style={{ fontSize: 18, color: '#444', marginBottom: 32 }}>To create an event, you need to register your company first.</p>
            <button onClick={() => navigate('/register-company')} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, color: '#222', cursor: 'pointer' }}>Register Company</button>
          </div>
        ) : (
          <div style={{
            background: '#fffde7',
            borderRadius: 12,
            boxShadow: '0 2px 8px #ffe066',
            padding: 32,
            width: '80vw',
            maxWidth: 900,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            position: 'relative',
          }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                color: '#888',
              }}
              aria-label="Close"
            >
              &#10006;
            </button>
            <EventRegistrationForm onSubmit={handleSubmit} loading={loading} error={error || undefined} onClose={() => navigate(-1)} />
          </div>
        )}
      </main>

      <footer className="home-footer">
        <div className="footer-row">
          <a href="/all-event-types">All events</a>
          <a href="/how-it-works">How it works</a>
          <a href="/about-us">About us</a>
        </div>
        <div className="footer-row copyright">© 2026 Uevent</div>
      </footer>
    </div>
  );
};

export default CreateEventPage;
