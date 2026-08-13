# Braden & Aaryn Wedding Website

An elegant single-page wedding website for Braden & Aaryn's wedding on November 7, 2026.

## Features

- **Single-page scrolling design** with smooth navigation
- **Ceremony details** with location and time information
- **RSVP functionality** with guest lookup against an invite list, stored in Supabase
- **Our Story section** to share your love story
- **Travel & Stay information** (coming soon)
- **Registry links** section
- **Attire information** for guests
- **Fully responsive** design for all devices
- **Elegant, romantic styling** with beautiful typography

## Project Structure

```
BaneyWeb/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet with elegant design
├── script.js           # JavaScript for interactions and form handling
├── server.js           # Local Express server (wraps the API for development)
├── api/
│   ├── rsvp.js         # Serverless handler — guest lookup + RSVP submission
│   └── notify.js       # Sends the RSVP notification email via Resend
├── supabase-schema.sql # Database schema (run in the Supabase SQL editor)
├── package.json        # Node.js dependencies
├── photos/             # Image folder
│   ├── hero.jpg
│   ├── ceremony.jpg
│   ├── story-cta.jpg
│   └── rsvp.jpg
└── README.md           # This file
```

## Setup Instructions

### Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd /Users/bradenbaney/Desktop/BaneyWeb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install:
   - `express` - Web server framework
   - `cors` - Cross-origin resource sharing
   - `body-parser` - Parse incoming request bodies
   - `@supabase/supabase-js` - Database client
   - `dotenv` - Loads `.env` for local development

