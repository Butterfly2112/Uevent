import React from 'react';
import './Home.css';
import planetIcon from '../assets/planet.svg';

const HowItWorks: React.FC = () => (
  <div className="home-root" style={{ minHeight: '100vh', background: '#f9f9ed' }}>
    <header className="home-header" style={{ background: '#fff', borderBottom: '1px solid #e0e0c0', display: 'flex', alignItems: 'center', padding: '12px 24px', gap: 16 }}>
      <a href="/" className="logo-block" style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: 16, textDecoration: 'none' }}>
        <span className="logo-text" style={{ fontFamily: 'Kavivanar, cursive', fontSize: 32, color: '#111' }}>Uevent</span>
        <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
          <img src={planetIcon} alt="planet" style={{ width: 28, height: 28 }} />
        </span>
      </a>
      <nav className="main-nav" style={{ display: 'flex', gap: 32, marginLeft: 40 }}>
        <a href="/">Home</a>
        <a href="/all-event-types">All Events</a>
        <a href="/profile">Profile</a>
      </nav>
    </header>
    <main className="main-content" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 0' }}>
      <div style={{ width: '100%', maxWidth: 900, background: '#fffde7', borderRadius: 18, boxShadow: '0 2px 8px #ffe066', padding: '40px 48px', margin: '0 16px' }}>
        <h1 style={{ color: '#222', fontSize: 38, marginBottom: 18, textAlign: 'center', letterSpacing: 1 }}>How It Works</h1>
        <div style={{ color: '#444', fontSize: 20, lineHeight: 1.7 }}>
          <p><b>Uevent</b> helps you find and connect with people who are attending the same events as you—whether it’s a conference, concert, or festival. Our platform makes it easy to discover events, see who else is going, and make plans together before, during, and after the event.</p>
          <div style={{ marginLeft: 0, fontSize: 19, marginBottom: 18 }}>
            <div style={{ marginBottom: 10 }}><b>Find events:</b> Search for events in any city and see all the details in one place.</div>
            <div style={{ marginBottom: 10 }}><b>See who’s attending:</b> Check if your friends or other like-minded people are planning to go.</div>
            <div style={{ marginBottom: 10 }}><b>Connect before the event:</b> Chat, make travel plans, or find someone to share accommodation with.</div>
            <div style={{ marginBottom: 10 }}><b>Meet up and enjoy:</b> Spend time together at the event, split costs, and make new friends.</div>
          </div>
          <p>Uevent is about more than just attending events—it's about making connections, sharing experiences, and turning every event into a memorable adventure. Join the community and never go to an event alone again!</p>
        </div>
      </div>
    </main>
  </div>
);

export default HowItWorks;
