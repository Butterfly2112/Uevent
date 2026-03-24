
import React, { useState, useEffect } from 'react';
import Logout from '../components/Logout';
import './Profile.css';

const LogoutButtonStyled = () => <Logout />;

const initialUser = {
  login: 'wepino',
  username: 'Wepino',
  email: 'wepino1637@flosek.com',
};

const Profile: React.FC = () => {
  const [user, setUser] = useState(initialUser);
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
        });
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
  return (
    <div className="profile-root">
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
          <a href="/all-event-types">All event types</a>
          <a href="/faqs">FAQs</a>
          <a href="/how-it-works">How it works</a>
          <a href="/about-us">About us</a>
        </div>
        <div className="footer-row copyright" style={{ fontWeight: 400 }}>© 2026 Uevent</div>
      </footer>
    </div>
  );
};

export default Profile;
