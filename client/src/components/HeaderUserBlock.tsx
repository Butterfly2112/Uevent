
import React, { useEffect, useState } from 'react';
import Logout from '../components/Logout';
import { getAvatarUrl } from './getAvatarUrl';

export const HeaderUserBlock: React.FC = () => {
  const [profile, setProfile] = useState<string | null>(localStorage.getItem('profile'));
  useEffect(() => {
    const onStorage = () => setProfile(localStorage.getItem('profile'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        <button
          className="sign-in-btn"
          style={{
            background: 'linear-gradient(90deg, #f7f48b 0%, #f3d250 100%)',
            border: '1px solid #bfa800',
            borderRadius: 12,
            fontSize: 15,
            cursor: 'pointer',
            color: '#222',
            padding: '8px 18px',
            fontWeight: 500,
            marginLeft: 0,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'background 0.2s',
            outline: 'none',
            marginTop: 0,
          }}
          onClick={() => window.location.href = '/login'}
        >
          Sign In
        </button>
        <button
          className="sign-up-btn"
          style={{
            background: 'linear-gradient(90deg, #f7f48b 0%, #f3d250 100%)',
            border: '1px solid #bfa800',
            borderRadius: 12,
            fontSize: 15,
            cursor: 'pointer',
            color: '#222',
            padding: '8px 18px',
            fontWeight: 500,
            marginLeft: 0,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'background 0.2s',
            outline: 'none',
            marginTop: 0,
          }}
          onClick={() => window.location.href = '/register'}
        >
          Sign Up
        </button>
      </div>
    );
  }
  let avatar_url: string | undefined;
  try {
    const parsed = JSON.parse(profile);
    avatar_url = parsed.avatar_url;
  } catch {
    /* ignore */
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
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
      <Logout />
    </div>
  );
};
