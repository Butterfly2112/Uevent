
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './Home.css';

const ConfirmEmail: React.FC = () => {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') ? 'pending' : 'error';
  });
  const [message, setMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') ? '' : 'Invalid confirmation link.';
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    fetch(`http://localhost:3000/api/auth/confirm-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok || data.message === 'Email already confirmed or invalid token') {
          setStatus('success');
          setMessage(
            data.message === 'Email already confirmed or invalid token'
              ? 'Email confirmed successfully!! You can now log in.'
              : 'Email confirmed successfully! You can now log in.'
          );
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Confirmation failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error.');
      });
  }, [searchParams, navigate]);

  return (
    <div className="home-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9f9ed' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, minWidth: 340, maxWidth: 400, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Kavivanar, cursive', color: '#111', marginBottom: 24 }}>Email Confirmation</h2>
        {status === 'pending' && <p style={{ color: '#888' }}>Confirming your email...</p>}
        {status === 'success' && <p style={{ color: '#2e7d32', fontWeight: 500 }}>{message}</p>}
        {status === 'error' && <p style={{ color: '#d32f2f', fontWeight: 500 }}>{message}</p>}
      </div>
    </div>
  );
};

export default ConfirmEmail;
