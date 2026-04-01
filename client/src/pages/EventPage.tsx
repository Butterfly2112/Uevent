import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Logout from '../components/Logout';
import planetIcon from '../assets/planet.svg';

interface Ticket {
  id: number;
  user: {
    id: number;
    login: string;
    username: string;
    avatar_url?: string;
  };
  price_paid?: number;
  status?: string;
}



interface PromoCode {
  id: number;
  code: string;
  discount_percentage: number;
  expires_at: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  price: number;
  ticket_limit?: number;
  address?: string;
  poster_url?: string;
  redirect_url?: string;
  start_date: string;
  end_date: string;
  publish_date: string;
  status?: string;
  format?: string;
  theme?: string;
  visitor_visibility: 'everybody' | 'attendees_only';
  company?: {
    id: number;
    name: string;
    picture_url?: string;
  };
  tickets?: Ticket[];
  // comments?: Comment[];
  promo_codes?: PromoCode[];
}

const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${apiUrl}/events/${id}`, { headers });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setEvent(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Loading error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div style={{padding: 32}}>Loading event...</div>;
  if (error) return <div style={{padding: 32, color: 'red'}}>{error}</div>;
  if (!event) return <div style={{padding: 32}}>Event not found</div>;

  const isLoggedIn = !!localStorage.getItem('access_token');
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
          <a href="/">Home</a>
          <a href="/all-event-types">All Events</a>
          <a href="/create-event">Create Event</a>
          <a href="/profile">Profile</a>
        </nav>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
          {isLoggedIn ? (
            <Logout />
          ) : (
            <>
              <button className="sign-in-btn" onClick={() => window.location.href = '/login'}>Sign in</button>
              <button className="sign-in-btn" style={{marginLeft: 0}} onClick={() => window.location.href = '/register'}>Sign up</button>
            </>
          )}
        </div>

        {/* Tickets block */}
        {event.tickets && event.tickets.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22, marginBottom: 10 }}>Attendees</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {event.tickets.map(ticket => (
                <div key={ticket.id} style={{ background: '#f7f7f7', borderRadius: 10, padding: 12, minWidth: 180, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 4px #ffe06655' }}>
                  {ticket.user.avatar_url ? (
                    <img src={ticket.user.avatar_url} alt={ticket.user.username} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  ) : (
                    <span style={{ fontSize: 28 }}>👤</span>
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{ticket.user.username || ticket.user.login}</div>
                    {ticket.price_paid !== undefined && <div style={{ color: '#888', fontSize: 13 }}>Paid: {ticket.price_paid}₴</div>}
                    {ticket.status && <div style={{ color: '#aaa', fontSize: 12 }}>Status: {ticket.status}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promo codes block */}
        {event.promo_codes && event.promo_codes.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22, marginBottom: 10 }}>Promo Codes</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {event.promo_codes.map(promo => (
                <div key={promo.id} style={{ background: '#e6f7ff', borderRadius: 10, padding: 12, minWidth: 180, boxShadow: '0 1px 4px #2a7ae255' }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{promo.code}</div>
                  <div style={{ color: '#2a7ae2', fontSize: 15 }}>-{promo.discount_percentage}%</div>
                  <div style={{ color: '#888', fontSize: 13 }}>Expires: {new Date(promo.expires_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}


      </header>

      <main className="main-content">
        <div className="event-page" style={{ maxWidth: 800, margin: '32px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #ffe066', padding: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 12, color: '#181818' }}>{event.title}</h1>
                  {event.publish_date && (
                    <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>Publish date:</span> {new Date(event.publish_date).toLocaleDateString()} {new Date(event.publish_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
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
            return <img src={imgSrc} alt={event.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12, marginBottom: 18 }} />;
          })()}
          <div style={{ color: '#888', fontSize: 16, marginBottom: 8 }}>
            {event.format && <span>Format: {event.format} | </span>}
            {event.theme && <span>Theme: {event.theme} | </span>}
            {event.status && <span>Status: {event.status}</span>}
          </div>
          <div style={{ color: '#444', fontSize: 18, marginBottom: 18 }}>{event.description}</div>
          <div style={{ marginBottom: 10 }}>
            <b>Start:</b> {new Date(event.start_date).toLocaleString()}<br />
            <b>End:</b> {new Date(event.end_date).toLocaleString()}<br />
            {event.address && <><b>Address:</b> {event.address}<br /></>}
            <b>Price:</b> {event.price}₴<br />
            {event.ticket_limit && <><b>Tickets limit:</b> {event.ticket_limit}<br /></>}
          </div>
          {/* Buy ticket button removed as requested */}
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            {event.company && event.company.id !== null ? (
              (() => {
                let companyImgSrc = '';
                if (event.company.picture_url && event.company.picture_url !== 'default') {
                  companyImgSrc = event.company.picture_url;
                  if (companyImgSrc.startsWith('/uploads')) {
                    const apiUrl = import.meta.env.VITE_API_URL || '';
                    const baseUrl = apiUrl.replace(/\/api$/, '');
                    companyImgSrc = baseUrl + companyImgSrc;
                  }
                } else {
                  companyImgSrc = '/default-company-avatar.png';
                }
                return <>
                  <img src={companyImgSrc} alt={event.company.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#eee' }} />
                  <span style={{ fontWeight: 600 }}>Organized by: <a href={`/company/${event.company.id}`}>{event.company.name}</a></span>
                </>;
              })()
            ) : (
              <span style={{ fontWeight: 600, color: '#ff4d4f' }}>This company was deleted</span>
            )}
          </div>
          {event.redirect_url && (
            <div style={{ marginTop: 18 }}>
              <a href={event.redirect_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2a7ae2', fontWeight: 600 }}>Event external page</a>
            </div>
          )}
        </div>

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

export default EventPage;
