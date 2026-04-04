import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const NewPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token) {
      setError('Token is missing.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter and one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/auth/password-reset?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Password changed successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
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
            <span role="img" aria-label="key" style={{ fontSize: 34 }}>🔑</span>
          </div>
          <h2 style={{ textAlign: 'center', margin: 0, fontFamily: 'Kavivanar, cursive', color: '#222', fontWeight: 700, fontSize: 28 }}>Set New Password</h2>
          <div style={{ color: '#000', fontSize: 15, marginTop: 8, textAlign: 'center', maxWidth: 320 }}>
            Enter your new password below.
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: 18, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            style={{ width: '90%', maxWidth: 320, padding: 14, borderRadius: 10, border: '1.5px solid #ffe066', marginBottom: 14, fontSize: 17, background: '#fffbe6', outline: 'none', transition: 'border 0.2s', display: 'block', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', color: '#000' }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            style={{ width: '90%', maxWidth: 320, padding: 14, borderRadius: 10, border: '1.5px solid #ffe066', marginBottom: 18, fontSize: 17, background: '#fffbe6', outline: 'none', transition: 'border 0.2s', display: 'block', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', color: '#000' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '90%', maxWidth: 320, padding: 14, borderRadius: 10, background: '#ffe066', border: 'none', fontWeight: 700, fontSize: 17, color: '#181818', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #ffe06633', marginBottom: 10, letterSpacing: 0.5, transition: 'background 0.2s', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          >
            {loading ? 'Saving...' : 'Set Password'}
          </button>
          {error && <div style={{ color: '#dc2626', marginTop: 8, fontSize: 15, textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: 8, fontSize: 15, textAlign: 'center' }}>{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
