// routes/invites.js
// Routes for generating an event invite and joining an event via invite code.
// Mounted at the app root ('/api') in index.js — not under /api/events —
// because it covers two different URL shapes:
//   POST /api/events/:eventId/invite   (generate an invite)
//   POST /api/invites/:code/join       (join using a code)
//
// Both protected by requireAuth — you have to be logged in to generate an
// invite, and you have to be logged in to be added as a member when joining.

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const {
  createInvite,
  joinEventByCode,
} = require('../controllers/invite-controllers');

// POST /api/events/:eventId/invite — generate a new invite code for an event
router.post('/events/:eventId/invite', requireAuth, createInvite);

// POST /api/invites/:code/join — join the event tied to this invite code
router.post('/invites/:code/join', requireAuth, joinEventByCode);

module.exports = router;