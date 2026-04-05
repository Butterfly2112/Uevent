import planetIcon from '../assets/planet.svg';
import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../components/fetchWithAuth';
import Logout from '../components/Logout';
import './Profile.css';
import './ProfileEventsBlock.css';
import { FaCalendarAlt, FaRegStar } from 'react-icons/fa';
import { getAvatarUrl } from '../components/getAvatarUrl';
import readIcon from '../assets/read.png';
import deleteIcon from '../assets/delete.png';

const LogoutButtonStyled = () => <Logout />;

type Company = {
  id: number;
  name: string;
};

type UserState = {
  login: string;
  username: string;
  email: string;
  avatar_url?: string;
  company?: Company;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

const initialUser: UserState = {
  login: 'wepino',
  username: 'Wepino',
  email: 'wepino1637@flosek.com',
  company: undefined,
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserState>(initialUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  // State for user's events
  interface Event {
    id: number;
    title: string;
    start_date: string;
    end_date?: string;
    poster_url?: string;
    status?: string;
  }
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userEventsLoading, setUserEventsLoading] = useState(false);
  const [userEventsError, setUserEventsError] = useState<string | null>(null);

  // State for events the user is subscribed to
  const [subscribedEvents, setSubscribedEvents] = useState<Event[]>([]);
  const [subscribedEventsLoading, setSubscribedEventsLoading] = useState(false);
  const [subscribedEventsError, setSubscribedEventsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authorization token');
          setLoading(false);
          return;
        }
        const response = await fetchWithAuth('http://localhost:3000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (response.status === 401) {
          // Token expired or invalid, logout
          localStorage.removeItem('access_token');
          window.location.href = '/';
          return;
        }
        if (!response.ok) {
          setError('Error loading profile');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setUser({
          login: data.login,
          username: data.username,
          email: data.email,
          avatar_url: data.avatar_url,
          company: data.company,
        });
        // Store user profile in localStorage for owner checks in CompanyProfile and Home
        localStorage.setItem('profile', JSON.stringify({
          id: data.id,
          login: data.login,
          username: data.username,
          email: data.email,
          avatar_url: data.avatar_url,
          company: data.company,
          ...(data.role ? { role: data.role } : {})
        }));
        // If user is organizer, fetch their events
        if (data.company && data.company.id) {
          setUserEventsLoading(true);
          setUserEventsError(null);
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const eventsRes = await fetchWithAuth(`${apiUrl}/events/search?companyId=${data.company.id}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!eventsRes.ok) throw new Error(await eventsRes.text());
            const eventsData = await eventsRes.json();
            const eventsArr: Event[] = Array.isArray(eventsData)
              ? eventsData
              : Array.isArray(eventsData.data)
                ? eventsData.data
                : Array.isArray(eventsData.results)
                  ? eventsData.results
                  : [];
            setUserEvents(eventsArr);
          } catch (e) {
            setUserEventsError(e instanceof Error ? e.message : 'Loading error');
          } finally {
            setUserEventsLoading(false);
          }
        }

        // Fetch events the user is subscribed to
        setSubscribedEventsLoading(true);
        setSubscribedEventsError(null);
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const subscribedRes = await fetchWithAuth(`${apiUrl}/users/following-events`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!subscribedRes.ok) throw new Error(await subscribedRes.text());
          const subscribedData = await subscribedRes.json();
          const eventsArr: Event[] = Array.isArray(subscribedData.events)
            ? subscribedData.events
            : [];
          setSubscribedEvents(eventsArr);
        } catch (e) {
          setSubscribedEventsError(e instanceof Error ? e.message : 'Loading error');
        } finally {
          setSubscribedEventsLoading(false);
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');

        const res = await fetchWithAuth(
            `http://localhost:3000/api/notifications/user/${profile.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setNotifications(data);
      } catch {
        console.error('Failed to load notifications');
      } finally {
        setNotifLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');

      await fetchWithAuth(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
          prev.map((n) =>
              n.id === id ? { ...n, is_read: true } : n
          )
      );
    } catch {
      console.error('Failed to mark as read');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');

      await fetchWithAuth(`http://localhost:3000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      console.error('Failed to delete notification');
    }
  };


  // Inline edit state (must be before any return)
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | undefined>(user.avatar_url);

  useEffect(() => {
    setEditAvatarPreview(user.avatar_url);
  }, [user.avatar_url]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  if (loading) {
    return <div className="profile-root"><div>Loading profile...</div></div>;
  }
  if (error) {
    if (error === 'No authorization token') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('profile');
      window.location.href = '/';
      return null;
    }
    return <div className="profile-root"><div style={{color: 'red'}}>{error}</div></div>;
  }

  const handleEdit = () => {
    setEditMode(true);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditAvatar(null);
    setEditAvatarPreview(user.avatar_url);
    setEditError(null);
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditError(null);
    setEditAvatar(null);
    setEditAvatarPreview(user.avatar_url);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No authorization token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const userId = JSON.parse(localStorage.getItem('profile') || '{}').id;
      let res;
      const emailChanged = editEmail !== user.email;
      if (editAvatar) {
        const formData = new FormData();
        formData.append('username', editUsername);
        if (emailChanged) formData.append('email', editEmail);
        formData.append('file', editAvatar);
        res = await fetchWithAuth(`${apiUrl}/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        const body: Record<string, string> = { username: editUsername };
        if (emailChanged) body.email = editEmail;
        if (emailChanged) body.email = editEmail;
        res = await fetchWithAuth(`${apiUrl}/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setUser((prev) => ({ ...prev, username: updated.username, email: updated.email, avatar_url: updated.avatar_url }));
      setEditAvatarPreview(updated.avatar_url);
      localStorage.setItem('profile', JSON.stringify({ ...JSON.parse(localStorage.getItem('profile') || '{}'), username: updated.username, email: updated.email, avatar_url: updated.avatar_url }));
      setEditMode(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (editMode && !editLoading) {
      document.getElementById('avatar-upload-input')?.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setEditAvatar(file);
      setEditAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="profile-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="home-header">
        <a href="/" className="logo-block" style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: 16, textDecoration: 'none' }}>
          <span className="logo-text" style={{ fontFamily: 'Kavivanar, cursive', fontSize: 32, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
            Uevent
            <img src={planetIcon} alt="planet" style={{ width: 28, height: 28, marginLeft: 6, verticalAlign: 'middle' }} />
          </span>
        </a>
        <nav className="main-nav">
          <a href="/">Home</a>
          <a href="/all-event-types">All Events</a>
          <a href="/create-event">Create Event</a>
          {(() => {
            try {
              const profile = JSON.parse(localStorage.getItem('profile') || '{}');
              if (profile.role === 'admin') {
                return <a href="/admin">Admin Panel</a>;
              }
            } catch {
              /* ignore */
            }
            return null;
          })()}
        </nav>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
          {/* User avatar and logout */}
          {(() => {
            const profile = localStorage.getItem('profile');
            let avatar_url;
            if (profile) {
              try {
                const parsed = JSON.parse(profile);
                avatar_url = parsed.avatar_url;
              } catch {
                /* ignore */
              }
            }
            const getAvatarUrl = (url: string) => {
              if (!url || url === 'default') return undefined;
              if (url.startsWith('/uploads')) {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const baseUrl = apiUrl.replace(/\/api$/, '');
                return baseUrl + url;
              }
              return url;
            };
            return (
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
                    overflow: 'hidden',
                  }}
                  title="Profile"
                >
                  {avatar_url && avatar_url !== 'default' ? (
                    <img
                      src={getAvatarUrl(avatar_url)}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span role="img" aria-label="profile">👤</span>
                  )}
                </div>
                <LogoutButtonStyled />
              </>
            );
          })()}
        </div>
      </header>
      <div className="profile-header">
        <div className="profile-avatar" style={{ cursor: editMode ? 'pointer' : 'default', position: 'relative', width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffe066' }} onClick={handleAvatarClick} title={editMode ? 'Change avatar' : undefined}>
          {editAvatarPreview && getAvatarUrl(editAvatarPreview) ? (
            <img
              src={getAvatarUrl(editAvatarPreview)}
              alt="avatar"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <span role="img" aria-label="profile" style={{ fontSize: 48, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>👤</span>
          )}
          {editMode && (
            <>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
                disabled={editLoading}
              />
              <span style={{ position: 'absolute', bottom: 0, right: 0, background: '#ffe066', borderRadius: '50%', padding: 6, border: '2px solid #fff', fontSize: 18, cursor: 'pointer' }}>✏️</span>
            </>
          )}
        </div>
        <div className="profile-info">
          <h2 style={{ margin: 0, fontSize: 32, color: '#222' }}>{user.login}</h2>
          {editMode ? (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={{ color: '#888', fontSize: 18 }}>Email:&nbsp;</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  style={{ fontSize: 18, padding: '4px 8px', borderRadius: 6, border: '1.5px solid #ffe066', width: 260 }}
                  disabled={editLoading}
                  required
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ color: '#444', fontSize: 18 }}>Username:&nbsp;</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  style={{ fontSize: 18, padding: '4px 8px', borderRadius: 6, border: '1.5px solid #ffe066', width: 200 }}
                  disabled={editLoading}
                  required
                />
              </div>
              {editError && <div style={{ color: 'red', fontSize: 15, marginBottom: 8 }}>{editError}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={handleEditSave}
                  disabled={editLoading}
                  style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: editLoading ? 'not-allowed' : 'pointer', fontSize: 16, color: '#181818', boxShadow: '0 1px 4px #ffe06633', transition: 'background 0.2s' }}
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleEditCancel}
                  disabled={editLoading}
                  style={{ background: '#eee', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: editLoading ? 'not-allowed' : 'pointer', fontSize: 16, color: '#181818', boxShadow: '0 1px 4px #ffe06622', transition: 'background 0.2s' }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ color: '#888', fontSize: 18 }}>{user.email}</div>
              <div style={{ color: '#444', fontSize: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
                <span>Login: <b>{user.login}</b></span>
                <span>Username: <b>{user.username}</b></span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                <button
                  style={{
                    background: 'linear-gradient(90deg, #f7f48b 0%, #f3d250 100%)',
                    border: '1.5px solid #bfa800',
                    borderRadius: 12,
                    fontSize: 15,
                    cursor: 'pointer',
                    color: '#222',
                    padding: '8px 18px',
                    marginLeft: 0,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'background 0.2s',
                    outline: 'none',
                    marginTop: 0,
                  }}
                  onClick={handleEdit}
                >
                  Edit Profile
                </button>
                <LogoutButtonStyled />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="notifications-section">
      <h3 className="notifications-title">Notifications</h3>

      {notifLoading ? (
          <div>Loading notifications...</div>
      ) : notifications.length === 0 ? (
          <div className="no-notifications">No notifications yet</div>
      ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`notification-card ${notif.is_read? 'read' : 'unread'}`}
                >
                  <div className="notif-header">
                    <span className="notif-title">{notif.title}</span>
                    <span className="notif-date">
  {notif.created_at
      ? new Date(notif.created_at).toLocaleString()
      : 'No date'}
</span>
                  </div>

                  <div className="notif-message">{notif.message}</div>

                  <div className="notif-actions">
                    {!notif.is_read && (
                        <button
                            className="icon-btn"
                            onClick={() => markAsRead(notif.id)}
                            title="Mark as read"
                        >
                          <img src={readIcon} alt="read" />
                        </button>
                    )}

                    <button
                        className="icon-btn delete"
                        onClick={() => deleteNotification(notif.id)}
                        title="Delete"
                    >
                      <img src={deleteIcon} alt="delete" />
                    </button>
                  </div>
                </div>
            ))}
          </div>
      )}
    </div>





      <div className="profile-events-row">
        {user.company && user.company.id && (
          <section className="profile-events-section" style={{ background: '#fffde7', minWidth: 340, flex: 1 }}>
            <div className="profile-events-header" style={{ background: 'linear-gradient(90deg, #fff693 0%, #fff9ce 100%)' }}>
              <FaCalendarAlt style={{ color: '#f3d250', fontSize: 28, marginRight: 8 }} />
              <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>My Events</span>
            </div>
            {userEventsLoading ? (
              <div className="profile-events-loading">Loading...</div>
            ) : userEventsError ? (
              <div className="profile-events-error">{userEventsError}</div>
            ) : userEvents.length === 0 ? (
              <div className="profile-events-empty">You don't have any created events yet.</div>
            ) : (
              <div className="profile-events-list">
                {userEvents.map((ev) => {
                  let imgSrc = '';
                  if (ev.poster_url && ev.poster_url !== 'default') {
                    imgSrc = ev.poster_url;
                    if (imgSrc.startsWith('/uploads')) {
                      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                      const baseUrl = apiUrl.replace(/\/api$/, '');
                      imgSrc = baseUrl + imgSrc;
                    }
                  } else {
                    imgSrc = '/default-event.png';
                  }
                  return (
                    <a key={ev.id} href={`/event/${ev.id}`} style={{ textDecoration: 'none', color: '#111', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e0e0e0', width: 180, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8, transition: 'box-shadow 0.2s', marginBottom: 8 }}>
                      <img src={imgSrc} alt={ev.title} style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, textAlign: 'center', color: '#111' }}>
                        {ev.title}
                        {ev.status === 'draft' && (
                          <span style={{ color: 'red', marginLeft: 6 }}>(Draft)</span>
                        )}
                      </div>
                      <div style={{ color: '#111', fontSize: 13, marginBottom: 0, textAlign: 'center' }}>{new Date(ev.start_date).toLocaleDateString()}</div>
                      {ev.end_date && (
                        <div style={{ color: '#111', fontSize: 13, marginBottom: 0, textAlign: 'center' }}>{new Date(ev.end_date).toLocaleDateString()}</div>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        )}
        <section className="profile-events-section" style={{ background: '#f0f7ff', minWidth: 340, flex: 1 }}>
          <div className="profile-events-header" style={{ background: 'linear-gradient(90deg, #fff693 0%, #fff9ce 100%)' }}>
            <FaRegStar style={{ color: '#bfa800', fontSize: 28, marginRight: 8 }} />
            <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>Subscribed Events</span>
          </div>
          {subscribedEventsLoading ? (
            <div className="profile-events-loading">Loading...</div>
          ) : subscribedEventsError ? (
            <div className="profile-events-error">{subscribedEventsError}</div>
          ) : subscribedEvents.length === 0 ? (
            <div className="profile-events-empty">You are not subscribed to any events yet.</div>
          ) : (
            <div className="profile-events-list">
              {subscribedEvents.map((ev) => {
                let imgSrc = '';
                if (ev.poster_url && ev.poster_url !== 'default') {
                  imgSrc = ev.poster_url;
                  if (imgSrc.startsWith('/uploads')) {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
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
        </section>
      </div>

      <footer className="home-footer" style={{ width: '100%', margin: 0, marginTop: 'auto' }}>
        <div className="footer-row">
          <a href="/all-event-types">All events</a>
          <a href="/how-it-works">How it works</a>
          <a href="/about-us">About us</a>
        </div>
        <div className="footer-row copyright" style={{ fontWeight: 400, marginRight: 10, textAlign: 'left' }}>© 2026 Uevent</div>
      </footer>
    </div>
  );
};

export default Profile;
