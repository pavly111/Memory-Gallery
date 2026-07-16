// models/invite.model.ts

export interface Invite {
  _id: string;
  eventId: string;
  inviteCode: string;
  createdBy: string;
  expiresAt?: string;
}