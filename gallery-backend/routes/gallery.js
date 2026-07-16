// routes/gallery.js
// Routes for the per-event photo gallery. All protected by requireAuth —
// req.user.id must exist for the membership checks in gallery-controllers.js
// to work.

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const {
  getEventPhotos,
  addPhoto,
  deletePhoto,
} = require('../controllers/gallery-controllers');

// GET /api/events/:eventId/photos — fetch the full gallery for an event
router.get('/:eventId/photos', requireAuth, getEventPhotos);

// POST /api/events/:eventId/photos — add a photo (client already uploaded to Cloudinary)
router.post('/:eventId/photos', requireAuth, addPhoto);

// DELETE /api/events/:eventId/photos/:photoId — remove a photo
router.delete('/:eventId/photos/:photoId', requireAuth, deletePhoto);

module.exports = router;