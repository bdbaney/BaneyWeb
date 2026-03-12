-- ============================================================
-- Braden & Aaryn Wedding — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and Run.
--
-- NOTE: If you ran a previous schema, run these first:
--   DROP TABLE IF EXISTS rsvps CASCADE;
--   DROP TABLE IF EXISTS invite_list CASCADE;
--   DROP TABLE IF EXISTS party_rsvp_lock CASCADE;
-- ============================================================


-- ============================================================
-- TABLE: invite_list
-- Pre-populated by you with all invited guests.
-- Guests are grouped into parties (e.g. "The Smith Family").
-- is_primary marks the main lookup person for the party.
-- ============================================================
CREATE TABLE IF NOT EXISTS invite_list (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    party_name  TEXT        NOT NULL,
    guest_name  TEXT        NOT NULL,
    is_primary  BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invite_list_guest_name_lower
    ON invite_list (lower(guest_name));

CREATE INDEX IF NOT EXISTS idx_invite_list_party_name
    ON invite_list (party_name);

-- Guests can search the invite list, but cannot modify it.
ALTER TABLE invite_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous SELECT on invite_list"
    ON invite_list
    FOR SELECT
    USING (true);


-- ============================================================
-- TABLE: party_rsvp_lock
-- One row per party that has submitted an RSVP.
-- The primary key on party_name enforces one submission per party.
-- ============================================================
CREATE TABLE IF NOT EXISTS party_rsvp_lock (
    party_name   TEXT        PRIMARY KEY,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allows anonymous INSERT (unique PK rejects duplicate parties).
ALTER TABLE party_rsvp_lock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous INSERT on party_rsvp_lock"
    ON party_rsvp_lock
    FOR INSERT
    WITH CHECK (true);


-- ============================================================
-- TABLE: rsvps
-- One row per guest per party submission.
-- The submitter row also stores email and message.
-- ============================================================
CREATE TABLE IF NOT EXISTS rsvps (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    party_name      TEXT        NOT NULL,
    guest_name      TEXT        NOT NULL,
    attending       BOOLEAN     NOT NULL,
    dietary         TEXT,
    email           TEXT,           -- stored only on the is_submitter row
    message         TEXT,           -- stored only on the is_submitter row
    is_submitter    BOOLEAN     NOT NULL DEFAULT false,
    invite_list_id  UUID        REFERENCES invite_list(id),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsvps_party_name
    ON rsvps (party_name);

-- Anyone can insert a row; nobody can read via the API (use Supabase dashboard).
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous INSERT on rsvps"
    ON rsvps
    FOR INSERT
    WITH CHECK (true);


-- ============================================================
-- EXAMPLE DATA — uncomment to seed your invite list
-- ============================================================
-- INSERT INTO invite_list (party_name, guest_name, is_primary) VALUES
--     ('The Baney Family',    'Braden Baney',   true),
--     ('The Baney Family',    'Mom Baney',       false),
--     ('The Baney Family',    'Dad Baney',       false),
--     ('The Smith Family',    'John Smith',      true),
--     ('The Smith Family',    'Jane Smith',      false),
--     ('The Johnson Party',   'Bob Johnson',     true),
--     ('The Johnson Party',   'Alice Johnson',   false),
--     ('The Johnson Party',   'Emma Johnson',    false);
