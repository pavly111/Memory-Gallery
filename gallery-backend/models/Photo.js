// models/Photo.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const photoSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  uploaderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    default: '',
    // Cloudinary's identifier for this asset — required to delete it later.
    // May be empty for any photo created before this field existed.
  },
  caption: {
    type: String,
    default: '',
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Every gallery fetch filters by eventId and sorts by uploadedAt —
// this index makes that query fast even as the collection grows.
photoSchema.index({ eventId: 1, uploadedAt: -1 });

module.exports = mongoose.model('Photo', photoSchema);