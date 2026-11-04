-- ============================================================
-- Wedding party weekend page (/weekend/) — schema + seed
-- Read-only to the public. Edit rows in the Supabase Table Editor and
-- the page picks them up within about a minute; no redeploy needed.
-- Times are timestamptz; the page shows them in Eastern time.
-- Re-running this file resets the schedule to the seed below.
-- ============================================================

CREATE TABLE IF NOT EXISTS weekend_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day           DATE NOT NULL,
    title         TEXT NOT NULL,
    location_name TEXT NOT NULL,
    address       TEXT,
    dress_code    TEXT,
    notes         TEXT,
    sort_order    INT  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS weekend_timeline_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES weekend_events(id) ON DELETE CASCADE,
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ,
    title       TEXT NOT NULL,
    details     TEXT,
    audience    TEXT,                          -- badge text, e.g. "Bride + bridesmaids"
    side        TEXT CHECK (side IN ('bride', 'groom')), -- filter chips; NULL = everyone
    block       TEXT,                          -- Saturday grouping, e.g. "Reception"
    highlight   BOOLEAN NOT NULL DEFAULT false,
    kind        TEXT,                          -- 'sunset' gets the sunset styling
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_weekend_items_event ON weekend_timeline_items (event_id);

-- Placeholder for shuttles later; the page shows a "Getting around"
-- section as soon as this has rows.
CREATE TABLE IF NOT EXISTS weekend_getting_around (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    details     TEXT,
    sort_order  INT NOT NULL DEFAULT 0
);

ALTER TABLE weekend_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekend_timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekend_getting_around ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read weekend_events" ON weekend_events;
CREATE POLICY "Public read weekend_events" ON weekend_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public read weekend_timeline_items" ON weekend_timeline_items;
CREATE POLICY "Public read weekend_timeline_items" ON weekend_timeline_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public read weekend_getting_around" ON weekend_getting_around;
CREATE POLICY "Public read weekend_getting_around" ON weekend_getting_around FOR SELECT TO anon, authenticated USING (true);

-- ---------- seed ----------
BEGIN;
DELETE FROM weekend_timeline_items;
DELETE FROM weekend_events;

INSERT INTO weekend_events (id, day, title, location_name, address, dress_code, notes, sort_order) VALUES
    ('8067c812-e3ef-4c7e-a024-b7d6020a389c', '2026-11-06', 'Rehearsal + Dinner', 'The Barn on New River', '2162 S Fork Farm Ln, West Jefferson, NC 28694', 'Dress nice / business casual', NULL, 1),
    ('7823a89c-72e3-4631-a860-f1a4f7cae3ad', '2026-11-06', 'Welcome Party', 'Basil''s Fresh Pasta & Deli', '246 Wilson Drive, Suite K, Boone, NC 28607', NULL, 'Invites went out, but this one''s a relaxed hang. If friends hear about it and swing by, that''s totally fine!', 2),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07', 'Wedding Day', 'The Barn on New River', '2162 S Fork Farm Ln, West Jefferson, NC 28694', 'You know the drill 😉', 'Everything happens on site. Everyone gets ready inside the barn, and The Summit is the first-look and portrait spot on the venue grounds.', 1),
    ('86d7c7b2-a920-4d6b-afc8-8d073d7a5120', '2026-11-07', 'Men''s house', 'Men''s house · S Fork Farm Ln', NULL, NULL, 'No street number for this one. Text the groom for directions.', 2),
    ('26520273-26d5-4d5a-a1d3-599ab35a0776', '2026-11-08', 'Farewell Hang', 'Booneshine Brewing Company', '465 Industrial Park Drive, Boone, NC 28607', 'Whatever''s comfy', 'This is where we met! Come see where it all started.', 1);

