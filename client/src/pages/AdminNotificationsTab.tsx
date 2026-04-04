import React, { useState } from 'react';

interface Notification {
  id: number;
  type: string;
  userId: number;
  eventId?: number;
  read?: boolean;
}

const AdminNotificationsTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createData, setCreateData] = useState({ userId: '', type: '', eventId: '' });
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const handleCreate = async () => {
    setCreateStatus(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!createData.userId || !createData.type) throw new Error('userId and type required');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: Number(createData.userId),
          type: createData.type,
          ...(createData.eventId ? { eventId: Number(createData.eventId) } : {}),
        }),
      });
      if (!res.ok) throw new Error('Failed to create notification');
      setCreateStatus('Notification created');
      setCreateData({ userId: '', type: '', eventId: '' });
      handleSearch();
    } catch (e) {
      setCreateStatus(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      handleSearch();
    } catch (e) {
      alert('Failed to mark as read: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      let userId = '';
      if (search) {
        // Try to extract userId from search if present (e.g., "userId: 123")
        const match = search.match(/userId\s*:?\s*(\d+)/i);
        if (match) userId = match[1];
      }
      if (!userId) {
        try {
          const profile = JSON.parse(localStorage.getItem('profile') || '{}');
          if (profile.id) userId = profile.id.toString();
        } catch {
            /* ignore */
        }
      }
      if (!userId) throw new Error('userId is required for notification search');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : (data.data || []));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      setNotifications(notifications => notifications.filter(n => n.id !== id));
    } catch (e) {
      alert('Failed to delete notification: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 18, display: 'flex', gap: 16 }}>
        <input
          type="text"
          placeholder="Search by type, userId, eventId or id..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 220, marginRight: 8 }}
        />
        <button onClick={handleSearch} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#ffe066', fontWeight: 600, cursor: 'pointer' }}>Search</button>
      </div>
      <div style={{ marginBottom: 18, background: '#fffde6', padding: 16, borderRadius: 8 }}>
        <h3>Create Notification</h3>
        <input
          type="number"
          placeholder="User ID"
          value={createData.userId}
          onChange={e => setCreateData(d => ({ ...d, userId: e.target.value }))}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', minWidth: 100, marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Type"
          value={createData.type}
          onChange={e => setCreateData(d => ({ ...d, type: e.target.value }))}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', minWidth: 100, marginRight: 8 }}
        />
        <input
          type="number"
          placeholder="Event ID (optional)"
          value={createData.eventId}
          onChange={e => setCreateData(d => ({ ...d, eventId: e.target.value }))}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', minWidth: 100, marginRight: 8 }}
        />
        <button onClick={handleCreate} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#bfa800', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create</button>
        {createStatus && <span style={{ marginLeft: 12, color: createStatus === 'Notification created' ? 'green' : 'red' }}>{createStatus}</span>}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #ffe06633' }}>
        <thead>
          <tr style={{ background: '#fffbe6' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Type</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>User ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Event ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Read</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{n.id}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{n.type}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{n.userId}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{n.eventId || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{n.read ? 'Yes' : 'No'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <button onClick={() => handleDelete(n.id)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>Delete</button>
                {!n.read && <button onClick={() => handleMarkRead(n.id)} style={{ background: '#bfa800', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Mark as read</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {notifications.length === 0 && !loading && !error && <div style={{ marginTop: 24, color: '#888' }}>No notifications found.</div>}
    </div>
  );
};

export default AdminNotificationsTab;
