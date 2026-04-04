import React from 'react';
import './Home.css';
import planetIcon from '../assets/planet.svg';
import { HeaderUserBlock } from '../components/HeaderUserBlock';

const AboutUs: React.FC = () => (
  <div className="home-root" style={{ minHeight: '100vh', background: '#f9f9ed', display: 'flex', flexDirection: 'column' }}>
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
        <a href="/create-event">Create Event</a>
        <a href="/profile">Profile</a>
      </nav>
      <HeaderUserBlock />
    </header>
    <main className="main-content" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 0' }}>
      <div style={{ width: '100%', maxWidth: 1100, background: 'rgba(2, 2, 2, 0.12)', borderRadius: 36, boxShadow: '0 2px 8px #e0e0c0', padding: '40px 48px', margin: '0 16px', display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h1 style={{ color: '#222', fontSize: 32, marginBottom: 18 }}><b>About Us</b></h1>
          <p style={{ color: '#222', fontSize: 18, fontFamily: 'Georgia, serif', marginBottom: 18 }}>
            <b>Uevent</b> is a team of passionate people who believe that every event is an opportunity to connect, learn, and grow. Our mission is to make it easy for everyone to discover interesting events, meet new people, and create unforgettable memories.<br/><br/>
            We started Uevent because we know how hard it can be to find the right company for an event, especially in a new city or when you want to expand your circle. We want to help you not only find events, but also find friends, travel companions, and like-minded people.<br/><br/>
            Our platform brings together people from all walks of life—students, professionals, travelers, and creatives. We believe in the power of community and shared experiences. Whether you’re looking for a conference, a concert, or a casual meetup, Uevent is here to help you make the most of every moment.<br/><br/>
            Join us and become part of a growing community that values openness, curiosity, and friendship. Let’s make every event special—together!
          </p>
        </div>
        <div style={{ position: 'relative', width: 400, minWidth: 260, height: 600 }}>
  <img 
    src='/team1.png' 
    alt="Team 1" 
    style={{ 
      width: 210, height: 160,
      borderRadius: 12, objectFit: 'cover', position: 'absolute', top: 0, left: 120, boxShadow: '0 2px 8px #bbb' 
    }} 
  />
  <img 
    src="/team2.png" 
    alt="Team 2" 
    style={{ 
      width: 210, height: 160,
      borderRadius: 12, objectFit: 'cover', position: 'absolute', top: 220, left: 0, boxShadow: '0 2px 8px #bbb' 
    }} 
  />
  <img 
    src="/team3.jpg" 
    alt="Team 3" 
    style={{ 
      width: 210, height: 160,
      borderRadius: 12, objectFit: 'cover', position: 'absolute', top: 400, left: 180, boxShadow: '0 2px 8px #bbb' 
    }} 
  />
</div>
      </div>
    </main>
    <footer className="home-footer" style={{ marginTop: 'auto' }}>
      <div className="footer-row">
        <a href="/all-event-types">All events</a>
        <a href="/how-it-works">How it works</a>
        <a href="/about-us">About us</a>
      </div>
      <div className="footer-row copyright" style={{ marginRight: 10 }}>© 2026 Uevent</div>
    </footer>
  </div>
);

export default AboutUs;
