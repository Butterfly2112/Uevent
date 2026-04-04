
import planetIcon from '../assets/planet.svg';
import { HeaderUserBlock } from '../components/HeaderUserBlock';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAvatarUrl } from '../components/getAvatarUrl';
import { EventRegistrationForm } from '../components/EventRegistrationForm';
import type { EventFormData } from '../components/EventRegistrationForm';

interface Ticket {
  id: number;
  user: {
    id: number;
    username: string;
    login?: string;
    avatar_url?: string;
  };
  price_paid?: number;
  status?: string;
}

interface Company {
  id: number;
  name: string;
  picture_url?: string;
  owner?: {
    id: number;
    login: string;
    username: string;
    avatar_url?: string;
  };
}

interface PromoCode {
  id: number;
  code: string;
  discount_percentage: number;
  expires_at: string;
}

interface Comment {
  id: number;
  author: {
    id: number;
    username: string;
    login?: string;
    avatar_url?: string;
  };
  content: string;
  createdAt?: string;
  created_at?: string;
  children?: Comment[];
}

interface Event {
  id: number;
  title: string;
  description: string;
  address?: string;
  start_date: string;
  end_date: string;
  publish_date?: string;
  poster_url?: string;
  format?: string;
  theme?: string;
  status?: string;
  price: number;
  ticket_limit?: number;
  tickets?: Ticket[];
  promo_codes?: PromoCode[];
  company?: Company;
  redirect_url?: string;
  comments?: Comment[];
  visitor_visibility?: 'everybody' | 'attendees_only';
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

  // State for organizer's other events (hooks должны быть до любых return)
  const [companyEvents, setCompanyEvents] = useState<Event[]>([]);
  const [companyEventsLoading, setCompanyEventsLoading] = useState(false);
  const [companyEventsError, setCompanyEventsError] = useState('');



