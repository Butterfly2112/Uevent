import React, { useEffect, useState } from 'react';
import Logout from '../components/Logout';
import './Profile.css';
import planetIcon from '../assets/planet.svg';

interface Event {
  id: number;
  title: string;
  start_date?: string;
  end_date?: string;
  poster_url?: string;
  status?: string;
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
    // Удалён неиспользуемый newsIndex
    // State for modal news view
    const [openNews, setOpenNews] = useState<News | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Edit company modal removed

  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', images: [] as File[] });
  const [newsPreview, setNewsPreview] = useState<string[]>([]);
  const [newsMessage, setNewsMessage] = useState('');
  const [newsLoading, setNewsLoading] = useState(false);

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
        const res = await fetch(`${apiUrl}/companies/${id}/news`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
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
          setNewsMessage('Error: ' + (e as { message?: string }).message);
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/companies/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!ignore) setCompany(data);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : 'Loading error');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchCompany();
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <div className="profile-root"><div>Loading company...</div></div>;
  if (error) return <div className="profile-root"><div style={{ color: 'red' }}>{error}</div></div>;
  if (!company) return <div className="profile-root"><div>Company not found</div></div>;

  let isOwner = false;
  try {
    const userStr = localStorage.getItem('profile');
    if (userStr && company.owner) {
      const user = JSON.parse(userStr);
      isOwner = user.id === company.owner.id;
    }
  } catch {
    // ignore error, fallback to not owner
  }

  const isLoggedIn = !!localStorage.getItem('access_token');

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
            : <span role="img" aria-label="company">🏢</span>
          }
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
          <div className="profile-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontSize: 32, color: '#222' }}>{company.name}</h2>
            <div style={{ color: '#888', fontSize: 18 }}><b>Email:</b> {company.email_for_info}</div>
            <div style={{ color: '#888', fontSize: 18 }}><b>Location:</b> {company.location || <span style={{color:'#bbb'}}>Not specified</span>}</div>
          </div>
          {isOwner && (
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
              marginRight: 32,
              height: 44,
              alignSelf: 'center',
              boxShadow: '0 2px 8px #ffe066',
              whiteSpace: 'nowrap'
            }}>
              Add News
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', width: '100%', margin: '32px 0 0 0', justifyContent: 'flex-start' }}>
        <div style={{
          minWidth: 280,
          maxWidth: 340,
          background: '#f7f48b',
          borderRadius: 18,
          boxShadow: '0 4px 24px #ffe066',
          padding: '32px 28px 28px 32px',
          marginLeft: 40,
          marginRight: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderLeft: '8px solid #ffe066',
          position: 'relative',
        }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 10, letterSpacing: 0.5 }}>About company</div>
          <div style={{ fontSize: 17, color: '#444', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{company.description}</div>
        </div>
      </div>
 <>
      {company.news && company.news.length > 0 && (
        <>
          <div style={{
            maxWidth: 900,
            margin: '40px auto 0 auto',
            width: '100%',
            textAlign: 'left',
            paddingLeft: 12,
          }}>
            <h3 style={{ fontSize: 26, color: '#222', margin: 0, fontWeight: 700, letterSpacing: 0.5 }}>Company News</h3>
          </div>
        <div style={{
          margin: '32px auto 0 auto',
          maxWidth: 900,
          width: '100%',
          background: 'rgba(120,120,120,0.06)',
          borderRadius: 12,
          boxShadow: '0 1px 4px #bbb',
          padding: '24px 0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'center',
        }}>
          {[...company.news].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((news) => (
            <div key={news.id} onClick={() => setOpenNews(news)} style={{
              cursor: 'pointer',
              width: 280,
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
              minHeight: 90,
            }}>
              <div style={{ fontWeight: 600, fontSize: 18, color: '#222', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{news.title}</div>
              <div style={{ color: '#888', fontSize: 14, marginBottom: 2 }}>{new Date(news.created_at).toLocaleDateString()}</div>
              <div style={{ color: '#444', fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{news.content.slice(0, 60)}{news.content.length > 60 ? '...' : ''}</div>
              {news.images_url && news.images_url.length > 0 && (
                <img src={(news.images_url[0].startsWith('/uploads') ? (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '') + news.images_url[0] : news.images_url[0])} alt="news" style={{ maxWidth: 70, maxHeight: 70, borderRadius: 5, boxShadow: '0 1px 4px #ffe066', marginTop: 2 }} />
              )}
            </div>
          ))}
        </div>
        </>
      )}
      {/* ...остальной JSX... */}
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
                {openNews.images_url.map((img) => {
                  let imgSrc = img;
                  if (img.startsWith('/uploads')) {
                    const apiUrl = import.meta.env.VITE_API_URL || '';
                    const baseUrl = apiUrl.replace(/\/api$/, '');
                    imgSrc = baseUrl + img;
                  }
                  return <img key={img} src={imgSrc} alt="news" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 6, boxShadow: '0 2px 8px #ffe066' }} />;
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>

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

      {/* Company Events List */}
      {company.events && company.events.length > 0 && (
        <div style={{ width: '100%', maxWidth: 800, margin: '32px auto 0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #ffe066', padding: '32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ margin: 0, fontSize: 26, color: '#222' }}>Company Events</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            {company.events.map(event => (
              <div key={event.id} style={{ minWidth: 220, maxWidth: 260, background: '#fffbe6', borderRadius: 12, boxShadow: '0 2px 8px #ffe066', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {event.poster_url && event.poster_url !== 'default' ? (
                  <img src={event.poster_url} alt={event.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                ) : (
                  <div style={{ width: '100%', height: 120, background: '#eee', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 32 }}>🎫</div>
                )}
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
                <a href={`/event/${event.id}`} style={{ marginTop: 10, color: '#2a7ae2', textDecoration: 'underline', fontSize: 15 }}>View Event</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="home-footer">
        <div className="footer-row">
          <a href="/all-event-types">All event types</a>
          <a href="/faqs">FAQs</a>
          <a href="/how-it-works">How it works</a>
          <a href="/about-us">About us</a>
        </div>
        <div className="footer-row copyright" style={{ marginRight: 32, padding: '32px 0px 10px' }}>© 2026 Uevent</div>
      </footer>
    </div>
  );
};

export default CompanyProfile;
