import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventRegistrationForm } from '../components/EventRegistrationForm';
import type { EventFormData } from '../components/EventRegistrationForm';

import './Profile.css';
import planetIcon from '../assets/planet.svg';
import { HeaderUserBlock } from '../components/HeaderUserBlock';

interface Event {
  id: number;
  title: string;
  start_date?: string;
  end_date?: string;
  poster_url?: string;
  status?: string;
  publish_date?: string;
  companyId?: number | null;
  address?: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  images_url?: string[];
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  email_for_info: string;
  location: string;
  description: string;
  picture_url?: string;
  owner?: {
    id: number;
    login: string;
    username: string;
    avatar_url?: string;
  };
  events?: Event[];
  news?: News[];
}


const CompanyProfile: React.FC<{ id: number }> = ({ id }) => {
  const navigate = useNavigate();
  // Deleted state must be defined before any conditional rendering
  const [deleted, setDeleted] = useState(false);
  // State for event registration modal
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormLoading, setEventFormLoading] = useState(false);
  const [eventFormError, setEventFormError] = useState('');
    // Event registration handler
    const handleEventRegister = async (data: EventFormData) => {
      setEventFormLoading(true);
      setEventFormError('');
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
                // Always append as number string, even if value is string
                const num = typeof value === 'number' ? value : Number(value);
                if (!isNaN(num)) {
                  formData.append(key, num.toString());
                }
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
        const res = await fetch(`${apiUrl}/events/${id}`, {
          method: 'POST',
          headers,
          body
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || 'Error registering event');
        }
        setShowEventForm(false);
        window.location.reload();
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'message' in e) {
          setEventFormError((e as { message?: string }).message || 'Error registering event');
        } else {
          setEventFormError('Error registering event');
        }
      } finally {
        setEventFormLoading(false);
      }
    };
  const [openNews, setOpenNews] = useState<News | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', images: [] as File[] });
  const [newsPreview, setNewsPreview] = useState<string[]>([]);
  const [newsMessage, setNewsMessage] = useState('');
  const [newsLoading, setNewsLoading] = useState(false);
  // State for showing all news or only 2
  const [showAllNews, setShowAllNews] = useState(false);

    const handleNewsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const fileArr = Array.from(files).slice(0, 10);
      setNewsForm(f => ({ ...f, images: fileArr }));
      const previews = fileArr.map(file => URL.createObjectURL(file));
      setNewsPreview(previews);
    };

    const handleNewsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newsForm.title.trim() || !newsForm.content.trim()) {
        setNewsMessage('Fill in all required fields');
        return;
      }
      setNewsLoading(true);
      setNewsMessage('');
      try {
        const formData = new FormData();
        formData.append('title', newsForm.title);
        formData.append('content', newsForm.content);
        newsForm.images.forEach((file) => {
          formData.append('images', file);
        });
        const token = localStorage.getItem('access_token');
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${apiUrl}/companies/${id}/news`, {
          method: 'POST',
          headers,
          body: formData
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || 'Error adding news');
        }
        setNewsMessage('News added successfully!');
        setNewsForm({ title: '', content: '', images: [] });
        setNewsPreview([]);
        setShowNewsForm(false);
        window.location.reload();
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'message' in e) {
            setNewsMessage('Error: ' + (e as { message?: string }).message || 'Unknown error occurred');
        } else {
          setNewsMessage('Error: Failed to add news');
        }
      } finally {
        setNewsLoading(false);
      }
    };

  useEffect(() => {
    let ignore = false;
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/companies/${id}`, { headers });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!ignore) setCompany(data);
      } catch (e) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : 'Loading error');
          setTimeout(() => navigate('/', { replace: true }), 1200);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchCompany();
    return () => { ignore = true; };
  }, [id, navigate]);

  if (loading) return <div className="profile-root"><div>Loading company...</div></div>;
  if (error || !company || deleted) return (
    <div className="profile-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ color: '#b71c1c', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
        Your company has been deleted.
      </div>
      <div style={{ color: '#888', fontSize: 18 }}>You will be redirected to Home...</div>
    </div>
  );

  let isOwner = false;
  let isAdmin = false;
  let user: { id: number; role?: string } | null = null;
  try {
    const userStr = localStorage.getItem('profile');
    if (userStr && company.owner) {
      user = JSON.parse(userStr);
      isOwner = !!user && user.id === company.owner.id;
      isAdmin = !!user && user.role === 'admin';
    }
  } catch {
    // ignore error, fallback to not owner/admin
  }



  // Delete company handler
  const handleDeleteCompany = async () => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/companies/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      setDeleted(true);
      setCompany(null);
    } catch (e) {
      alert('Failed to delete company: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  // Delete event handler
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
      // Remove deleted event from company.events
      setCompany(company => company ? { ...company, events: (company.events || []).filter(ev => ev.id !== eventId) } : company);
    } catch (e) {
      alert('Failed to delete event: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };



  return (
    <div className="company-root" style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f9f7ed 0%, #f3eecb 100%)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
        <HeaderUserBlock />
      </header>

      <div className="profile-header" style={{ background: '#f7f48b', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', padding: '32px 0 24px 0', display: 'flex', alignItems: 'center', gap: 32, position: 'relative' }}>
        <div className="profile-avatar" style={{ width: 120, height: 120, background: '#d8d5c9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, color: '#888', marginLeft: 32, overflow: 'hidden' }}>
          {company.picture_url
            ? (() => {
                let imgSrc = company.picture_url;
                if (imgSrc.startsWith('/uploads')) {
                  const apiUrl = import.meta.env.VITE_API_URL || '';
                  const baseUrl = apiUrl.replace(/\/api$/, '');
                  imgSrc = baseUrl + imgSrc;
                }
                return <img src={imgSrc} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
              })()
            : <img src="/default-company-avatar.png" alt="Default company avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#eee' }} />
          }
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
          <div className="profile-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontSize: 32, color: '#222' }}>{company.name}</h2>
            <div style={{ color: '#888', fontSize: 18 }}><b>Email:</b> {company.email_for_info}</div>
            <div style={{ color: '#888', fontSize: 18 }}><b>Location:</b> {company.location || <span style={{color:'#bbb'}}>Not specified</span>}</div>
          </div>
          {(isOwner || isAdmin) && (
            <>
              <button onClick={() => setShowNewsForm(true)} style={{
                background: '#ffe066',
                border: '1px solid #bfa800',
                color: '#222',
                borderRadius: 8,
                padding: '10px 22px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 16,
                marginLeft: 32,
                marginRight: 12,
                height: 44,
                alignSelf: 'center',
                boxShadow: '0 2px 8px #ffe066',
                whiteSpace: 'nowrap'
              }}>
                Add News
              </button>
              <button onClick={() => setShowEventForm(true)} style={{
                background: '#ffe066',
                border: '1px solid #bfa800',
                color: '#222',
                borderRadius: 8,
                padding: '10px 22px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 16,
                marginLeft: 0,
                marginRight: 32,
                height: 44,
                alignSelf: 'center',
                boxShadow: '0 2px 8px #ffe066',
                whiteSpace: 'nowrap'
              }}>
                Add Event
              </button>
              {/* Delete company button for owner/admin */}
              <button
                onClick={handleDeleteCompany}
                style={{
                  background: '#ff4d4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 22px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16,
                  marginLeft: 0,
                  marginRight: 0,
                  height: 44,
                  alignSelf: 'center',
                  boxShadow: '0 2px 8px #ff4d4f44',
                  whiteSpace: 'nowrap',
                }}
                title="Delete company"
              >
                Delete Company
              </button>
            </>
          )}
              {/* Event Registration Modal */}
              {isOwner && showEventForm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.35)',
                  zIndex: 2100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                  onClick={() => setShowEventForm(false)}
                >
                  <div style={{ background: '#fffde7', borderRadius: 12, boxShadow: '0 2px 8px #ffe066', padding: 32, width: '80vw', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setShowEventForm(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&#10006;</button>
                    <EventRegistrationForm 
                      onSubmit={handleEventRegister} 
                      loading={eventFormLoading} 
                      error={eventFormError} 
                      onClose={() => setShowEventForm(false)} 
                    />
                  </div>
                </div>
              )}
        </div>
      </div>

      <div style={{ width: '100vw', margin: '32px 0 0 0', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          background: '#f7f48b',
          borderRadius: 18,
          boxShadow: '0 4px 24px #ffe066',
          padding: '32px 28px 28px 32px',
          marginLeft: '3cm',
          marginRight: '3cm',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderLeft: '8px solid #ffe066',
          position: 'relative',
          boxSizing: 'border-box',
        }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 10, letterSpacing: 0.5 }}>About company</div>
          <div style={{
            fontSize: 17,
            color: '#444',
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
          }}>{company.description}</div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: 1200,
          margin: '40px auto 0 auto',
          flexWrap: 'wrap',
        }}
      >
        {/* NEWS COLUMN */}
        <div style={{ flex: 1, minWidth: 320, maxWidth: 480, marginBottom: 40 }}>
          <h3 style={{ fontSize: 26, color: '#222', fontWeight: 700, letterSpacing: 0.5, marginBottom: 18 }}>Company News</h3>
          <div style={{
            background: 'rgba(120,120,120,0.06)',
            borderRadius: 12,
            boxShadow: '0 1px 4px #bbb',
            padding: '24px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            alignItems: 'center',
            minHeight: 180,
          }}>
            {company.news && company.news.length > 0 ? (
              (showAllNews ? [...company.news] : [...company.news].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 2))
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((news) => (
                  <div key={news.id} onClick={() => setOpenNews(news)} style={{
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: 400,
                    background: '#fff',
                    borderRadius: 10,
                    boxShadow: '0 1px 8px #ffe066',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    alignItems: 'flex-start',
                    transition: 'box-shadow 0.2s',
                    overflow: 'hidden',
                    minHeight: 120,
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 18, color: '#222', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{news.title}</div>
                    <div style={{ color: '#888', fontSize: 14, marginBottom: 2 }}>{new Date(news.created_at).toLocaleDateString()}</div>
                    <div style={{ color: '#444', fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{news.content.slice(0, 60)}{news.content.length > 60 ? '...' : ''}</div>
                    {news.images_url && news.images_url.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                        {news.images_url.slice(0, 3).map((img, idx) => {
                          let imgSrc = img;
                          if (img.startsWith('/uploads')) {
                            const apiUrl = import.meta.env.VITE_API_URL || '';
                            const baseUrl = apiUrl.replace(/\/api$/, '');
                            imgSrc = baseUrl + img;
                          }
                          return (
                            <img
                              key={img}
                              src={imgSrc}
                              alt={`news-preview-${idx}`}
                              style={{ maxWidth: 55, maxHeight: 55, borderRadius: 5, boxShadow: '0 1px 4px #ffe066', cursor: 'pointer' }}
                              onClick={e => { e.stopPropagation(); setOpenNews(news); setLightboxImg(imgSrc); }}
                            />
                          );
                        })}
                        {news.images_url.length > 3 && (
                          <span style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>+{news.images_url.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div style={{ color: '#aaa', fontSize: 16, textAlign: 'center', margin: 24 }}>No news yet</div>
            )}
            {company.news && company.news.length > 2 && (
              <button
                onClick={() => setShowAllNews((prev) => !prev)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                  borderRadius: 8,
                  padding: '8px 24px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: 'none',
                  transition: 'color 0.2s',
                  marginTop: 10,
                }}
                onMouseOver={e => (e.currentTarget.style.color = '#222')}
                onMouseOut={e => (e.currentTarget.style.color = '#666')}
              >
                {showAllNews ? 'Hide news' : 'View all news'}
              </button>
            )}
          </div>
        </div>
        {/* EVENTS COLUMN */}
        <div style={{ flex: 1, minWidth: 320, maxWidth: 600, marginBottom: 40 }}>
          <h3 style={{ fontSize: 26, color: '#222', fontWeight: 700, letterSpacing: 0.5, marginBottom: 18 }}>Company Events</h3>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px #ffe066',
            padding: '24px 0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 18,
            justifyContent: 'center',
            minHeight: 180,
          }}>
            {company.events && company.events.length > 0 ? (
              company.events.map(event => (
                <div key={event.id} style={{ minWidth: 220, maxWidth: 260, background: '#fffbe6', borderRadius: 12, boxShadow: '0 2px 8px #ffe066', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {event.publish_date && (
                    <div style={{ color: '#888', fontSize: 14, marginBottom: 2 }}>
                      <span style={{ fontWeight: 500 }}>Publish:</span> {new Date(event.publish_date).toLocaleDateString()} {new Date(event.publish_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    return <img src={imgSrc} alt={event.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8, background: '#f0f0f0' }} />;
                  })()}
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{event.title}</div>
                  {event.start_date && (
                    <div style={{ color: '#888', fontSize: 14 }}>Start: {new Date(event.start_date).toLocaleDateString()}</div>
                  )}
                  {event.end_date && (
                    <div style={{ color: '#888', fontSize: 14 }}>End: {new Date(event.end_date).toLocaleDateString()}</div>
                  )}
                  {event.status && (
                    <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>Status: {event.status}</div>
                  )}
                  {event.address && (
                    <div style={{ width: '100%', margin: '10px 0 0 0' }}>
                      <iframe
                        title={`Event Location Map ${event.id}`}
                        width="100%"
                        height="120"
                        style={{ border: 0, borderRadius: 8, boxShadow: '0 1px 8px #ffe06655' }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(event.address)}&output=embed`}
                      ></iframe>
                    </div>
                  )}
                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      style={{
                        marginTop: 10,
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
                  )}
                  <a href={`/event/${event.id}`} style={{ marginTop: 10, color: '#2a7ae2', textDecoration: 'underline', fontSize: 15 }}>View Event</a>
                  {event.companyId === null && (
                    <div style={{ color: '#ff4d4f', fontSize: 14, marginTop: 6 }}>This company was deleted</div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: '#aaa', fontSize: 16, textAlign: 'center', margin: 24 }}>No events yet</div>
            )}
          </div>
        </div>
      </div>
      {openNews && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setOpenNews(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 16px #ffe066',
              padding: 32,
              minWidth: 320,
              maxWidth: 520,
              width: '90vw',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenNews(null)}
              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}
            >
              &#10006;
            </button>
            <div style={{ fontWeight: 700, fontSize: 22, color: '#222' }}>{openNews.title}</div>
            <div style={{ color: '#888', fontSize: 15 }}>{new Date(openNews.created_at).toLocaleDateString()}</div>
            <div style={{ color: '#444', fontSize: 16, whiteSpace: 'pre-line' }}>{openNews.content}</div>
            {openNews.images_url && openNews.images_url.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {openNews.images_url.map((img, idx) => {
                  let imgSrc = img;
                  if (img.startsWith('/uploads')) {
                    const apiUrl = import.meta.env.VITE_API_URL || '';
                    const baseUrl = apiUrl.replace(/\/api$/, '');
                    imgSrc = baseUrl + img;
                  }
                  return (
                    <img
                      key={img}
                      src={imgSrc}
                      alt={`news-full-${idx}`}
                      style={{ maxWidth: 120, maxHeight: 120, borderRadius: 6, boxShadow: '0 2px 8px #ffe066', cursor: 'pointer' }}
                      onClick={e => { e.stopPropagation(); setLightboxImg(imgSrc); }}
                    />
                  );
                })}
              </div>
            )}

          {/* Лайтбокс для увеличения фото */}
          {lightboxImg && (
            <div
              onClick={() => setLightboxImg(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out',
              }}
            >
              <img src={lightboxImg} alt="full" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 4px 24px #ffe066' }} />
            </div>
          )}
          </div>
        </div>
      )}
    {isOwner && showNewsForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setShowNewsForm(false)}
        >
          <form onSubmit={handleNewsSubmit} style={{ background: '#fffde7', borderRadius: 12, boxShadow: '0 2px 8px #ffe066', padding: 32, maxWidth: 420, minWidth: 320, width: '90vw', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowNewsForm(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&#10006;</button>
            <label style={{ fontWeight: 500 }}>Title
              <input value={newsForm.title} onChange={e => setNewsForm(f => ({ ...f, title: e.target.value }))} required maxLength={50} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #ccc' }} />
            </label>
            <label style={{ fontWeight: 500 }}>Content
              <textarea value={newsForm.content} onChange={e => setNewsForm(f => ({ ...f, content: e.target.value }))} required maxLength={500} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }} />
            </label>
            <label style={{ fontWeight: 500 }}>Images (optional, up to 10)
              <input type="file" accept="image/*" multiple onChange={handleNewsFileChange} />
            </label>
            {newsPreview.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {newsPreview.map((src, i) => (
                  <img key={i} src={src} alt="preview" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 6, boxShadow: '0 2px 8px #ffe066' }} />
                ))}
              </div>
            )}
            <button type="submit" disabled={newsLoading} style={{ background: '#ffe066', border: '1px solid #bfa800', borderRadius: 8, padding: '8px 0', fontWeight: 600, fontSize: 16, cursor: newsLoading ? 'not-allowed' : 'pointer' }}>{newsLoading ? 'Loading...' : 'Add News'}</button>
            {newsMessage && <div style={{ color: newsMessage.startsWith('Error') ? 'red' : '#bfa800', marginTop: 4 }}>{newsMessage}</div>}
          </form>
        </div>
      )}

      <footer className="home-footer" style={{ marginTop: 'auto' }}>
        <div className="footer-row">
          <a href="/all-event-types">All events</a>
          <a href="/how-it-works">How it works</a>
          <a href="/about-us">About us</a>
        </div>
        <div className="footer-row copyright" style={{ marginRight: 10, padding: '32px 0px 10px' }}>© 2026 Uevent</div>
      </footer>
    </div>
  );
};

export default CompanyProfile;
