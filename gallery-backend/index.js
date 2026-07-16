// index.js
// Express app entry point for the Memory Gallery backend.

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const dbConnect = require('./config/db');

const eventRoutes = require('./routes/events');
const galleryRoutes = require('./routes/gallery');
const inviteRoutes = require('./routes/invites');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Mount order matters here: both eventRoutes and galleryRoutes attach under
// /api/events. eventRoutes goes first since it owns the base paths
// ('/', '/:eventId'), and galleryRoutes only adds more specific sub-paths
// ('/:eventId/photos', '/:eventId/photos/:photoId') on top of it.
app.use('/api/events', eventRoutes);
app.use('/api/events', galleryRoutes);

// inviteRoutes defines its own full paths (/events/:eventId/invite,
// /invites/:code/join), so it mounts at the root instead of /api/events.
app.use('/api', inviteRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});