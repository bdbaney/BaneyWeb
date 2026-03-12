const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// GET /api/rsvp?name=...
// Searches invite_list by guest name (case-insensitive partial match).
// Returns matching parties with all guests in each party.
async function lookupGuest(req, res) {
    const name = (req.query.name || '').trim();

    if (name.length < 2) {
        return res.status(400).json({ success: false, message: 'Please enter at least 2 characters.' });
    }

    const { data, error } = await supabase
        .from('invite_list')
        .select('id, party_name, guest_name, is_primary')
        .ilike('guest_name', `%${name}%`)
        .order('party_name')
        .order('is_primary', { ascending: false });

    if (error) {
        console.error('Lookup error:', error);
        return res.status(500).json({ success: false, message: 'Search failed. Please try again.' });
    }

    // Group rows by party
    const partyMap = {};
    for (const row of data) {
        if (!partyMap[row.party_name]) {
            partyMap[row.party_name] = { partyName: row.party_name, guests: [] };
        }
        partyMap[row.party_name].guests.push({
            id: row.id,
            name: row.guest_name,
            isPrimary: row.is_primary,
        });
    }

    return res.json({ success: true, parties: Object.values(partyMap) });
}

// POST /api/rsvp
// Validates, checks for duplicate party submission, then inserts one row
// per guest into rsvps (plus one row into party_rsvp_lock).
//
// Expected body:
//   { partyName, email, message, guests: [{ name, attending, dietary, inviteListId }] }
async function submitRsvp(req, res) {
    const { partyName, email, message, guests } = req.body || {};

    if (!partyName || !email || !Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Claim the party slot — unique PK on party_name rejects duplicates atomically.
    const { error: lockError } = await supabase
        .from('party_rsvp_lock')
        .insert([{ party_name: partyName }]);

    if (lockError) {
        if (lockError.code === '23505') {
            return res.status(409).json({
                success: false,
                duplicate: true,
                message: "It looks like your party has already RSVP'd! Please contact us directly if you need to make any changes.",
            });
        }
        console.error('Lock error:', lockError);
        return res.status(500).json({ success: false, message: 'Failed to process your RSVP. Please try again.' });
    }

    // Build one row per guest; only the first (submitter) row gets email + message.
    const rows = guests.map((guest, idx) => ({
        party_name:     partyName,
        guest_name:     guest.name,
        attending:      Boolean(guest.attending),
        dietary:        guest.dietary || null,
        email:          idx === 0 ? email : null,
        message:        idx === 0 ? (message || null) : null,
        is_submitter:   idx === 0,
        invite_list_id: guest.inviteListId || null,
    }));

    const { error: insertError } = await supabase.from('rsvps').insert(rows);

    if (insertError) {
        console.error('Insert error:', insertError);
        return res.status(500).json({ success: false, message: 'Failed to save your RSVP. Please try again.' });
    }

    const attendingCount = guests.filter(g => g.attending).length;

    let confirmMsg;
    if (attendingCount === 0) {
        confirmMsg = "We'll miss you! Thank you for letting us know.";
    } else if (attendingCount === guests.length) {
        confirmMsg = `Thank you! We're so excited to celebrate with ${attendingCount > 1 ? 'all ' + attendingCount + ' of you' : 'you'}!`;
    } else {
        confirmMsg = `Thank you! We're excited to celebrate with ${attendingCount} of your party.`;
    }

    console.log(`RSVP submitted — party: "${partyName}", attending: ${attendingCount}/${guests.length}`);
    return res.json({ success: true, message: confirmMsg });
}

// Vercel serverless entry point — routes by HTTP method.
module.exports = async (req, res) => {
    if (req.method === 'GET')  return lookupGuest(req, res);
    if (req.method === 'POST') return submitRsvp(req, res);
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
};

module.exports.lookupGuest = lookupGuest;
module.exports.submitRsvp  = submitRsvp;
