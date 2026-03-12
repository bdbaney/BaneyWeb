require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rsvpHandler = require('./api/rsvp');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post('/api/rsvp', rsvpHandler);

app.listen(PORT, () => {
    console.log(`Wedding website running at http://localhost:${PORT}`);
});
