// controllers/invite-controllers.js
// Controllers for generating an event invite link and joining an event via code.
// Assumes: req.user is set by auth middleware as { id, name, email }

const crypto = require('crypto');
const Invite = require('../models/Invite');
const EventMember = require('../models/EventMember');

// Generates a short, URL-safe code, e.g. "a1b2c3d4".
function generateInviteCode() {
  return crypto.randomBytes(6).toString('hex');
}

// POST /api/events/:eventId/invite
// Only an existing member (in practice, usually the owner) can generate an invite.
// Body: { expiresInDays? } — optional, invite has no expiry if omitted.
const createInvite = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { expiresInDays } = req.body || {};

    const membership = await EventMember.findOne({ eventId, userId: req.user.id });
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this event.' });
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const invite = await Invite.create({
      eventId,
      inviteCode: generateInviteCode(),
      createdBy: req.user.id,
      expiresAt,
    });

    return res.status(201).json(invite);
  } catch (err) {
    console.error('createInvite error:', err);
    return res.status(500).json({ message: 'Failed to create invite.' });
  }
};

// POST /api/invites/:code/join
// Looks up the invite by code, checks it hasn't expired, and adds the
// logged-in user as an EventMember (role: "member") if they aren't already one.
const joinEventByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const invite = await Invite.findOne({ inviteCode: code });
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found or invalid.' });
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return res.status(410).json({ message: 'This invite has expired.' });
    }

    const existingMembership = await EventMember.findOne({
      eventId: invite.eventId,
      userId: req.user.id,
    });

    if (existingMembership) {
      // Already a member — treat as a no-op success rather than an error,
      // since re-clicking an invite link shouldn't fail.
      return res.status(200).json({ eventId: invite.eventId, alreadyMember: true });
    }

    await EventMember.create({
      eventId: invite.eventId,
      userId: req.user.id,
      role: 'member',
    });

    return res.status(201).json({ eventId: invite.eventId, alreadyMember: false });
  } catch (err) {
    console.error('joinEventByCode error:', err);
    return res.status(500).json({ message: 'Failed to join event.' });
  }
};

module.exports = {
  createInvite,
  joinEventByCode,
};