# Braden & Aaryn Wedding Website

An elegant single-page wedding website for Braden & Aaryn's wedding on November 7, 2026.

## Features

- **Single-page scrolling design** with smooth navigation
- **Ceremony details** with location and time information
- **RSVP functionality** with form submissions saved to Excel
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
├── server.js           # Node.js backend for RSVP submissions
├── package.json        # Node.js dependencies
├── photos/             # Image folder
│   ├── hero.jpg
│   ├── ceremony.jpg
│   ├── story-cta.jpg
│   └── rsvp.jpg
├── rsvps.xlsx          # Excel file with RSVP responses (auto-generated)
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
   - `xlsx` - Excel file handling

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

### How it works:

1. Guests click the "RSVP" button
2. A modal form appears with fields for:
   - Name (required)
   - Email (required)
   - Number of Guests (required)
   - Dietary Restrictions (optional)
   - Message for the Couple (optional)
3. Form submissions are sent to the Node.js backend
4. Data is appended to `rsvps.xlsx` with timestamp

### Viewing RSVP Responses:

Open the `rsvps.xlsx` file in Excel or Google Sheets to view all submissions. The file includes:
- Timestamp of submission
- Guest name
- Email address
- Number of guests
- Dietary restrictions
- Message

### Excel File Location:

The file is automatically created in the project root directory when the first RSVP is submitted.

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

For a production wedding website, consider deploying to:

- **Vercel** - Easy deployment for static sites
- **Netlify** - Great for static sites with forms
- **Heroku** - Good for Node.js apps (includes the backend)
- **DigitalOcean App Platform** - Full-stack deployment

**Note:** For production, you'll need to update the backend to use a proper database instead of the Excel file, or use a service like Google Sheets API.

## Technical Stack

- **Frontend:**
  - HTML5
  - CSS3 (with CSS Grid and Flexbox)
  - Vanilla JavaScript (ES6+)
  - Google Fonts (Playfair Display & Montserrat)

- **Backend:**
  - Node.js
  - Express.js
  - xlsx library for Excel file handling

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
