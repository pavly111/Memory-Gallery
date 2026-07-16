// models/EventMember.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventMemberSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

// A user can only join a given event once — this is also what
// gallery-controllers.js relies on when it does findOne({ eventId, userId }).
eventMemberSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('EventMember', eventMemberSchema);