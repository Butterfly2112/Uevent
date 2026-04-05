import React, { useEffect, useRef, useState } from 'react';

import './Home.css';

import searchIcon from '../assets/search.svg';
import planetIcon from '../assets/planet.svg';
import arrowLeft from '../assets/arrowLeft.png';
import arrowRight from '../assets/arrowRight.png';
import { HeaderUserBlock } from '../components/HeaderUserBlock';

interface Event {
  id: number;
  title: string;
  poster_url?: string;
  start_date?: string;
  end_date?: string;
  price?: number;
  address?: string;
  publish_date?: string;
  companyId?: number | null;
  company?: {
    id: number;
    name: string;
  } | null;
}

const Home: React.FC = () => {
      function handleSearch() {
        if (!search.trim()) {
          setEvents(allEvents);
          return;
        }
        setEvents(
          allEvents.filter(ev =>
            ev.title.toLowerCase().includes(search.trim().toLowerCase())
          )
        );
      }
    const [search, setSearch] = useState('');
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const container = cardsContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft + container.offsetWidth < container.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
    const container = cardsContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [events]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
  const [company, setCompany] = useState<{ id: number; name: string } | null>(null);

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
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/events/search?limit=100`, { headers });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      // Show all events, including those with companyId === null
      const allFetchedEvents = data.data || [];
      setAllEvents(allFetchedEvents);
      setEvents(allFetchedEvents);
      // Extract unique locations from all events
      const locs = Array.from(new Set(allFetchedEvents.map((e: Event) => e.address).filter(Boolean))) as string[];
      setLocations(locs);
    } catch {
      setEvents([]);
      setAllEvents([]);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    if (e.target.value) {
      setEvents(allEvents.filter(ev => ev.address === e.target.value));
    } else {
      setEvents(allEvents);
    }
  };

  return (
    <div className="home-root">
      <header className="home-header" style={{ background: '#fff', borderBottom: '1px solid #e0e0c0', display: 'flex', alignItems: 'center', padding: '12px 24px', gap: 16 }}>
        <a href="/" className="logo-block" style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: 16, textDecoration: 'none' }}>
          <span className="logo-text" style={{ fontFamily: 'Kavivanar, cursive', fontSize: 32, color: '#111' }}>Uevent</span>
          <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
            <img src={planetIcon} alt="planet" style={{ width: 28, height: 28 }} />
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 24 }}>
          <input
            className="search-input"
            type="text"
            placeholder="Search events"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            style={{ minWidth: 180, background: '#fff', border: '1px solid #ffe066', borderRight: 'none', borderRadius: '20px 0 0 20px', padding: '8px 12px', fontSize: 16, color: '#222' }}
          />
          <button
            className="search-btn"
            type="button"
            onClick={handleSearch}
            style={{ borderRadius: '0 20px 20px 0', border: '1px solid #ffe066', borderLeft: 'none', width: 38, height: 38, marginLeft: 0, background: 'linear-gradient(90deg, #ffe066 60%, #ffd700 100%)', boxShadow: '0 1px 6px #ffe066', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <img src={searchIcon} alt="search" style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <nav className="main-nav">
          <a href="/all-event-types">Browse Events</a>
          <a href="/create-event">Create Event</a>
          <a href="/profile">My tickets</a>
          {isLoggedIn && company && company.id ? (
            <a href={`/company/${company.id}`}>View Company{company.name ? `: ${company.name}` : ''}</a>
          ) : isLoggedIn ? (
            <a href="/register-company">Register Company</a>
          ) : null}
        </nav>
        <HeaderUserBlock />
      </header>


      <main className="main-content" style={{ minHeight: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 18px 66px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#222', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            Events in
            <select id="location-select" value={selectedLocation} onChange={handleLocationChange} style={{
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 18,
              marginLeft: 8,
              background: '#fff',
              border: '1.5px solid #ffe066',
              color: '#222',
              boxShadow: '0 1px 4px #ffe066',
              transition: 'border 0.2s, box-shadow 0.2s',
              outline: 'none',
              fontWeight: 500,
            }}>
              <option value="">All locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </h2>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', margin: 32 }}>Loading...</div>
        ) : (
          <div style={{ position: 'relative', width: '100%', maxWidth: 1200, margin: '0 auto' }}>
            <button
              aria-label="Scroll left"
              onClick={() => canScrollLeft && scrollCards('left')}
              className="home-arrow-btn left"
              style={{
                position: 'absolute',
                left: -100,
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
                cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                boxShadow: 'none',
                display: events.length > 0 ? 'block' : 'none',
                filter: canScrollLeft ? 'none' : 'grayscale(1) brightness(1.7)',
              }}
              title={canScrollLeft ? '' : 'No more events left'}
            >
              <img src={arrowLeft} alt="Left" style={{ width: 32, height: 32, pointerEvents: 'none', filter: canScrollLeft ? 'none' : 'grayscale(1) brightness(2.2)' }} />
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => canScrollRight && scrollCards('right')}
              className="home-arrow-btn right"
              style={{
                position: 'absolute',
                right: -100,
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
                cursor: canScrollRight ? 'pointer' : 'not-allowed',
                boxShadow: 'none',
                display: events.length > 0 ? 'block' : 'none',
                filter: canScrollRight ? 'none' : 'grayscale(1) brightness(1.7)',
              }}
              title={canScrollRight ? '' : 'No more events right'}
            >
              <img src={arrowRight} alt="Right" style={{ width: 32, height: 32, pointerEvents: 'none', filter: canScrollRight ? 'none' : 'grayscale(1) brightness(2.2)' }} />
            </button>
            <div
              ref={cardsContainerRef}
              className="home-cards-container"
              style={{
                overflow: 'hidden',
                display: 'flex',
                gap: 40, 
                scrollBehavior: 'smooth',
                padding: '8px 0',
                minHeight: 220,
              }}
            >
              {events.length === 0 && (
                <div style={{ color: '#888', fontSize: 20, padding: 32 }}>No events found</div>
              )}
              {events.map(event => (
                <div key={event.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 260, maxWidth: 320 }}>
                  <a
                    href={`/event/${event.id}`}
                    style={{
                      minWidth: 260,
                      maxWidth: 320,
                      background: '#e6e6e6',
                      borderRadius: 16,
                      boxShadow: '0 2px 8px #e0e0e0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: '#222',
                      transition: 'box-shadow 0.2s',
                      position: 'relative',
                    }}
                  >
                    {(() => {
                      let imgSrc = '';
                      if (event.poster_url && event.poster_url !== 'default') {
                        imgSrc = event.poster_url;
                        if (imgSrc.startsWith('/uploads')) {
                          const apiUrl = import.meta.env.VITE_API_URL || '';
                          const baseUrl = apiUrl.replace(/\/api$/, '');
                          imgSrc = baseUrl + imgSrc;
                        }
                      } else {
                        imgSrc = '/default-event.png';
                      }
                      return <img src={imgSrc} alt={event.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 12, background: '#f0f0f0' }} />;
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
                    <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
                      {(!event.company || event.companyId === null) ? (
                        <span style={{ color: '#ff4d4f' }}>This company was deleted</span>
                      ) : (
                        <>
                          <span>Company: </span>
                          <span>{event.company.name}</span>
                        </>
                      )}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="home-footer">
        <div className="footer-row">
          <a href="/all-event-types">All events</a>
          <a href="/how-it-works">How it works</a>
          <a href="/about-us">About us</a>
        </div>
        <div className="footer-row copyright" style={{ marginRight: 10 }}>© 2026 Uevent</div>
      </footer>
    </div>
  );
};

export default Home;
