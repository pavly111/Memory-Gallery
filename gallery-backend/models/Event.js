// models/Event.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
  },
  coverUrl: {
    type: String,
    default: '',
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Dashboard's "grid of event cards" query is typically
// "events this user owns or belongs to" — this index speeds up the
// ownerId half of that lookup. (The membership half is covered by
// EventMember's own eventId/userId index.)
eventSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Event', eventSchema);