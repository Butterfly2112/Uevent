
import React, { useEffect, useState } from 'react';
import Logout from '../components/Logout';
import planetIcon from '../assets/planet.svg';
import searchIcon from '../assets/search.svg';
import './Home.css';

interface Event {
  id: number;
  title: string;
  description: string;
  poster_url?: string;
  start_date?: string;
  end_date?: string;
  price?: number;
  format?: string;
  theme?: string;
  status?: string;
  address?: string;
}

const AllEventTypes: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = query ? `?search=${encodeURIComponent(query)}` : '';
      const res = await fetch(`/api/events/search${params}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.data || []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(search);
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
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
          <input
            className="search-input"
            type="text"
            placeholder="Search events"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <button className="search-btn" type="submit">
            <img src={searchIcon} alt="search" style={{ width: 16, height: 16 }} />
          </button>
        </form>
        <nav className="main-nav">
          <a href="#">Browse Events</a>
          <a href="#">Create Events</a>
          <a href="#">My tickets</a>
        </nav>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
          <Logout />
        </div>
      </header>
      <main className="main-content" style={{ minHeight: 600 }}>
        <h1 style={{ textAlign: 'center', margin: '32px 0 24px 0', fontSize: 36, fontWeight: 700, color: '#222' }}>All Events</h1>
        {loading && <div style={{ textAlign: 'center', margin: 32 }}>Loading...</div>}
        {error && <div style={{ color: 'red', textAlign: 'center', margin: 32 }}>{error}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
          {events.map(event => (
            <a
              key={event.id}
              href={`/event/${event.id}`}
              style={{
                minWidth: 260,
                maxWidth: 320,
                background: '#fffbe6',
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
              {event.poster_url && event.poster_url !== 'default' ? (
                <img src={event.poster_url} alt={event.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
              ) : (
                <div style={{ width: '100%', height: 160, background: '#eee', borderRadius: 12, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 48 }}>🎫</div>
              )}
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>{event.title}</div>
              {event.start_date && (
                <div style={{ color: '#888', fontSize: 15 }}>Start: {new Date(event.start_date).toLocaleDateString()}</div>
              )}
              {event.end_date && (
                <div style={{ color: '#888', fontSize: 15 }}>End: {new Date(event.end_date).toLocaleDateString()}</div>
              )}
              {event.price !== undefined && (
                <div style={{ color: '#444', fontSize: 16, marginTop: 8 }}>Price: {event.price === 0 ? 'Free' : `${event.price}₴`}</div>
              )}
              {event.format && (
                <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Format: {event.format}</div>
              )}
              {event.theme && (
                <div style={{ color: '#666', fontSize: 14, marginTop: 2 }}>Theme: {event.theme}</div>
              )}
              {event.status && (
                <div style={{ color: '#999', fontSize: 13, marginTop: 2 }}>Status: {event.status}</div>
              )}
              {event.address && (
                <div style={{ color: '#999', fontSize: 13, marginTop: 2 }}>Location: {event.address}</div>
              )}
            </a>
          ))}
        </div>
        {!loading && events.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: '#888', margin: 48, fontSize: 22 }}>No events found</div>
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

export default AllEventTypes;
