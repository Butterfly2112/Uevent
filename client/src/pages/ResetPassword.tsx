
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/auth/request-pass-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('A reset link has been sent.');
      setTimeout(() => navigate('/login'), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9ed' }}>
      <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #ffe06655', padding: 36, margin: '0 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18, width: '100%' }}>
          <div style={{ background: '#ffe066', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, boxShadow: '0 2px 8px #ffe06644' }}>
            <span role="img" aria-label="lock" style={{ fontSize: 34 }}>🔒</span>
          </div>
          <h2 style={{ textAlign: 'center', margin: 0, fontFamily: 'Kavivanar, cursive', color: '#222', fontWeight: 700, fontSize: 28 }}>Reset Password</h2>
          <div style={{ color: '#000000', fontSize: 15, marginTop: 8, textAlign: 'center', maxWidth: 320 }}>
            Enter your email and we’ll send you a link to reset your password.
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: 18, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '90%', maxWidth: 320, padding: 14, borderRadius: 10, border: '1.5px solid #ffe066', marginBottom: 18, fontSize: 17, background: '#fffbe6', outline: 'none', transition: 'border 0.2s', display: 'block', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', color: '#000' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '90%', maxWidth: 320, padding: 14, borderRadius: 10, background: '#ffe066', border: 'none', fontWeight: 700, fontSize: 17, color: '#181818', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #ffe06633', marginBottom: 10, letterSpacing: 0.5, transition: 'background 0.2s', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {error && <div style={{ color: '#dc2626', marginTop: 8, fontSize: 15, textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: 8, fontSize: 15, textAlign: 'center' }}>{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
