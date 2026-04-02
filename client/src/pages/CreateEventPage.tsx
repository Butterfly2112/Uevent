import React, { useEffect, useState } from 'react';
import { EventRegistrationForm } from '../components/EventRegistrationForm';
import type { EventFormData } from '../components/EventRegistrationForm';
import { useNavigate } from 'react-router-dom';

const CreateEventPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [company, setCompany] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const user = JSON.parse(profileStr);
        setCompany(user.company || null);
      } catch {
        setCompany(null);
      }
    } else {
      setCompany(null);
    }
  }, []);

    const handleSubmit = async (data: EventFormData) => {
        setLoading(true);
        setError(null);
        try {
            const companyId = company?.id;

            if (!companyId) {
                throw new Error('Company ID is missing. Please register your company again.');
            }

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'poster_url' && value instanceof File) {
                        formData.append('file', value);
                    } else if (key !== 'poster_url') {
                        formData.append(key, String(value));
                    }
                }
            });
            const token = localStorage.getItem('access_token');

            const response = await fetch(`/api/events/${companyId}`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to create event');
            }
            const event = await response.json();
            navigate(`/event/${event.id}`);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message || 'Failed to create event');
            } else {
                setError('Failed to create event');
            }
        } finally {
            setLoading(false);
        }
    };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, background: '#fffbe6', borderRadius: 16, boxShadow: '0 2px 12px #ffe066', textAlign: 'center' }}>
        <h2 style={{ color: '#222', marginBottom: 24 }}>Create Event</h2>
        <p style={{ fontSize: 18, color: '#444', marginBottom: 32 }}>To create an event, please sign in or register.</p>
        <button onClick={() => navigate('/login')} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, color: '#222', cursor: 'pointer', marginRight: 16 }}>Sign in</button>
        <button onClick={() => navigate('/register')} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, color: '#222', cursor: 'pointer' }}>Sign up</button>
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, background: '#fffbe6', borderRadius: 16, boxShadow: '0 2px 12px #ffe066', textAlign: 'center' }}>
        <h2 style={{ color: '#222', marginBottom: 24 }}>Create Event</h2>
        <p style={{ fontSize: 18, color: '#444', marginBottom: 32 }}>To create an event, you need to register your company first.</p>
        <button onClick={() => navigate('/register-company')} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, color: '#222', cursor: 'pointer' }}>Register Company</button>
      </div>
    );
  }

  return (
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
    }}>
      <div style={{
        background: '#fffde7',
        borderRadius: 12,
        boxShadow: '0 2px 8px #ffe066',
        padding: 32,
        width: '80vw',
        maxWidth: 900,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
      }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: '#888',
          }}
          aria-label="Close"
        >
          &#10006;
        </button>
            <EventRegistrationForm onSubmit={handleSubmit} loading={loading} error={error || undefined} onClose={() => navigate(-1)} />
      </div>
    </div>
  );
};

export default CreateEventPage;
