// gallery-controllers.js
// Controllers for the per-event photo gallery.
// Assumes: req.user is set by auth middleware (JWT) as { id, name, email }
// Assumes: Photo and EventMember are Mongoose models (see models/Photo.js, models/EventMember.js)
// Upload flow: frontend uploads the file to Cloudinary directly (unsigned preset),
// then calls addPhoto with the resulting secure_url — this controller does not touch Cloudinary.

const Photo = require('../models/Photo');
const EventMember = require('../models/EventMember');
const Event = require('../models/Event');
const deleteCloudinaryImage = require('../utils/deleteCloudinaryImage');

// Small helper: confirm the logged-in user is a member (owner or member) of the event.
// Returns the membership doc if found, otherwise null.
async function getMembership(eventId, userId) {
  return EventMember.findOne({ eventId, userId });
}

// GET /api/events/:eventId/photos
// Returns every photo uploaded to this event, most recent first.
const getEventPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;

    const membership = await getMembership(eventId, req.user.id);
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this event.' });
    }

    const photos = await Photo.find({ eventId })
      .sort({ uploadedAt: -1 })
      .populate('uploaderId', 'name'); // so the gallery can show "uploaded by X"

    return res.status(200).json(photos);
  } catch (err) {
    console.error('getEventPhotos error:', err);
    return res.status(500).json({ message: 'Failed to fetch photos.' });
  }
};

// POST /api/events/:eventId/photos
// Body: { url, publicId, caption? }
// url and publicId are both produced by the client-side Cloudinary upload —
// publicId is what lets deletePhoto later remove the asset, not just the
// Mongo record.
const addPhoto = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { url, publicId, caption } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Photo url is required.' });
    }

    const membership = await getMembership(eventId, req.user.id);
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this event.' });
    }

    const photo = await Photo.create({
      eventId,
      uploaderId: req.user.id,
      url,
      publicId: publicId || '',
      caption: caption || '',
      uploadedAt: new Date(),
    });

    // If this event doesn't have a cover photo yet, use this one — this is
    // the only place coverUrl ever gets set, since there's no dedicated UI
    // for picking a cover manually. Without this, every dashboard card
    // would show "No photos yet" forever, even for events with photos.
    await Event.updateOne(
      { _id: eventId, coverUrl: '' },
      { $set: { coverUrl: url } }
    );

    return res.status(201).json(photo);
  } catch (err) {
    console.error('addPhoto error:', err);
    return res.status(500).json({ message: 'Failed to save photo.' });
  }
};

// DELETE /api/events/:eventId/photos/:photoId
// Only the original uploader OR the event owner can delete a photo.
// Removes both the Mongo record and the underlying Cloudinary asset.
const deletePhoto = async (req, res) => {
  try {
    const { eventId, photoId } = req.params;

    const photo = await Photo.findOne({ _id: photoId, eventId });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }

    const membership = await getMembership(eventId, req.user.id);
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this event.' });
    }

    const isUploader = photo.uploaderId.toString() === req.user.id;
    const isOwner = membership.role === 'owner';

    if (!isUploader && !isOwner) {
      return res.status(403).json({ message: 'Only the uploader or the event owner can delete this photo.' });
    }

    await deleteCloudinaryImage(photo.publicId);
    await Photo.deleteOne({ _id: photoId });

    // If the deleted photo was this event's cover, fall back to the next
    // most recent remaining photo — or clear coverUrl entirely if none
    // are left. Without this, a deleted cover photo would leave the
    // dashboard card pointing at a broken image forever.
    const event = await Event.findById(eventId);
    if (event && event.coverUrl === photo.url) {
      const nextPhoto = await Photo.findOne({ eventId }).sort({ uploadedAt: -1 });
      event.coverUrl = nextPhoto ? nextPhoto.url : '';
      await event.save();
    }

    return res.status(200).json({ message: 'Photo deleted.' });
  } catch (err) {
    console.error('deletePhoto error:', err);
    return res.status(500).json({ message: 'Failed to delete photo.' });
  }
};

module.exports = {
  getEventPhotos,
  addPhoto,
  deletePhoto,
};