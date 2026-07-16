// models/event.model.ts
// Named EventModel, not Event — 'Event' is already a built-in TS/DOM type
// (used in event binding, e.g. (event: Event)), so naming this 'Event'
// would silently shadow it and cause confusing type errors elsewhere.

export interface EventModel {
  _id: string;
  name: string;
  date?: string;
  coverUrl: string;
  ownerId: string;
  createdAt: string;
}