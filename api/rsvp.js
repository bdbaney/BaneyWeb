const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const { name, email, guests, dietary, message } = req.body;

    if (!name || !email || !guests) {
        return res.status(400).json({ success: false, message: 'Name, email, and number of guests are required.' });
    }

    const { error } = await supabase.from('rsvps').insert([{
        name,
        email,
        guests: parseInt(guests),
        dietary: dietary || null,
        message: message || null
    }]);

    if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save your RSVP. Please try again.' });
    }

    res.json({ success: true, message: "Thank you for your RSVP! We can't wait to celebrate with you!" });
};
