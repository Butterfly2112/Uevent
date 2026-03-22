import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Register: React.FC = () => {

  const [form, setForm] = useState({
    login: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Валидация по правилам бэкенда
  const validate = () => {
    if (!/^[a-zA-Z0-9_-]+$/.test(form.login)) {
      return 'Login can only contain numbers, letters and characters _ and -';
    }
    if (!form.login) return 'Login is required';
    if (!form.username) return 'Username is required';
    if (form.username.length > 50) return 'Username must be at most 50 characters';
    if (!form.email) return 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Invalid email';
    if (!form.password) return 'Password is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter and one number';
    }
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
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Registration error');
      } else {
        setSuccess('Registration successful! Please check your email and confirm your account.');
        setTimeout(() => navigate('/login'), 3000);
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
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontFamily: 'Kavivanar, cursive', color: '#111' }}>Sign Up</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input
            type="text"
            name="login"
            placeholder="Login"
            value={form.login}
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
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
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
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
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
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          {error && <div style={{ color: '#dc2626', marginTop: 8, fontSize: 14, textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: '#22c55e', marginTop: 8, fontSize: 14, textAlign: 'center' }}>{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default Register;
