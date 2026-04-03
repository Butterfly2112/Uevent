import React from 'react';

const Logout: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.clear();
      sessionStorage.clear();
      if (onLogout) onLogout();
      window.location.reload();
    } catch {
      alert('Logout failed');
    }
  };

  return (
    <button
      className="sign-in-btn"
      style={{ marginLeft: 12, background: '#f7f48b', border: '1px solid #111', borderRadius: 24, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #e0e0c0', color: '#222', padding: '5px 20px' }}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default Logout;
