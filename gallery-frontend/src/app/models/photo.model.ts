// models/photo.model.ts
// uploaderId here is an OBJECT, not a plain string ID — the backend's
// getEventPhotos controller does .populate('uploaderId', 'name'), so the
// response nests { _id, name } instead of a bare ObjectId string. Get this
// wrong and every photo.uploaderId.name in a template will silently fail.

export interface Photo {
  _id: string;
  eventId: string;
  uploaderId: {
    _id: string;
    name: string;
  };
  url: string;
  publicId: string;
  caption: string;
  uploadedAt: string;
}