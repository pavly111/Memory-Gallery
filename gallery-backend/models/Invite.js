// models/Invite.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const inviteSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
  },
});

// unique: true above already creates an index on inviteCode — no need
// for an additional explicit index.
module.exports = mongoose.model('Invite', inviteSchema);