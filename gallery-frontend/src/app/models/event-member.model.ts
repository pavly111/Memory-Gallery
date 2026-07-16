// models/event-member.model.ts
// Useful on the frontend for replicating the backend's permission logic
// client-side (e.g. only show the delete button if the current user is
// the uploader or has role 'owner') — the backend still enforces this
// independently regardless of what the UI shows or hides.

export interface EventMember {
  _id: string;
  eventId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
}