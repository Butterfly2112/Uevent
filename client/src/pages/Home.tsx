import React, { useState } from 'react';
import Logout from '../components/Logout';
import './Home.css';

import searchIcon from '../assets/search.svg';
import planetIcon from '../assets/planet.svg';

const Home: React.FC = () => {
  const [isLoggedIn] = useState(() => !!localStorage.getItem('access_token'));

  return (
    <div className="home-root">
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
          <a href="#">Create Events</a>
          <a href="#">My tickets</a>
          {(() => {
            const profileStr = localStorage.getItem('profile');
            let company;
            try {
              if (profileStr) {
                const user = JSON.parse(profileStr);
                company = user.company;
              }
            } catch {
              // ignore JSON parse errors
            }
            if (isLoggedIn && company && company.id) {
              return <a href={`/company/${company.id}`}>View Company{company.name ? `: ${company.name}` : ''}</a>;
            } else if (isLoggedIn) {
              return <a href="/register-company">Register Company</a>;
            }
            return null;
          })()}
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

      <main className="main-content">

      </main>

      <footer className="home-footer">
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

export default Home;
