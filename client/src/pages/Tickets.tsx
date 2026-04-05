import React, {useEffect, useRef, useState} from 'react';
import planetIcon from "../assets/planet.svg";
import searchIcon from "../assets/search.svg";
import {HeaderUserBlock} from "../components/HeaderUserBlock.tsx";

interface Ticket {
    id: number;
    price_paid: number;
    status: string;
    event: {
        id: number;
        title: string;
        start_date: string;
        poster_url?: string;
    };
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

const MyTickets: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('access_token');

            const res = await fetch(`${apiUrl}/tickets/my`, {
                headers: {
                    ...(token ? {Authorization: `Bearer ${token}`} : {}),
                },
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            setTickets(data);
        } catch {
            setTickets([]);
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
            <main style={{ maxWidth: 1000, margin: '40px auto' }}>

                {loading ? (
                    <div style={{ textAlign: 'center' }}>Loading...</div>
                ) : tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888' }}>
                        No tickets yet
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: 20
                    }}>
                        {tickets.map(ticket => {

                            let imgSrc = '/default-event.png';
                            if (ticket.event.poster_url) {
                                imgSrc = ticket.event.poster_url;
                                if (imgSrc.startsWith('/uploads')) {
                                    const apiUrl = import.meta.env.VITE_API_URL || '';
                                    const baseUrl = apiUrl.replace(/\/api$/, '');
                                    imgSrc = baseUrl + imgSrc;
                                }
                            }

                            return (
                                <div key={ticket.id} style={{
                                    background: '#fff',
                                    borderRadius: 14,
                                    padding: 16,
                                    boxShadow: '0 2px 8px #ffe06655',
                                    border: '1px solid #ffe066',
                                    transition: '0.2s',
                                    height: '300px',
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

                                    {/* Poster */}
                                    <img
                                        src={imgSrc}
                                        alt={ticket.event.title}
                                        style={{
                                            width: '100%',
                                            height: 120,
                                            objectFit: 'cover',
                                            borderRadius: 10,
                                            marginBottom: 10
                                        }}
                                    />

                                    {/* Title */}
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: 18,
                                        marginBottom: 6
                                    }}>
                                        {ticket.event.title}
                                    </div>

                                    {/* Date */}
                                    <div style={{
                                        fontSize: 14,
                                        color: '#666',
                                        marginBottom: 6
                                    }}>
                                        {new Date(ticket.event.start_date).toLocaleString()}
                                    </div>

                                    {/* Price */}
                                    <div style={{
                                        fontWeight: 600,
                                        marginBottom: 6
                                    }}>
                                        {ticket.price_paid === 0 ? 'Free' : `${ticket.price_paid}₴`}
                                    </div>

                                    {/* Status */}
                                    <div style={{
                                        fontSize: 13,
                                        color:
                                            ticket.status === 'paid'
                                                ? 'green'
                                                : ticket.status === 'pending'
                                                    ? '#ccaa00'
                                                    : 'red'
                                    }}>
                                        {ticket.status}
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                const apiUrl = import.meta.env.VITE_API_URL || '';
                                                const token = localStorage.getItem('access_token');

                                                const res = await fetch(`${apiUrl}/tickets/${ticket.id}/pdf`, {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                });

                                                if (!res.ok) throw new Error();

                                                const blob = await res.blob();
                                                const url = window.URL.createObjectURL(blob);

                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `ticket-${ticket.id}.pdf`;
                                                a.click();

                                                window.URL.revokeObjectURL(url);
                                            } catch {
                                                alert('Failed to download PDF');
                                            }
                                        }}
                                        style={{
                                            fontSize: 14,
                                            color: '#ccaa00',
                                            fontWeight: 600,
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Download PDF
                                    </button>

                                    {/* Refund button */}
                                    <button
                                        onClick={async () => {
                                            const confirmRefund = confirm('Are you sure you want to refund this ticket?');
                                            if (!confirmRefund) return;

                                            try {
                                                const apiUrl = import.meta.env.VITE_API_URL || '';
                                                const token = localStorage.getItem('access_token');

                                                const res = await fetch(`${apiUrl}/tickets/${ticket.id}/refund`, {
                                                    method: 'POST',
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                });

                                                if (!res.ok) {
                                                    const err = await res.json();
                                                    throw new Error(err.message || 'Refund failed');
                                                }

                                                alert('Refund successful');

                                                // оновити список квитків
                                                setTickets(prev =>
                                                    prev.map(t =>
                                                        t.id === ticket.id ? { ...t, status: 'paid' } : t
                                                    )
                                                );

                                            } catch (e: any) {
                                                alert(e.message || 'Refund failed');
                                            }
                                        }}
                                        disabled={ticket.status !== 'paid'}
                                        style={{
                                            marginTop: 6,
                                            fontSize: 14,
                                            color: ticket.status === 'paid' ? '#ff4d4f' : '#aaa',
                                            fontWeight: 600,
                                            background: 'none',
                                            border: 'none',
                                            cursor: ticket.status === 'paid' ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        Refund
                                    </button>

                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyTickets;