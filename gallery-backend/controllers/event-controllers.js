// controllers/event-controllers.js
// Controllers for creating, listing, fetching, and deleting events.
// Assumes: req.user is set by auth middleware as { id, name, email }

const Event = require('../models/Event');
const EventMember = require('../models/EventMember');
const Photo = require('../models/Photo');
const Invite = require('../models/Invite');
const deleteCloudinaryImage = require('../utils/deleteCloudinaryImage');

// POST /api/events
// Body: { name, date?, coverUrl? }
// Creates the event AND automatically makes the creator an EventMember with
// role "owner" — without this, the creator couldn't pass their own
// membership check in gallery-controllers.js.
const createEvent = async (req, res) => {
  try {
    const { name, date, coverUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Event name is required.' });
    }

    const event = await Event.create({
      name,
      date,
      coverUrl: coverUrl || '',
      ownerId: req.user.id,
    });

    await EventMember.create({
      eventId: event._id,
      userId: req.user.id,
      role: 'owner',
    });

    return res.status(201).json(event);
  } catch (err) {
    console.error('createEvent error:', err);
    return res.status(500).json({ message: 'Failed to create event.' });
  }
};

// GET /api/events
// Returns every event the logged-in user belongs to (owner or member),
// newest first — this is what feeds the dashboard's grid of event cards.
const getMyEvents = async (req, res) => {
  try {
    const memberships = await EventMember.find({ userId: req.user.id });
    const eventIds = memberships.map((m) => m.eventId);

    const events = await Event.find({ _id: { $in: eventIds } }).sort({ createdAt: -1 });

    return res.status(200).json(events);
  } catch (err) {
    console.error('getMyEvents error:', err);
    return res.status(500).json({ message: 'Failed to fetch events.' });
  }
};

// GET /api/events/:eventId
// Returns a single event's details — only if the requester is a member.
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const membership = await EventMember.findOne({ eventId, userId: req.user.id });
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this event.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.status(200).json(event);
  } catch (err) {
    console.error('getEventById error:', err);
    return res.status(500).json({ message: 'Failed to fetch event.' });
  }
};

// DELETE /api/events/:eventId
// Owner ONLY — not just any member. Deleting an event is destructive for
// everyone in it, so this is intentionally stricter than the photo-delete
// permission (uploader-or-owner). Cascades to clean up everything tied to
// the event: EventMember records, Invite records, Photo records, AND the
// actual Cloudinary assets those photos point to — otherwise deleting an
// event would leave orphaned data scattered across three other collections
// plus real files sitting in Cloudinary forever.
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the event owner can delete this event.' });
    }

    // Clean up Cloudinary assets BEFORE deleting the Photo records — once
    // the Photo docs are gone, we'd lose the publicId needed to delete
    // them from Cloudinary at all.
    const photos = await Photo.find({ eventId });
    await Promise.all(photos.map((photo) => deleteCloudinaryImage(photo.publicId)));

    await Promise.all([
      Photo.deleteMany({ eventId }),
      EventMember.deleteMany({ eventId }),
      Invite.deleteMany({ eventId }),
      Event.deleteOne({ _id: eventId }),
    ]);

    return res.status(200).json({ message: 'Event deleted.' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    return res.status(500).json({ message: 'Failed to delete event.' });
  }
};

module.exports = {
  createEvent,
  getMyEvents,
  getEventById,
  deleteEvent,
};