INSERT INTO weekend_timeline_items (event_id, start_time, end_time, title, details, audience, side, block, highlight, kind, sort_order) VALUES
    ('8067c812-e3ef-4c7e-a024-b7d6020a389c', '2026-11-06T15:45:00-05:00', NULL, 'Arrival at The Barn', NULL, NULL, NULL, NULL, false, NULL, 1),
    ('8067c812-e3ef-4c7e-a024-b7d6020a389c', '2026-11-06T16:00:00-05:00', '2026-11-06T16:30:00-05:00', 'Rehearsal', NULL, NULL, NULL, NULL, false, NULL, 2),
    ('8067c812-e3ef-4c7e-a024-b7d6020a389c', '2026-11-06T16:30:00-05:00', '2026-11-06T17:30:00-05:00', 'Cocktail hour', NULL, NULL, NULL, NULL, false, NULL, 3),
    ('8067c812-e3ef-4c7e-a024-b7d6020a389c', '2026-11-06T17:30:00-05:00', '2026-11-06T18:30:00-05:00', 'Dinner', NULL, NULL, NULL, NULL, false, NULL, 4),
    ('7823a89c-72e3-4631-a860-f1a4f7cae3ad', '2026-11-06T19:30:00-05:00', '2026-11-06T22:00:00-05:00', 'Welcome Party at Basil''s', NULL, NULL, NULL, NULL, false, NULL, 5),
    ('7823a89c-72e3-4631-a860-f1a4f7cae3ad', '2026-11-06T23:00:00-05:00', NULL, 'Head back to West Jefferson', NULL, NULL, NULL, NULL, false, NULL, 6),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T07:00:00-05:00', NULL, 'Venue opens; hair and makeup begins', 'Early entry', 'Bride + bridesmaids', 'bride', 'Morning + getting ready', false, NULL, 1),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T10:00:00-05:00', NULL, 'Photography begins', 'Detail shots and flat lays (venue, tables, details)', 'Photographer', NULL, 'Morning + getting ready', false, NULL, 2),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T12:00:00-05:00', NULL, 'Groom and groomsmen arrive', NULL, 'Groom + groomsmen', 'groom', 'Morning + getting ready', false, NULL, 3),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T12:30:00-05:00', NULL, '"Getting ready" portraits', NULL, 'Groom + groomsmen', 'groom', 'Morning + getting ready', false, NULL, 4),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T13:00:00-05:00', NULL, 'Hair and makeup complete; pajama photo', NULL, 'Bride + bridesmaids', 'bride', 'Morning + getting ready', false, NULL, 5),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T13:20:00-05:00', NULL, 'Bride steps into the dress', NULL, 'Bride', 'bride', 'Morning + getting ready', false, NULL, 6),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T13:40:00-05:00', NULL, 'First look with Father of the Bride', NULL, 'Bride + FOB', 'bride', 'Morning + getting ready', false, NULL, 7),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T13:50:00-05:00', NULL, 'Groom and photographer head to the Summit', NULL, 'Groom', 'groom', 'First look + portraits', false, NULL, 8),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T14:00:00-05:00', NULL, 'Bride to the Summit: first look + couple portraits', NULL, 'Bride + Groom', NULL, 'First look + portraits', false, NULL, 9),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T14:30:00-05:00', NULL, 'Full wedding party portraits', 'Then bride + bridesmaids, and groom + groomsmen', 'Whole wedding party', NULL, 'First look + portraits', false, NULL, 10),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T15:00:00-05:00', NULL, 'Family photos', NULL, 'Immediate family', NULL, 'First look + portraits', false, NULL, 11),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T15:30:00-05:00', NULL, 'Prelude music begins', NULL, 'Everyone', NULL, 'Ceremony + cocktail hour', false, NULL, 12),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T16:00:00-05:00', NULL, 'Ceremony begins', NULL, 'Everyone', NULL, 'Ceremony + cocktail hour', true, NULL, 13),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T16:30:00-05:00', NULL, 'Cocktail hour begins', NULL, 'Everyone', NULL, 'Ceremony + cocktail hour', false, NULL, 14),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T17:24:00-05:00', NULL, 'Estimated sunset 🌅', 'Golden hour, so it''s great light for photos', 'Everyone', NULL, 'Ceremony + cocktail hour', false, 'sunset', 15),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T17:25:00-05:00', NULL, 'Guests find their seats in the reception space', 'Bride''s dress gets bustled', 'Everyone', NULL, 'Reception', false, NULL, 16),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T17:35:00-05:00', NULL, 'Introductions', 'Wedding Party → Maid of Honor + Best Man → The Newlyweds', 'MOH + Best Man', NULL, 'Reception', true, NULL, 17),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T17:40:00-05:00', NULL, 'Welcome + blessing', 'Welcome by the Bride''s parents; blessing by the Father of the Groom (David)', 'Everyone', NULL, 'Reception', false, NULL, 18),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T17:45:00-05:00', NULL, 'Dinner served', 'DJ releases tables to the buffet', 'Everyone', NULL, 'Reception', false, NULL, 19),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T18:30:00-05:00', NULL, 'Cake cutting', NULL, 'Everyone', NULL, 'Reception', false, NULL, 20),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T18:35:00-05:00', NULL, 'Toasts', 'Father of the Bride → Maid of Honor → Best Man → The Newlyweds', 'MOH + Best Man', NULL, 'Reception', true, NULL, 21),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T18:55:00-05:00', NULL, 'Dances', 'First Dance → Father/Daughter Dance (bouquet dedication follows) → Mother/Son Dance', 'Everyone', NULL, 'Reception', false, NULL, 22),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T20:15:00-05:00', NULL, 'Open dance floor; lights down 🪩', NULL, 'Everyone', NULL, 'Reception', false, NULL, 23),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T21:15:00-05:00', NULL, 'Last call at the bar', NULL, 'Everyone', NULL, 'Reception', false, NULL, 24),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T21:30:00-05:00', NULL, 'Bar closes', NULL, 'Everyone', NULL, 'Reception', false, NULL, 25),
    ('90331018-ed16-415b-a50f-e650d02d4a28', '2026-11-07T22:00:00-05:00', NULL, 'Sparkler exit ✨', 'Event ends', 'Everyone', NULL, 'Reception', true, NULL, 26),
    ('26520273-26d5-4d5a-a1d3-599ab35a0776', '2026-11-08T11:30:00-05:00', '2026-11-08T14:00:00-05:00', 'Farewell hang', 'Come say goodbye to us! Casual come-and-go, so stop by whenever.', 'Everyone', NULL, NULL, false, NULL, 1);
COMMIT;
