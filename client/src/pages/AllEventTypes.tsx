import React, { useEffect, useState } from 'react';

import planetIcon from '../assets/planet.svg';
import searchIcon from '../assets/search.svg';
import './Home.css';
import { HeaderUserBlock } from '../components/HeaderUserBlock';

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
  companyId?: number | null;
  company?: {
    id: number;
    name: string;
  } | null;
}

const AllEventTypes: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [searchHeader, setSearchHeader] = useState('');
  const [searchMain, setSearchMain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Advanced filter states
  const [format, setFormat] = useState('');
  const [theme, setTheme] = useState('');
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  // For admin/owner, always show all events (do not hide deleted companies)
  const [hideDeletedCompanies, setHideDeletedCompanies] = useState(false);

  // Get user info from localStorage for permission checks
  let user: { id: number; role: string } | null = null;
  try {
    const userStr = localStorage.getItem('profile');
    if (userStr) user = JSON.parse(userStr);
  } catch {
    // Ignore JSON parse errors
  }

  // Function to check if current user can delete the event
  const canDeleteEvent = (eventHostId: number) => {
    if (!user) return false;
    // Admins can delete any event, owners can delete their own
    return user.role === 'admin' || user.id === eventHostId;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (hideDeletedCompanies) {
      setEvents(allEvents.filter((ev: Event) => ev.company && ev.companyId !== null));
    } else {
      setEvents(allEvents);
    }
  }, [hideDeletedCompanies, allEvents]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/events/search?limit=100`, { headers });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
        const allFetchedEvents = data.data || [];
        setAllEvents(allFetchedEvents);
        setEvents(allFetchedEvents);
      // Extract unique locations for dropdown
      const locs = Array.from(new Set((data.data || []).map((e: Event) => e.address).filter(Boolean))) as string[];
      setLocations(locs);
    } catch (e: unknown) {
      setEvents([]);
      setAllEvents([]);
      setLocations([]);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Filter events by header search only on Enter or button
  const handleHeaderSearch = () => {
    if (searchHeader.trim() === "") {
      setEvents(allEvents);
    } else {
      const searchTerm = searchHeader.trim().toLowerCase();
      setEvents(
        allEvents.filter((ev: Event) =>
          (ev.title && ev.title.toLowerCase().includes(searchTerm)) ||
          (ev.description && ev.description.toLowerCase().includes(searchTerm))
        )
      );
    }
  };
  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/events/${eventId}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      setEvents(events => events.filter(ev => ev.id !== eventId));
    } catch (e) {
      alert('Failed to delete event: ' + (e instanceof Error ? e.message : 'Unknown error'));
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
            value={searchHeader}
            onChange={e => setSearchHeader(e.target.value)}
            style={{ minWidth: 180, background: '#fff', border: '1px solid #ffe066', borderRight: 'none', borderRadius: '20px 0 0 20px', padding: '8px 12px', fontSize: 16, color: '#222' }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleHeaderSearch();
              }
            }}
            />
            <button
              className="search-btn"
              onClick={handleHeaderSearch}
              type="button"
              style={{ borderRadius: '0 20px 20px 0', border: '1px solid #ffe066', borderLeft: 'none', width: 38, height: 38, marginLeft: 0, background: 'linear-gradient(90deg, #ffe066 60%, #ffd700 100%)', boxShadow: '0 1px 6px #ffe066', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              <img src={searchIcon} alt="search" style={{ width: 16, height: 16 }} />
            </button>
          </div>
        <nav className="main-nav">
          <a href="/create-event">Create Event</a>
          <a href="#">My tickets</a>
        </nav>
        <HeaderUserBlock />
      </header>
      {/* Filter form below header */}
      <div style={{
        maxWidth: 1100,
        margin: '32px auto 0 auto',
        background: '#fffbe6',
        borderRadius: 18,
        boxShadow: '0 2px 12px #ffe066',
        padding: '28px 32px 18px 32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 18,
        position: 'relative',
        top: 0,
        zIndex: 2
      }}>
        <form
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16, width: '100%', justifyContent: 'center' }}
          onSubmit={e => {
            e.preventDefault();
            let filtered = allEvents;
            if (format) filtered = filtered.filter(ev => ev.format === format);
            if (theme) filtered = filtered.filter(ev => ev.theme === theme);
            if (status) filtered = filtered.filter(ev => ev.status === status);
            if (address) filtered = filtered.filter(ev => ev.address === address);
            if (startDate) filtered = filtered.filter(ev => ev.start_date && ev.start_date >= startDate);
            if (endDate) filtered = filtered.filter(ev => ev.end_date && ev.end_date <= endDate);
            if (minPrice) filtered = filtered.filter(ev => typeof ev.price === 'number' && ev.price >= Number(minPrice));
            if (maxPrice) filtered = filtered.filter(ev => typeof ev.price === 'number' && ev.price <= Number(maxPrice));
            if (hideDeletedCompanies) {
              filtered = filtered.filter(ev => ev.company && ev.companyId !== null);
            }
            setEvents(filtered);
          }}
        >
          <select
            value={format}
            onChange={e => setFormat(e.target.value)}
            style={{ minWidth: 120, background: '#fff', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 12px', fontSize: 16, color: '#222' }}
          >
            <option value="">Format</option>
            <option value="Conference">Conference</option>
            <option value="Lecture">Lecture</option>
            <option value="Concert">Concert</option>
            <option value="Workshop">Workshop</option>
            <option value="Fest">Fest</option>
          </select>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            style={{ minWidth: 120, background: '#fff', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 12px', fontSize: 16, color: '#222' }}
          >
            <option value="">Theme</option>
            <option value="business">Business</option>
            <option value="politics">Politics</option>
            <option value="psychology">Psychology</option>
            <option value="fan meeting">Fan meeting</option>
          </select>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ minWidth: 120, background: '#fff', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 12px', fontSize: 16, color: '#222' }}
          >
            <option value="">Status</option>
            <option value="draft">Draft</option>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="ended">Ended</option>
          </select>
          <select
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{ minWidth: 140, background: '#fff', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 12px', fontSize: 16, color: '#222' }}
          >
            <option value="">All locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 0, minWidth: 120 }}>
            <label htmlFor="start-date" style={{ fontSize: 12, color: '#888', marginTop: -13, marginLeft: 2, lineHeight: 1, fontWeight: 500 }}>Start date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ minWidth: 120, background: '#fff', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 12px', fontSize: 16, color: '#222', marginTop: 0 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 0, minWidth: 120 }}>
            <label htmlFor="end-date" style={{ fontSize: 12, color: '#888', marginTop: -13, marginLeft: 2, lineHeight: 1, fontWeight: 500 }}>End date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ minWidth: 120, background: '#fff', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 12px', fontSize: 16, color: '#222', marginTop: 0 }}
            />
          </div>
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            min={0}
            onChange={e => setMinPrice(e.target.value)}
            style={{ minWidth: 100, background: '#fff', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 12px', fontSize: 16, color: '#222' }}
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            min={0}
            onChange={e => setMaxPrice(e.target.value)}
            style={{ minWidth: 100, background: '#fff', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 12px', fontSize: 16, color: '#222' }}
          />
          {(user && (user.role === 'admin' || user.role === 'owner')) ? (
            <div style={{ background: '#fffde6', border: '1.5px solid #ffe066', borderRadius: 10, padding: '7px 18px 7px 12px', marginLeft: 8, display: 'flex', alignItems: 'center', boxShadow: '0 1px 4px #ffe06633', fontWeight: 500, fontSize: 15, color: '#888', userSelect: 'none', height: 40, opacity: 0.6 }}>
              <input
                type="checkbox"
                checked={false}
                disabled
                style={{ marginRight: 8, width: 18, height: 18 }}
              />
              Hide events with deleted company (disabled for admin/owner)
            </div>
          ) : (
            <div style={{ background: '#fffde6', border: '1.5px solid #ffe066', borderRadius: 10, padding: '7px 18px 7px 12px', marginLeft: 8, display: 'flex', alignItems: 'center', boxShadow: '0 1px 4px #ffe06633', fontWeight: 500, fontSize: 15, color: '#444', userSelect: 'none', height: 40 }}>
              <input
                type="checkbox"
                checked={hideDeletedCompanies}
                onChange={e => setHideDeletedCompanies(e.target.checked)}
                style={{ marginRight: 8, width: 18, height: 18 }}
              />
              Hide events with deleted company
            </div>
          )}
          <button
            className="filter-btn"
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #ffe066 60%, #ffd700 100%)',
              border: 'none',
              borderRadius: 8,
              padding: '10px 26px',
              marginLeft: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 4px #ffe066',
              fontWeight: 700,
              fontSize: 17,
              color: '#222',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              transition: 'background 0.2s',
            }}
          >
            <svg style={{ marginRight: 10 }} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5H17M5 10H15M8 15H12" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filter
          </button>
        </form>
      </div>
      {/* Search bar for title and description */}
      <div style={{
        maxWidth: 700,
        margin: '24px auto 0 auto',
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 1px 8px #ffe066',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        position: 'relative',
        zIndex: 1
      }}>
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchMain}
          onChange={e => setSearchMain(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              // Filter by title and description on client, considering hideDeletedCompanies
              setEvents(prev => prev.filter((ev: Event) => {
                const matches =
                  (ev.title && ev.title.toLowerCase().includes(searchMain.trim().toLowerCase())) ||
                  (ev.description && ev.description.toLowerCase().includes(searchMain.trim().toLowerCase()));
                const notDeleted = !hideDeletedCompanies || (ev.company && ev.companyId !== null);
                return matches && notDeleted;
              }));
            }
          }}
          style={{
            minWidth: 320,
            background: '#fff',
            border: '1px solid #ffe066',
            borderRight: 'none',
            borderRadius: '20px 0 0 20px',
            padding: '8px 12px',
            fontSize: 17,
            color: '#222',
            outline: 'none',
          }}
        />
        <button
          className="search-btn"
          onClick={() => {
            const searchTerm = searchMain.trim().toLowerCase();
            setEvents(prev => prev.filter((ev: Event) => {
              const matches =
                (ev.title && ev.title.toLowerCase().includes(searchTerm)) ||
                (ev.description && ev.description.toLowerCase().includes(searchTerm));
              const notDeleted = !hideDeletedCompanies || (ev.company && ev.companyId !== null);
              return matches && notDeleted;
            }));
          }}
          type="button"
          style={{
            borderRadius: '0 20px 20px 0',
            border: '1px solid #ffe066',
            borderLeft: 'none',
            width: 38,
            height: 38,
            marginLeft: 0,
            background: 'linear-gradient(90deg, #ffe066 60%, #ffd700 100%)',
            boxShadow: '0 1px 6px #ffe066',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          <img src={searchIcon} alt="search" style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <main className="main-content" style={{ minHeight: 600 }}>
        <h1 style={{ textAlign: 'center', margin: '32px 0 24px 0', fontSize: 36, fontWeight: 700, color: '#222' }}>All Events</h1>
        {loading && <div style={{ textAlign: 'center', margin: 32 }}>Loading...</div>}
        {error && <div style={{ color: 'red', textAlign: 'center', margin: 32 }}>{error}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
          {events.map(event => (
            <div
              key={event.id}
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
              {/* Event image */}
              {event.poster_url && event.poster_url !== 'default' ? (() => {
                let imgSrc = event.poster_url;
                if (imgSrc.startsWith('/uploads')) {
                  const apiUrl = import.meta.env.VITE_API_URL || '';
                  const baseUrl = apiUrl.replace(/\/api$/, '');
                  imgSrc = baseUrl + imgSrc;
                }
                return <img src={imgSrc} alt={event.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />;
              })() : (
                <img src={"/default-event.png"} alt="default event" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 12, background: '#eee' }} />
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
              {/* Company deleted label or delete button */}
              {(!event.company || event.companyId === null) ? (
                <div style={{ color: '#ff4d4f', fontWeight: 600, marginTop: 12 }}>This company was deleted</div>
              ) : (
                canDeleteEvent(
                  ((event as { host?: { id: number }; owner_id?: number }).host?.id ??
                  (event as { owner_id?: number }).owner_id ??
                  (user ? user.id : 0))
                ) && (
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    style={{
                      marginTop: 12,
                      background: '#ff4d4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 18px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 15,
                      boxShadow: '0 1px 4px #ff4d4f44',
                    }}
                    title="Delete event"
                  >
                    Delete
                  </button>
                )
              )}
              {/* Link to event page */}
              <a href={`/event/${event.id}`} style={{ marginTop: 10, color: '#2a7ae2', textDecoration: 'underline', fontSize: 15 }}>View Event</a>
            </div>
          ))}
        </div>
        {!loading && events.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: '#888', margin: 48, fontSize: 22 }}>No events found</div>
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

export default AllEventTypes;
