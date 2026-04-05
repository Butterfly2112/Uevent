import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';
import planetIcon from "../assets/planet.svg";
import searchIcon from "../assets/search.svg";
import {HeaderUserBlock} from "../components/HeaderUserBlock.tsx";

interface User {
    id: number;
    login: string;
}

interface Event {
    id: number;
    title: string;
    poster_url?: string;
    start_date?: string;
    end_date?: string;
    price?: number;
    address?: string;
    publish_date?: string;
    companyId?: number | null;
    company?: {
        id: number;
        name: string;
    } | null;
}

const Participants: React.FC = () => {
    const { id } = useParams();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchParticipants();
    }, [id]);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('access_token');

            const res = await fetch(`${apiUrl}/tickets/event/${id}/participants`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error('Failed to fetch participants');

            const data = await res.json();
            setUsers(data);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    function handleSearch() {
        if (!search.trim()) {
            setEvents(allEvents);
            return;
        }
        setEvents(
            allEvents.filter(ev =>
                ev.title.toLowerCase().includes(search.trim().toLowerCase())
            )
        );
    }
    const [search, setSearch] = useState('');
    const [allEvents] = useState<Event[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [, setCanScrollLeft] = useState(false);
    const [, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        const container = cardsContainerRef.current;
        if (!container) return;
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(container.scrollLeft + container.offsetWidth < container.scrollWidth - 1);
    };

    useEffect(() => {
        updateScrollButtons();
        const container = cardsContainerRef.current;
        if (!container) return;
        container.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);
        return () => {
            container.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [events]);
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
    const [company, setCompany] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('access_token'));
        const profileStr = localStorage.getItem('profile');
        if (profileStr) {
            try {
                const user = JSON.parse(profileStr);
                setCompany(user.company && user.company.id ? user.company : null);
            } catch {
                setCompany(null);
            }
        } else {
            setCompany(null);
        }
    }, []);

    useEffect(() => {
        const handleStorage = () => {
            setIsLoggedIn(!!localStorage.getItem('access_token'));
            const profileStr = localStorage.getItem('profile');
            if (profileStr) {
                try {
                    const user = JSON.parse(profileStr);
                    setCompany(user.company && user.company.id ? user.company : null);
                } catch {
                    setCompany(null);
                }
            } else {
                setCompany(null);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);
    const cardsContainerRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: '#fffef8' }}>

            {/* HEADER */}
            <header className="home-header" style={{ background: '#fff', borderBottom: '1px solid #e0e0c0', display: 'flex', alignItems: 'center', padding: '12px 24px', gap: 16 }}>
                <a href="/" className="logo-block" style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: 16, textDecoration: 'none' }}>
                    <span className="logo-text" style={{ fontFamily: 'Kavivanar, cursive', fontSize: 32, color: '#111' }}>Uevent</span>
                    <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
            <img src={planetIcon} alt="planet" style={{ width: 28, height: 28 }} />
          </span>
                </a>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 24 }}>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search events"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        style={{ minWidth: 180, background: '#fff', border: '1px solid #ffe066', borderRight: 'none', borderRadius: '20px 0 0 20px', padding: '8px 12px', fontSize: 16, color: '#222' }}
                    />
                    <button
                        className="search-btn"
                        type="button"
                        onClick={handleSearch}
                        style={{ borderRadius: '0 20px 20px 0', border: '1px solid #ffe066', borderLeft: 'none', width: 38, height: 38, marginLeft: 0, background: 'linear-gradient(90deg, #ffe066 60%, #ffd700 100%)', boxShadow: '0 1px 6px #ffe066', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >
                        <img src={searchIcon} alt="search" style={{ width: 16, height: 16 }} />
                    </button>
                </div>
                <nav className="main-nav">
                    <a href="/all-event-types">Browse Events</a>
                    <a href="/create-event">Create Event</a>
                    <a href="/profile">My tickets</a>
                    {isLoggedIn && company && company.id ? (
                        <a href={`/company/${company.id}`}>View Company{company.name ? `: ${company.name}` : ''}</a>
                    ) : isLoggedIn ? (
                        <a href="/register-company">Register Company</a>
                    ) : null}
                </nav>
                <HeaderUserBlock />
            </header>

            {/* CONTENT */}
            <main style={{ maxWidth: 900, margin: '40px auto' }}>

                {loading ? (
                    <div style={{ textAlign: 'center' }}>Loading...</div>
                ) : users.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: '#888',
                        fontSize: 18
                    }}>
                        No participants yet
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: 20
                    }}>
                        {users.map((user, index) => (
                            <div key={user.id} style={{
                                background: '#fff',
                                borderRadius: 14,
                                padding: 20,
                                boxShadow: '0 2px 8px #ffe06655',
                                border: '1px solid #ffe066',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                transition: '0.2s'
                            }}
                                 onMouseEnter={(e) => {
                                     e.currentTarget.style.transform = 'translateY(-4px)';
                                     e.currentTarget.style.boxShadow = '0 4px 12px #ffe066aa';
                                 }}
                                 onMouseLeave={(e) => {
                                     e.currentTarget.style.transform = 'translateY(0)';
                                     e.currentTarget.style.boxShadow = '0 2px 8px #ffe06655';
                                 }}
                            >

                                {/* Avatar */}
                                <div style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: '#ffe066',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: 20,
                                    color: '#222',
                                    marginBottom: 12
                                }}>
                                    {user.login[0].toUpperCase()}
                                </div>

                                {/* Name */}
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: 18,
                                    marginBottom: 6
                                }}>
                                    {user.login}
                                </div>

                                {/* Ticket number */}
                                <div style={{
                                    fontSize: 14,
                                    color: '#888'
                                }}>
                                    #{index + 1}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Participants;