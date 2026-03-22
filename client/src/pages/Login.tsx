import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Login: React.FC = () => {
  const [form, setForm] = useState({
    loginOrEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!form.loginOrEmail) return 'Login or Email is required';
    if (!form.password) return 'Password is required';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Login error');
      } else {
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        navigate('/');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9f9ed' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, minWidth: 340, maxWidth: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontFamily: 'Kavivanar, cursive', color: '#111' }}>Sign In</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input
            type="text"
            name="loginOrEmail"
            placeholder="Login or Email"
            value={form.loginOrEmail}
            onChange={handleChange}
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 16,
              marginBottom: 4,
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 16,
              marginBottom: 4,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 0',
              background: '#f7f48b',
              color: '#222',
              border: '1px solid #111',
              borderRadius: 24,
              fontSize: 18,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #e0e0c0',
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          {error && <div style={{ color: '#dc2626', marginTop: 8, fontSize: 14, textAlign: 'center' }}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
