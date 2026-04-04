
import React, { useState } from 'react';
import AdminUsersTab from './AdminUsersTab';
import AdminCompaniesTab from './AdminCompaniesTab';
import AdminEventsTab from './AdminEventsTab';
import AdminNotificationsTab from './AdminNotificationsTab';

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'companies', label: 'Companies' },
  { key: 'events', label: 'Events' },
  { key: 'notifications', label: 'Notifications' },
];

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style= {{color: '#333', fontFamily: 'Arial, sans-serif'}}>Admin Panel</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 22px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.key ? '#ffe066' : '#f3f3f3',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: activeTab === tab.key ? '0 2px 8px #ffe06688' : 'none',
              color: '#222',
              transition: 'background 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ background: '#fffbe6', borderRadius: 12, boxShadow: '0 2px 12px #ffe06633', padding: 32, minHeight: 400 }}>
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'companies' && <AdminCompaniesTab />}
        {activeTab === 'events' && <AdminEventsTab />}
        {activeTab === 'notifications' && <AdminNotificationsTab />}
      </div>
    </div>
  );
};

export default AdminPanel;
