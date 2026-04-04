import React, { useState } from 'react';

interface Event {
  id: number;
  title: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  companyId?: number;
  company?: { id: number; name: string } | null;
}

const AdminEventsTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/search?` + params.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setEvents(events => events.filter(e => e.id !== id));
    } catch (e) {
      alert('Failed to delete event: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search by title, id or companyId..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 220, marginRight: 8 }}
        />
        <button onClick={handleSearch} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#ffe066', fontWeight: 600, cursor: 'pointer' }}>Search</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #ffe06633' }}>
        <thead>
          <tr style={{ background: '#fffbe6' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Title</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Status</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Start Date</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>End Date</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Company ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Company Name</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{event.id}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{event.title}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{event.status || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{event.start_date ? new Date(event.start_date).toLocaleDateString() : '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{event.end_date ? new Date(event.end_date).toLocaleDateString() : '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{event.companyId || event.company?.id || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{event.company?.name || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <button onClick={() => handleDelete(event.id)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {events.length === 0 && !loading && !error && <div style={{ marginTop: 24, color: '#888' }}>No events found.</div>}
    </div>
  );
};

export default AdminEventsTab;
