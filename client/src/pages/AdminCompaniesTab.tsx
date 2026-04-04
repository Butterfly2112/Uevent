import React, { useState } from 'react';

interface Company {
  id: number;
  name: string;
  email?: string;
  description?: string;
  owner_id?: number;
}

const AdminCompaniesTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      let url = `${import.meta.env.VITE_API_URL}/companies/search`;
      if (search.trim()) {
        const params = new URLSearchParams();
        params.append('search', search);
        url += `?${params.toString()}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch companies');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // On mount, fetch all companies (no search param)
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/companies/search`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch companies');
        const data = await res.json();
        setCompanies(data.companies || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/companies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete company');
      setCompanies(companies => companies.filter(c => c.id !== id));
    } catch (e) {
      alert('Failed to delete company: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search by name, email, description or id..."
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
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Name</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Email</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Description</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Owner ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr key={company.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{company.id}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{company.name}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{company.email || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{company.description || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{company.owner_id || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <button onClick={() => handleDelete(company.id)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {companies.length === 0 && !loading && !error && <div style={{ marginTop: 24, color: '#888' }}>No companies found.</div>}
    </div>
  );
};

export default AdminCompaniesTab;