  useEffect(() => {
    if (!event || !event.company || !event.company.id) return;
    setCompanyEventsLoading(true);
    setCompanyEventsError('');
    const fetchCompanyEvents = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiUrl}/events/search?companyId=${event.company?.id}`, { headers });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        // Если сервер возвращает объект с массивом внутри (например, { data: [...] } или { results: [...] })
        let eventsArr: Event[] = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.results)
              ? data.results
              : [];
        // Исключить текущее событие
        eventsArr = eventsArr.filter((ev: Event) => ev.id !== event.id);
        setCompanyEvents(eventsArr);
      } catch (e) {
        setCompanyEventsError(e instanceof Error ? e.message : 'Loading error');
      } finally {
        setCompanyEventsLoading(false);
      }
    };
    fetchCompanyEvents();
  }, [event]);


  // State for similar events
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [similarEventsLoading, setSimilarEventsLoading] = useState(false);
  const [similarEventsError, setSimilarEventsError] = useState('');

  // Fetch similar events by theme
  useEffect(() => {
    if (!event || !event.theme) return;
    setSimilarEventsLoading(true);
    setSimilarEventsError('');
    const fetchSimilarEvents = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiUrl}/events/search?theme=${encodeURIComponent(event.theme || '')}`, { headers });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        let eventsArr: Event[] = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.results)
              ? data.results
              : [];
        // Исключить текущее событие и события этой же компании
        eventsArr = eventsArr.filter((ev: Event) => ev && event && ev.id !== event.id && (!event.company || !ev.company || ev.company.id !== event.company.id));
        setSimilarEvents(eventsArr);
      } catch (e) {
        setSimilarEventsError(e instanceof Error ? e.message : 'Loading error');
      } finally {
        setSimilarEventsLoading(false);
      }
    };
    fetchSimilarEvents();
  }, [event]);


  // User info for permissions
  let isOwner = false;
  let isAdmin = false;
  let user: { id: number; role?: string } | null = null;
  try {
    const userStr = localStorage.getItem('profile');
    if (userStr && event && event.company && event.company.owner) {
      user = JSON.parse(userStr);
      isOwner = !!user && event.company.owner && user.id === event.company.owner.id;
      isAdmin = !!user && user.role === 'admin';
    }
  } catch {
    // ignore error
  }

  // Edit Event Modal State
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editEventLoading, setEditEventLoading] = useState(false);
  const [editEventError, setEditEventError] = useState('');

  // Prepare initial form data for edit
  const getInitialEventForm = (ev: Event) => ({
    title: ev.title || '',
    description: ev.description || '',
    price: ev.price || 0,
    ticket_limit: ev.ticket_limit || '',
    address: ev.address || '',
    poster_url: ev.poster_url || '',
    redirect_url: ev.redirect_url || '',
    start_date: ev.start_date ? new Date(ev.start_date).toISOString().slice(0, 16) : '',
    end_date: ev.end_date ? new Date(ev.end_date).toISOString().slice(0, 16) : '',
    publish_date: ev.publish_date ? new Date(ev.publish_date).toISOString().slice(0, 16) : '',
    status: ev.status || '',
    format: ev.format || '',
    theme: ev.theme || '',
    visitor_visibility: ev.visitor_visibility || 'everybody',
    promoCodes: ev.promo_codes || [],
    notificate_owner: false,
  });

  // Edit event handler
  const handleEditEvent = async (data: EventFormData) => {
    setEditEventLoading(true);
    setEditEventError('');
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      let body: BodyInit;
      const headers: Record<string, string> = {};
      if (data.poster_url && data.poster_url instanceof File) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'poster_url' && value instanceof File) {
            formData.append('file', value);
          } else if (value !== undefined && value !== null) {
            if (key === 'ticket_limit') {
              const num = typeof value === 'number' ? value : Number(value);
              if (!isNaN(num)) {
                formData.append(key, num.toString());
              }
            } else if (key === 'promoCodes' && Array.isArray(value)) {
              formData.append('promoCodes', JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });
        body = formData;
        if (token) headers['Authorization'] = `Bearer ${token}`;
      } else {
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      if (!event) throw new Error('Event not loaded');
      const res = await fetch(`${apiUrl}/events/${event.id}`, {
        method: 'PATCH',
        headers,
        body
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Error updating event');
      }
      setShowEditEvent(false);
      // Reload event
      const updated = await res.json();
      setEvent(updated);
    } catch (e) {
      setEditEventError(e instanceof Error ? e.message : 'Error updating event');
    } finally {
      setEditEventLoading(false);
    }
  };

  if (loading) return <div style={{padding: 32}}>Loading event...</div>;
  if (error) return <div style={{padding: 32, color: 'red'}}>{error}</div>;
  if (!event) return <div style={{padding: 32}}>Event not found</div>;

  return (
    <div className="home-root">
      <header className="home-header" style={{ background: '#fff', borderBottom: '1px solid #e0e0c0', display: 'flex', alignItems: 'center', padding: '12px 24px', gap: 16 }}>
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
        <HeaderUserBlock />
      </header>


      <main className="main-content">
        <div className="event-page" style={{ maxWidth: 800, margin: '32px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #ffe066', padding: 32, position: 'relative' }}>
                    {/* Edit Event Button for owner/admin */}
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => setShowEditEvent(true)}
                        style={{ position: 'absolute', top: 18, right: 24, background: '#ffe066', border: '1px solid #bfa800', color: '#222', borderRadius: 8, padding: '8px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 16, zIndex: 10 }}
                      >
                        Edit Event
                      </button>
                    )}
                {/* Edit Event Modal */}
                {(isOwner || isAdmin) && showEditEvent && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.35)',
                    zIndex: 2200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                    onClick={() => setShowEditEvent(false)}
                  >
                    <div style={{ background: '#fffde7', borderRadius: 12, boxShadow: '0 2px 8px #ffe066', padding: 32, width: '80vw', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }} onClick={e => e.stopPropagation()}>
                      <button type="button" onClick={() => setShowEditEvent(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&#10006;</button>
                      <EventRegistrationForm
                        onSubmit={handleEditEvent}
                        loading={editEventLoading}
                        error={editEventError}
                        onClose={() => setShowEditEvent(false)}
                        // @ts-expect-error EventRegistrationForm does not officially support initialData prop, but we use it for edit mode
                        initialData={getInitialEventForm(event)}
                      />
                    </div>
                  </div>
                )}
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
            {event.address && <><b>Address:</b> {event.address}<br />
              <div style={{ width: '100%', margin: '10px 0 0 0' }}>
                <iframe
                  title={`Event Location Map`}
                  width="100%"
                  height="220"
                  style={{ border: 0, borderRadius: 10, boxShadow: '0 1px 8px #ffe06655' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(event.address)}&output=embed`}
                ></iframe>
              </div>
            </>}
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
        {/* Styled Add comment form right under event card */}
        <div style={{ maxWidth: 800, margin: '18px auto 0 auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fffbe6', borderRadius: 14, boxShadow: '0 2px 8px #ffe06655', padding: 24, width: '100%' }}>
            <AddCommentForm eventId={event.id} onCommentAdded={async () => {
              // Reload event after comment
              const apiUrl = import.meta.env.VITE_API_URL || '';
              const token = localStorage.getItem('access_token');
              const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
              const res = await fetch(`${apiUrl}/events/${event.id}`, { headers });
              if (res.ok) setEvent(await res.json());
            }} />
          </div>
        </div>
      </main>

      {/* Comments block */}
      <div style={{ margin: '24px auto 0 auto', maxWidth: 800 }}>
        <h2 style={{ fontSize: 22, marginBottom: 10, color: 'rgb(62, 62, 62)' }}>Comments</h2>
        {event.comments && event.comments.length > 0 ? (
          <CommentTree comments={event.comments} eventId={event.id} level={1} onCommentChanged={async () => {
            // Reload event after comment change
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('access_token');
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${apiUrl}/events/${event.id}`, { headers });
            if (res.ok) setEvent(await res.json());
          }} />
        ) : (
          <div style={{ color: '#8b8a8a', fontSize: 16 }}>No comments yet</div>
        )}
      </div>

      {/* Organizer's other events + Similar events side by side */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        maxWidth: 1200,
        margin: '32px auto 0 auto',
        justifyContent: 'center',
      }}>
        {/* Other events by this organizer */}
        {event.company && event.company.id ? (
          <div style={{
            flex: '1 1 350px',
            minWidth: 320,
            maxWidth: 500,
            background: '#f7f7f7',
            borderRadius: 16,
            boxShadow: '0 2px 8px #e0e0e0',
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <h2 style={{ fontSize: 22, marginBottom: 14, color: '#222' }}>Other events by this organizer</h2>
            {companyEventsLoading ? (
              <div style={{ color: '#888', fontSize: 16 }}>Loading...</div>
            ) : companyEventsError ? (
              <div style={{ color: 'red', fontSize: 16 }}>{companyEventsError}</div>
            ) : companyEvents.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: 16 }}>No other events by this organizer.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', width: '100%' }}>
                {companyEvents.map(ev => {
                  let imgSrc = '';
                  if (ev.poster_url && ev.poster_url !== 'default') {
                    imgSrc = ev.poster_url;
                    if (imgSrc.startsWith('/uploads')) {
                      const apiUrl = import.meta.env.VITE_API_URL || '';
                      const baseUrl = apiUrl.replace(/\/api$/, '');
                      imgSrc = baseUrl + imgSrc;
                    }
                  } else {
                    imgSrc = '/default-event.png';
                  }
                  return (
                    <a key={ev.id} href={`/event/${ev.id}`} style={{ textDecoration: 'none', color: '#111', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e0e0e0', width: 180, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8, transition: 'box-shadow 0.2s', marginBottom: 8 }}>
                      <img src={imgSrc} alt={ev.title} style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, textAlign: 'center', color: '#111' }}>{ev.title}</div>
                      <div style={{ color: '#111', fontSize: 13, marginBottom: 0, textAlign: 'center' }}>{new Date(ev.start_date).toLocaleDateString()}</div>
                      {ev.end_date && (
                        <div style={{ color: '#111', fontSize: 13, marginBottom: 0, textAlign: 'center' }}>{new Date(ev.end_date).toLocaleDateString()}</div>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
        {/* Similar events */}
        <div style={{
          flex: '1 1 350px',
          minWidth: 320,
          maxWidth: 500,
          background: '#f7f7f7',
          borderRadius: 16,
          boxShadow: '0 2px 8px #e0e0e0',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: 22, marginBottom: 14, color: '#222' }}>Similar Events</h2>
          {similarEventsLoading ? (
            <div style={{ color: '#888', fontSize: 16 }}>Loading...</div>
          ) : similarEventsError ? (
            <div style={{ color: 'red', fontSize: 16 }}>{similarEventsError}</div>
          ) : similarEvents.length === 0 ? (
            <div style={{ color: '#aaa', fontSize: 16 }}>No similar events.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', width: '100%' }}>
              {similarEvents.map((ev: Event) => {
                let imgSrc = '';
                if (ev.poster_url && ev.poster_url !== 'default') {
                  imgSrc = ev.poster_url;
                  if (imgSrc.startsWith('/uploads')) {
                    const apiUrl = import.meta.env.VITE_API_URL || '';
                    const baseUrl = apiUrl.replace(/\/api$/, '');
                    imgSrc = baseUrl + imgSrc;
                  }
                } else {
                  imgSrc = '/default-event.png';
                }
                return (
                  <a key={ev.id} href={`/event/${ev.id}`} style={{ textDecoration: 'none', color: '#111', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e0e0e0', width: 180, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8, transition: 'box-shadow 0.2s', marginBottom: 8 }}>
                    <img src={imgSrc} alt={ev.title} style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, textAlign: 'center', color: '#111' }}>{ev.title}</div>
                    <div style={{ color: '#111', fontSize: 13, marginBottom: 0, textAlign: 'center' }}>{new Date(ev.start_date).toLocaleDateString()}</div>
                    {ev.end_date && (
                      <div style={{ color: '#111', fontSize: 13, marginBottom: 0, textAlign: 'center' }}>{new Date(ev.end_date).toLocaleDateString()}</div>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

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

export default EventPage;

// Simple recursive tree for comments with edit/delete/reply
function CommentTree(props: { comments: Comment[]; onCommentChanged: () => void; eventId: number; level?: number }) {
  const { comments, onCommentChanged, eventId, level = 1 } = props;
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editText, setEditText] = React.useState('');
  const [replyingId, setReplyingId] = React.useState<number | null>(null);
  const [replyText, setReplyText] = React.useState('');
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('profile') || 'null');
    } catch {
      return null;
    }
  }, []);
  const isAdmin = user && (user.role === 'admin' || user.login === 'admin');
  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this comment?')) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${apiUrl}/comments/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) onCommentChanged();
    else alert('Delete failed: ' + (await res.text()));
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const handleEditSave = async (id: number) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${apiUrl}/comments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content: editText }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditText('');
      onCommentChanged();
    } else {
      alert('Edit failed: ' + (await res.text()));
    }
  };

  const handleReply = (id: number) => {
    setReplyingId(id);
    setReplyText('');
  };

  const handleReplySend = async (parentId: number) => {
    if (!replyText.trim()) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${apiUrl}/comments/${eventId}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content: replyText, parentId }),
    });
    if (res.ok) {
      setReplyingId(null);
      setReplyText('');
      onCommentChanged();
    } else {
      alert('Reply failed: ' + (await res.text()));
    }
  };

  return (
    <ul style={{ listStyle: 'none', paddingLeft: level * 18, margin: 0 }}>
      {comments.map((comment: Comment) => {
        const canEdit = user && (user.id === comment.author.id);
        const canDelete = user && (user.id === comment.author.id || isAdmin);
        return (
          <li key={comment.id} style={{
            marginBottom: 18,
            background: '#fffbe6',
            borderRadius: 12,
            boxShadow: '0 2px 8px #ffe06655',
            padding: 16,
            borderLeft: `4px solid #ffe066`,
            position: 'relative',
            minWidth: 0,
            maxWidth: 700,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              {getAvatarUrl(comment.author.avatar_url) ? (
                <img src={getAvatarUrl(comment.author.avatar_url)} alt={comment.author.username} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', background: '#eee', border: '1.5px solid #ffe066' }} />
              ) : (
                <span style={{ fontSize: 28, background: '#eee', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</span>
              )}
              <span style={{ fontWeight: 700, fontSize: 17 }}>{comment.author.username}</span>
              {comment.author.login && (
                <span style={{ color: '#888', fontSize: 13, marginLeft: 4 }}>@{comment.author.login}</span>
              )}
              <span style={{ color: '#b7b7b7', fontSize: 13, marginLeft: 8 }}>{new Date(comment.created_at || comment.createdAt || '').toLocaleString()}</span>
              {level === 3 ? (
                <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {canEdit && (
                      <button onClick={() => handleEdit(comment)} style={{ background: 'none', border: 'none', color: '#2a7ae2', fontSize: 13, cursor: 'pointer', padding: '2px 8px', borderRadius: 6, transition: 'background 0.2s' }}>Edit</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {canDelete && (
                      <button onClick={() => handleDelete(comment.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', fontSize: 13, cursor: 'pointer', padding: '2px 8px', borderRadius: 6, transition: 'background 0.2s' }}>Delete</button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  {canEdit && (
                    <button onClick={() => handleEdit(comment)} style={{ background: 'none', border: 'none', color: '#2a7ae2', fontSize: 13, cursor: 'pointer', padding: '2px 8px', borderRadius: 6, transition: 'background 0.2s' }}>Edit</button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(comment.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', fontSize: 13, cursor: 'pointer', padding: '2px 8px', borderRadius: 6, transition: 'background 0.2s' }}>Delete</button>
                  )}
                  {isLoggedIn && level < 5 && (
                    <button onClick={() => handleReply(comment.id)} style={{ background: 'none', border: 'none', color: '#ffb300', fontSize: 13, cursor: 'pointer', padding: '2px 8px', borderRadius: 6, transition: 'background 0.2s' }}>Reply</button>
                  )}
                </div>
              )}
            </div>
            {editingId === comment.id ? (
              <div style={{ marginTop: 4, marginBottom: 4 }}>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={2}
                  maxLength={250}
                  style={{ width: '100%', resize: 'vertical', padding: 10, borderRadius: 8, border: '1.5px solid #ffe066', fontSize: 16, background: '#fffde7' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => handleEditSave(comment.id)} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '6px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ border: 'none', background: 'none', color: '#888', fontSize: 15, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 4, marginBottom: 4, fontSize: 16, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{comment.content}</div>
            )}
            {replyingId === comment.id && (
              <div style={{ marginTop: 4, marginBottom: 4 }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={2}
                  maxLength={250}
                  style={{ width: '100%', resize: 'vertical', padding: 10, borderRadius: 8, border: '1.5px solid #ffe066', fontSize: 16, background: '#fffde7', color: '#181818' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => handleReplySend(comment.id)} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '6px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Send</button>
                  <button onClick={() => setReplyingId(null)} style={{ border: 'none', background: 'none', color: '#888', fontSize: 15, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            {comment.children && comment.children.length > 0 && (
              <CommentTree comments={comment.children} onCommentChanged={onCommentChanged} eventId={eventId} level={level + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

interface AddCommentFormProps {
  eventId: number;
  onCommentAdded: () => void;
}

function AddCommentForm(props: AddCommentFormProps) {
  const { eventId, onCommentAdded } = props;
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const isLoggedIn = !!localStorage.getItem('access_token');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${apiUrl}/comments/${eventId}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error(await res.text());
      setText('');
      onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div style={{ color: '#888', marginBottom: 12, fontSize: 16 }}>Sign in to add a comment.</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label htmlFor="add-comment-textarea" style={{ fontWeight: 600, fontSize: 17, marginBottom: 2, color: '#181818' }}>Add a comment</label>
      <textarea
        id="add-comment-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share your thoughts about this event..."
        rows={3}
        maxLength={250}
        style={{ resize: 'vertical', padding: 12, borderRadius: 10, border: '1.5px solid #ffe066', fontSize: 16, background: '#fffde7', outline: 'none', boxShadow: '0 1px 4px #ffe06633', color: '#181818' }}
        disabled={loading}
        required
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
        <button type="submit" disabled={loading || !text.trim()} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '8px 28px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 16, color: '#181818', boxShadow: '0 1px 4px #ffe06633', transition: 'background 0.2s' }}>
          {loading ? 'Sending...' : 'Add comment'}
        </button>
        {error && <span style={{ color: 'red', fontSize: 15 }}>{error}</span>}
      </div>
    </form>
  );
}
