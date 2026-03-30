
import React, { useState, useEffect } from 'react';
import Logout from '../components/Logout';
import './Profile.css';
import planetIcon from '../assets/planet.svg';
import searchIcon from '../assets/search.svg';

const LogoutButtonStyled = () => <Logout />;

type Company = {
  id: number;
  name: string;
};

type UserState = {
  login: string;
  username: string;
  email: string;
  company?: Company;
};

const initialUser: UserState = {
  login: 'wepino',
  username: 'Wepino',
  email: 'wepino1637@flosek.com',
  company: undefined,
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserState>(initialUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authorization token');
          setLoading(false);
          return;
        }
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (response.status === 401) {
          // Token expired or invalid, logout
          localStorage.removeItem('access_token');
          window.location.href = '/';
          return;
        }
        if (!response.ok) {
          setError('Error loading profile');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setUser({
          login: data.login,
          username: data.username,
          email: data.email,
          company: data.company,
        });
        // Store user profile in localStorage for owner checks in CompanyProfile and Home
        localStorage.setItem('profile', JSON.stringify({
          id: data.id,
          login: data.login,
          username: data.username,
          email: data.email,
          company: data.company,
        }));
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-root"><div>Loading profile...</div></div>;
  }
  if (error) {
    return <div className="profile-root"><div style={{color: 'red'}}>{error}</div></div>;
  }
  // Header as on all pages
  const isLoggedIn = !!localStorage.getItem('access_token');
  return (
    <div className="profile-root">
      <header className="home-header">
        <a href="/" className="logo-block" style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: 16, textDecoration: 'none' }}>
          <span className="logo-text" style={{ fontFamily: 'Kavivanar, cursive', fontSize: 32, color: '#111' }}>Uevent</span>
          <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
            <img src={planetIcon} alt="planet" style={{ width: 28, height: 28 }} />
          </span>
        </a>
        <input className="search-input" type="text" placeholder="Search events" />
        <button className="search-btn">
          <img src={searchIcon} alt="search" style={{ width: 16, height: 16 }} />
        </button>
        <nav className="main-nav">
          <a href="#">Browse Events</a>
          <a href="/create-event">Create Event</a>
          <a href="#">My tickets</a>
          {isLoggedIn && user.company && user.company.id ? (
            <a href={`/company/${user.company.id}`}>View Company{user.company.name ? `: ${user.company.name}` : ''}</a>
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
      <div className="profile-header">
        <div className="profile-avatar">
          <span role="img" aria-label="profile">👤</span>
        </div>
        <div className="profile-info">
          <h2 style={{ margin: 0, fontSize: 32, color: '#222' }}>{user.login}</h2>
          <div style={{ color: '#888', fontSize: 18 }}>{user.email}</div>
          <div style={{ color: '#444', fontSize: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>Login: <b>{user.login}</b></span>
          </div>
          <div style={{ marginTop: 16 }}>
            <LogoutButtonStyled />
          </div>
        </div>
      </div>

      <footer className="home-footer" style={{ position: 'fixed', left: 0, bottom: 0, width: '100%', margin: 0 }}>
        <div className="footer-row">
          <a href="/all-event-types">All events</a>
          <a href="/how-it-works">How it works</a>
          <a href="/about-us">About us</a>
        </div>
        <div className="footer-row copyright" style={{ fontWeight: 400 }}>© 2026 Uevent</div>
      </footer>
    </div>
  );
};

export default Profile;
