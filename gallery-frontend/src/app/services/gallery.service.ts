// services/gallery.service.ts
// Wraps GET/POST/DELETE /api/events/:eventId/photos. Note: this only talks
// to OUR backend — it never touches Cloudinary directly. The actual file
// upload to Cloudinary happens in cloudinary-upload.service.ts, and only
// the resulting url/publicId ever reach this service.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Photo } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private baseUrl = '/api/events';

  constructor(private http: HttpClient) {}

  // GET /api/events/:eventId/photos
  getPhotos(eventId: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.baseUrl}/${eventId}/photos`);
  }

  // POST /api/events/:eventId/photos
  // url/publicId come from CloudinaryUploadService, not from this method.
  addPhoto(
    eventId: string,
    url: string,
    publicId: string,
    caption?: string
  ): Observable<Photo> {
    return this.http.post<Photo>(`${this.baseUrl}/${eventId}/photos`, {
      url,
      publicId,
      caption,
    });
  }

  // DELETE /api/events/:eventId/photos/:photoId
  // Backend enforces uploader-or-owner permission regardless of what the
  // UI shows/hides — this call will 403 if the current user isn't allowed,
  // even if the delete button was visible to them client-side.
  deletePhoto(eventId: string, photoId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${eventId}/photos/${photoId}`
    );
  }
}