3. **Set up environment variables:**

   Copy `.env.example` to `.env` and fill in your Supabase credentials. See
   [Email Notifications](#email-notifications) for the optional notification
   variables. `.env` is gitignored and must never be committed.

## Running the Website

### Start the server:

```bash
npm start
```

The server will start on `http://localhost:3000`

### Development mode (with auto-restart):

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Access the website:

Open your web browser and navigate to:
```
http://localhost:3000
```

## Customization Guide

### Replacing Placeholder Images

Replace the placeholder images in the `/photos` folder with your actual wedding photos:

- **hero.jpg** - Full-screen hero image (recommended: 1920x1080px)
- **ceremony.jpg** - Ceremony venue photo (recommended: 1200x1000px)
- **story-cta.jpg** - Photo for the story call-to-action (recommended: 1920x1080px)
- **rsvp.jpg** - RSVP section background (recommended: 1920x1080px)

### Updating Content

#### Our Story Section
Edit `index.html` around line 158 to update the story text:
```html
<section id="our-story" class="our-story-section">
    <!-- Update the paragraphs here -->
</section>
```

#### Travel & Stay Information
When ready, replace the "coming soon" placeholder in `index.html` around line 173 with actual hotel blocks and travel information.

#### Registry Links
Update the registry link in `index.html` around line 188:
```html
<a href="YOUR_REGISTRY_URL" class="btn btn-secondary" target="_blank">
    View Our Registry
</a>
```

### Customizing Colors

Edit the CSS variables in `styles.css` (lines 8-16):
```css
:root {
    --primary-color: #2c3e50;      /* Main dark color */
    --secondary-color: #8b7355;    /* Secondary brown */
    --accent-color: #d4af37;       /* Gold accent */
    --light-bg: #f8f6f4;           /* Light background */
    /* ... */
}
```

## RSVP Functionality

Guests don't type in their own details — they look themselves up against a
pre-loaded invite list, and the whole party RSVPs together in one submission.

### How it works:

1. Guest clicks "RSVP" and types part of their name (2 characters minimum).
2. `GET /api/rsvp?name=...` searches `invite_list` and returns every matching
   party, with **all** members of that party — not just the person searched for.
3. The guest picks their party and gets a card per person: attending yes/no,
   plus an optional dietary note.
4. The person submitting adds their email (required) and an optional message.
5. `POST /api/rsvp` writes one row per guest into `rsvps`, and an email
   notification goes out (see below).

### One submission per party

Before writing anything, the submission claims the party's name in
`party_rsvp_lock`, whose primary key rejects duplicates atomically. A second
attempt gets a 409 and a message directing them to reach out. This means a
party can RSVP **once** — changes have to be made by hand in Supabase.

### Database tables

| Table | Purpose |
|---|---|
| `invite_list` | Pre-loaded guest names, grouped into parties. Read-only to the public. |
| `rsvps` | One row per guest per submission. Email and message live on the submitter's row. |
| `party_rsvp_lock` | One row per party that has submitted; enforces the single-submission rule. |

Row Level Security allows anonymous `SELECT` on `invite_list` and `INSERT` on
the other two, but **no anonymous reads of `rsvps`** — view responses in the
Supabase dashboard.

### Viewing RSVP Responses:

In the Supabase dashboard, open the Table Editor and select `rsvps`. To see
parties grouped with their submitter's contact details:

```sql
select party_name, guest_name, attending, dietary, email, message, submitted_at
from rsvps
order by submitted_at desc, party_name, guest_name;
```

### Email Notifications

Each time a party submits an RSVP, an email summary is sent to whoever you list
in `NOTIFY_TO`. The email shows the party name, who is and isn't attending, any
dietary notes, and the guest's message. Replying goes straight to the guest.

To turn it on:

1. Create a free account at [resend.com](https://resend.com) and generate an API key.
2. Set these environment variables — locally in `.env`, and in the Vercel
   dashboard under **Settings → Environment Variables** for production:

   ```
   RESEND_API_KEY=re_your-key-here
   NOTIFY_TO=you@example.com,partner@example.com
   ```

3. Redeploy so Vercel picks up the new variables.

Notes:

- Leave `RESEND_API_KEY` or `NOTIFY_TO` unset and notifications are simply
  skipped — RSVPs still save normally.
- The default sender is Resend's shared `onboarding@resend.dev`, which can
  **only deliver to the email address that owns the Resend account**. To send to
  anyone else, verify a domain in Resend and set
  `NOTIFY_FROM="Wedding RSVP <rsvp@yourdomain.com>"`.
- A notification failure never fails the guest's RSVP; the error is logged and
  the guest still sees the confirmation message.

## Deployment

### Local Network Access

To make the website accessible on your local network:

1. Find your computer's IP address:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet "

   # On Windows:
   ipconfig
   ```

2. Share the URL with others on the same network:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

### Production Deployment

The site is live at **https://www.bradenandaaryn.com**, hosted on Vercel.
Pushing to `main` triggers a Production deployment automatically — no manual
deploy step.

`api/rsvp.js` runs as a Vercel serverless function; `server.js` exists only to
wrap the same handlers in Express for local development, so both environments
exercise identical logic.

**Environment variables must be set in the Vercel project settings** (Settings →
Environment Variables), separately from your local `.env`. Two things to
remember:

- They apply to *new* deployments only — after adding one, redeploy.
- A missing variable won't break the site. Check the runtime logs; the RSVP
  handler logs which one it couldn't find.

## Technical Stack

- **Frontend:**
  - HTML5
  - CSS3 (with CSS Grid and Flexbox)
  - Vanilla JavaScript (ES6+)
  - Google Fonts (Playfair Display & Montserrat)

- **Backend:**
  - Node.js (Vercel serverless functions in production, Express locally)
  - Supabase (Postgres) for the invite list and RSVP storage
  - Resend for RSVP notification emails

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Port already in use:

If port 3000 is already in use, you can change it in `server.js`:
```javascript
const PORT = 3001; // Change to any available port
```

### RSVP form not working:

1. Check that the server is running
2. Open browser console (F12) to check for errors
3. Verify the `/api/rsvp` endpoint is accessible

### Images not loading:

1. Verify all images exist in the `/photos` folder
2. Check file names match exactly (case-sensitive)
3. Clear browser cache and refresh

## Support

For questions or issues, please contact:
- Braden: [your-email@example.com]

## License

Personal use only for Braden & Aaryn's wedding.

---

**Made with ❤️ for Braden & Aaryn's Special Day**

*November 7, 2026*
