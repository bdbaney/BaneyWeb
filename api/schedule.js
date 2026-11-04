const { createClient } = require('@supabase/supabase-js');

// GET /api/schedule
// Read-only weekend schedule for the wedding party page (/weekend/).
// The page has a built-in fallback copy, so any failure here just means it
// keeps showing that copy.
module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    res.setHeader('X-Robots-Tag', 'noindex, nofollow');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('Schedule: SUPABASE_URL or SUPABASE_ANON_KEY is not set');
        return res.status(503).json({ success: false });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const [events, items, around] = await Promise.all([
        supabase.from('weekend_events').select('*').order('day').order('sort_order'),
        supabase.from('weekend_timeline_items').select('*').order('start_time').order('sort_order'),
        supabase.from('weekend_getting_around').select('*').order('sort_order')
    ]);

    if (events.error || items.error) {
        console.error('Schedule error:', events.error || items.error);
        return res.status(503).json({ success: false });
    }

    // Short CDN cache so edits in Supabase show up within a minute or so.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    return res.json({
        events: events.data,
        timeline_items: items.data,
        getting_around: around.error ? [] : around.data
    });
};
