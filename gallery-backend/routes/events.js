// routes/events.js
// Routes for creating, listing, fetching, and deleting events. All
// protected by requireAuth.

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const {
  createEvent,
  getMyEvents,
  getEventById,
  deleteEvent,
} = require('../controllers/event-controllers');

// POST /api/events — create a new event (creator auto-joins as owner)
router.post('/', requireAuth, createEvent);

// GET /api/events — list every event the logged-in user belongs to
router.get('/', requireAuth, getMyEvents);

// GET /api/events/:eventId — fetch a single event (membership-gated)
router.get('/:eventId', requireAuth, getEventById);

// DELETE /api/events/:eventId — owner only, cascades to photos/members/invites
router.delete('/:eventId', requireAuth, deleteEvent);

module.exports = router;