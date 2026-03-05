-- ===============================
-- ENUM TYPES
-- ===============================

CREATE TYPE user_role AS ENUM ('USER', 'COMPANY_OWNER', 'ADMIN');

CREATE TYPE event_format AS ENUM (
    'CONFERENCE',
    'WORKSHOP',
    'LECTURE',
    'FEST',
    'CONCERT'
);

CREATE TYPE event_theme AS ENUM (
    'BUSINESS',
    'POLITICS',
    'PSYCHOLOGY',
    'IT',
    'ART',
    'OTHER'
);

CREATE TYPE attendee_visibility AS ENUM (
    'EVERYONE',
    'ONLY_PARTICIPANTS'
);

CREATE TYPE ticket_status AS ENUM (
    'ACTIVE',
    'CANCELLED',
    'USED'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'CANCELLED'
);

CREATE TYPE notification_type AS ENUM (
    'NEW_EVENT',
    'NEW_COMMENT',
    'REMINDER',
    'NEW_VISITOR'
);

-- ===============================
-- USERS
-- ===============================

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email VARCHAR(255) UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
first_name VARCHAR(100),
last_name VARCHAR(100),
bio TEXT,
city VARCHAR(150),
avatar_url TEXT,
show_name_in_attendees BOOLEAN DEFAULT true,
role user_role DEFAULT 'USER',
created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- COMPANIES
-- ===============================

CREATE TABLE companies (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(255) NOT NULL,
description TEXT,
email VARCHAR(255) NOT NULL,
location VARCHAR(255),
logo_url TEXT,
owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- EVENTS
-- ===============================

CREATE TABLE events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
title VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
format event_format NOT NULL,
theme event_theme NOT NULL,
location VARCHAR(255) NOT NULL,
latitude DOUBLE PRECISION,
longitude DOUBLE PRECISION,
event_date TIMESTAMP NOT NULL,
publish_date TIMESTAMP DEFAULT NOW(),
ticket_limit INT NOT NULL CHECK (ticket_limit >= 0),
tickets_sold INT DEFAULT 0 CHECK (tickets_sold >= 0),
price DECIMAL(10,2) DEFAULT 0,
is_free BOOLEAN DEFAULT false,
poster_url TEXT,
show_attendees attendee_visibility DEFAULT 'EVERYONE',
notify_organizer_about_new_visitors BOOLEAN DEFAULT true,
company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- PROMO CODES
-- ===============================

CREATE TABLE promo_codes (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
code VARCHAR(100) UNIQUE NOT NULL,
discount_percent INT CHECK (discount_percent >= 0 AND discount_percent <= 100),
discount_amount DECIMAL(10,2),
usage_limit INT DEFAULT 1 CHECK (usage_limit >= 0),
used_count INT DEFAULT 0 CHECK (used_count >= 0),
expires_at TIMESTAMP,
created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- PAYMENTS
-- ===============================

CREATE TABLE payments (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
stripe_session_id VARCHAR(255),
amount DECIMAL(10,2) NOT NULL,
currency VARCHAR(10) DEFAULT 'USD',
status payment_status DEFAULT 'PENDING',
created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- TICKETS
-- ===============================

CREATE TABLE tickets (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
price_paid DECIMAL(10,2) NOT NULL,
ticket_code UUID DEFAULT gen_random_uuid(),
status ticket_status DEFAULT 'ACTIVE',
created_at TIMESTAMP DEFAULT NOW(),
UNIQUE (user_id, event_id)
);

-- ===============================
-- EVENT SUBSCRIPTIONS
-- ===============================

CREATE TABLE event_subscriptions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT NOW(),
UNIQUE (user_id, event_id)
);

-- ===============================
-- ORGANIZER SUBSCRIPTIONS
-- ===============================

CREATE TABLE organizer_subscriptions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT NOW(),
UNIQUE (user_id, company_id)
);

-- ===============================
-- COMMENTS
-- ===============================

CREATE TABLE comments (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
content TEXT NOT NULL,
parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- NOTIFICATIONS
-- ===============================

CREATE TABLE notifications (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
type notification_type NOT NULL,
reference_id UUID,
created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- COMPANY NEWS
-- ===============================

CREATE TABLE company_news (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
title VARCHAR(255) NOT NULL,
content TEXT NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- INDEXES
-- ===============================

CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_theme ON events(theme);
CREATE INDEX idx_events_format ON events(format);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_promo_code ON promo_codes(code);
CREATE INDEX idx_notifications_user ON notifications(user_id);