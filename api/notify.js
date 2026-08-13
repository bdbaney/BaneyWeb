// Sends an email notification whenever a party submits an RSVP.
//
// Uses the Resend REST API directly (no extra dependency — Vercel's Node
// runtime provides global fetch).
//
// Env vars:
//   RESEND_API_KEY  required — notifications are skipped if unset
//   NOTIFY_TO       required — comma-separated recipient list
//   NOTIFY_FROM     optional — defaults to Resend's shared onboarding sender

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'Wedding RSVP <onboarding@resend.dev>';

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildHtml({ partyName, email, message, guests }) {
    const attending = guests.filter(g => g.attending);
    const declined  = guests.filter(g => !g.attending);

    const guestRow = (guest, isAttending) => `
        <tr>
            <td style="padding:6px 12px 6px 0;">${isAttending ? '&#10003;' : '&#10007;'}</td>
            <td style="padding:6px 12px 6px 0;">${escapeHtml(guest.name)}</td>
            <td style="padding:6px 0;color:#666;">${guest.dietary ? escapeHtml(guest.dietary) : '&mdash;'}</td>
        </tr>`;

    const rows = [
        ...attending.map(g => guestRow(g, true)),
        ...declined.map(g => guestRow(g, false)),
    ].join('');

    return `
<div style="font-family:Georgia,serif;max-width:520px;color:#222;line-height:1.5;background:#fff;padding:24px;">
    <h2 style="margin:0 0 4px;font-weight:normal;">New RSVP</h2>
    <p style="margin:0 0 20px;color:#666;">${escapeHtml(partyName)}</p>

    <p style="margin:0 0 12px;">
        <strong>${attending.length}</strong> attending &middot;
        <strong>${declined.length}</strong> not attending
    </p>

    <table style="border-collapse:collapse;margin-bottom:20px;">${rows}</table>

    <p style="margin:0 0 6px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${message ? `<p style="margin:0;"><strong>Message:</strong> ${escapeHtml(message)}</p>` : ''}
</div>`;
}

function buildText({ partyName, email, message, guests }) {
    const lines = [
        `New RSVP — ${partyName}`,
        '',
        ...guests.map(g => {
            const mark = g.attending ? 'YES' : 'NO ';
            return `  ${mark}  ${g.name}${g.dietary ? ` (${g.dietary})` : ''}`;
        }),
        '',
        `Email: ${email}`,
    ];
    if (message) lines.push(`Message: ${message}`);
    return lines.join('\n');
}

// Never throws — a failed notification must not fail the guest's RSVP.
async function sendRsvpNotification({ partyName, email, message, guests }) {
    const apiKey = process.env.RESEND_API_KEY;
    const to = (process.env.NOTIFY_TO || '')
        .split(',')
        .map(addr => addr.trim())
        .filter(Boolean);

    if (!apiKey || to.length === 0) {
        // Name the missing variable — "one of these two" sends you hunting.
        const missing = [];
        if (!apiKey) missing.push('RESEND_API_KEY');
        if (to.length === 0) missing.push('NOTIFY_TO');
        console.log(`Notification skipped — ${missing.join(' and ')} not configured.`);
        return;
    }

    const attendingCount = guests.filter(g => g.attending).length;
    const payload = {
        from: process.env.NOTIFY_FROM || DEFAULT_FROM,
        to,
        reply_to: email,
        subject: `RSVP: ${partyName} — ${attendingCount} of ${guests.length} attending`,
        html: buildHtml({ partyName, email, message, guests }),
        text: buildText({ partyName, email, message, guests }),
    };

    try {
        const response = await fetch(RESEND_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error(`Notification failed (${response.status}): ${body}`);
            return;
        }

        console.log(`Notification sent for party "${partyName}".`);
    } catch (err) {
        console.error('Notification error:', err);
    }
}

module.exports = { sendRsvpNotification };
