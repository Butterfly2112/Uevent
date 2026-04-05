import React, { useState } from 'react';

interface User {
  id: number;
  login: string;
  email: string;
  username: string;
  name?: string;
  role: string;
}


const AdminUsersTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (userId.trim() !== '') {
        params.append('userId', userId.trim());
      } else {
        params.append('search', search);
      }
      const url = `${import.meta.env.VITE_API_URL}/users/search?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404 && userId.trim() !== '') {
          setError('User not found');
          setUsers([]);
          return;
        } else {
          throw new Error('Failed to fetch users');
        }
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // On mount, fetch all users (no search param)
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('search', '');
        const url = `${import.meta.env.VITE_API_URL}/users/search?${params.toString()}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users => users.filter(u => u.id !== id));
    } catch (e) {
      alert('Failed to delete user: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by login, name, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
          disabled={userId.trim() !== ''}
        />
        <input
          type="number"
          placeholder="User ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 100 }}
        />
        <button onClick={handleSearch} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#ffe066', fontWeight: 600, cursor: 'pointer' }}>Search</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #ffe06633' }}>
        <thead>
          <tr style={{ background: '#fffbe6' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Login</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Email</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Username</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Role</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{user.id}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{user.login}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{user.email}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{user.username || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <select
                  value={user.role}
                  onChange={async (e) => {
                    const newRole = e.target.value;
                    const prevRole = user.role;
                    try {
                      const token = localStorage.getItem('access_token');
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ role: newRole }),
                      });
                      if (!res.ok) throw new Error('Failed to update role');
                      setUsers(users => users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                    } catch (e) {
                      alert('Failed to update role: ' + (e instanceof Error ? e.message : 'Unknown error'));
                      setUsers(users => users.map(u => u.id === user.id ? { ...u, role: prevRole } : u));
                    }
                  }}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc', minWidth: 90 }}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <button onClick={() => handleDelete(user.id)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && !loading && !error && <div style={{ marginTop: 24, color: '#888' }}>No users found.</div>}
    </div>
  );
};

export default AdminUsersTab;
