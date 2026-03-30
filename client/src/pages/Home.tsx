import React, { useEffect, useRef, useState } from 'react';
import Logout from '../components/Logout';
import './Home.css';

import searchIcon from '../assets/search.svg';
import planetIcon from '../assets/planet.svg';
import arrowLeft from '../assets/arrowLeft.png';
import arrowRight from '../assets/arrowRight.png';

interface Event {
  id: number;
  title: string;
  poster_url?: string;
  start_date?: string;
  end_date?: string;
  price?: number;
  address?: string;
  publish_date?: string;
}

const Home: React.FC = () => {
  const [isLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const scrollCards = (direction: 'left' | 'right') => {
    const container = cardsContainerRef.current;
    if (!container) return;
    const scrollAmount = 320; // width of one card + gap
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  const [events, setEvents] = useState<Event[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (location = '') => {
    setLoading(true);
    try {
      let params = '';
      if (location) {
        params = `?location=${encodeURIComponent(location)}&limit=100`;
      } else {
        params = '?limit=100';
      }
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/events/search${params}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.data || []);
      // Extract unique locations
      const locs = Array.from(new Set((data.data || []).map((e: Event) => e.address).filter(Boolean))) as string[];
      setLocations(locs);
    } catch {
      setEvents([]);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    fetchEvents(e.target.value);
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


      <main className="main-content" style={{ minHeight: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 18px 0' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#222', margin: 0 }}>Events in {selectedLocation || '(location)'}</h2>
          <div>
            <label htmlFor="location-select" style={{ marginRight: 8, fontWeight: 500 }}>Location:</label>
            <select id="location-select" value={selectedLocation} onChange={handleLocationChange} style={{ padding: 8, borderRadius: 8, fontSize: 16 }}>
              <option value="">All</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', margin: 32 }}>Loading...</div>
        ) : (
          <div style={{ position: 'relative', width: '100%', maxWidth: 1200, margin: '0 auto' }}>
            <button
              aria-label="Scroll left"
              onClick={() => scrollCards('left')}
              style={{
                position: 'absolute',
                left: -32,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                background: 'none',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                padding: 0,
                fontSize: 0,
                cursor: 'pointer',
                boxShadow: 'none',
                display: events.length > 0 ? 'block' : 'none',
              }}
            >
              <img src={arrowLeft} alt="Left" style={{ width: 32, height: 32 }} />
            </button>
            <div
              ref={cardsContainerRef}
              style={{
                overflow: 'hidden',
                display: 'flex',
                gap: 24,
                scrollBehavior: 'smooth',
                padding: '8px 0',
                margin: '0 32px',
                minHeight: 220,
              }}
            >
              {events.length === 0 && (
                <div style={{ color: '#888', fontSize: 20, padding: 32 }}>No events found</div>
              )}
              {events.map(event => (
                <a
                  key={event.id}
                  href={`/event/${event.id}`}
                  style={{
                    minWidth: 260,
                    maxWidth: 320,
                    background: '#e6e6e6',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px #ffe066',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: '#222',
                    transition: 'box-shadow 0.2s',
                    position: 'relative',
                  }}
                >
                  {event.poster_url && event.poster_url !== 'default' && (() => {
                    let imgSrc = event.poster_url;
                    if (imgSrc.startsWith('/uploads')) {
                      const apiUrl = import.meta.env.VITE_API_URL || '';
                      const baseUrl = apiUrl.replace(/\/api$/, '');
                      imgSrc = baseUrl + imgSrc;
                    }
                    return <img src={imgSrc} alt={event.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />;
                  })()}
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, color: '#222' }}>{event.title}</div>
                  <div style={{ color: '#888', fontSize: 15, textAlign: 'center', marginBottom: 2 }}>
                    {event.publish_date && (
                      <>
                        <span style={{ fontWeight: 500 }}>Publish:</span> {new Date(event.publish_date).toLocaleDateString()} {new Date(event.publish_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br/>
                      </>
                    )}
                    {event.start_date && (
                      <>
                        <span style={{ fontWeight: 500 }}>Start:</span> {new Date(event.start_date).toLocaleDateString()} {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br/>
                      </>
                    )}
                    {event.end_date && (
                      <>
                        <span style={{ fontWeight: 500 }}>End:</span> {new Date(event.end_date).toLocaleDateString()} {new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </>
                    )}
                  </div>
                  <div style={{ color: '#222', fontWeight: 700, fontSize: 16 }}>
                    {event.price === 0 ? 'Free' : (event.price ? `${event.price}₴` : '')}
                  </div>
                </a>
              ))}
            </div>
            <button
              aria-label="Scroll right"
              onClick={() => scrollCards('right')}
              style={{
                position: 'absolute',
                right: -32,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                background: 'none',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                padding: 0,
                fontSize: 0,
                cursor: 'pointer',
                boxShadow: 'none',
                display: events.length > 0 ? 'block' : 'none',
              }}
            >
              <img src={arrowRight} alt="Right" style={{ width: 32, height: 32 }} />
            </button>
          </div>
        )}
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
