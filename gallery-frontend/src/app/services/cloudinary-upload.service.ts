// services/cloudinary-upload.service.ts
// Uploads a File directly from the browser to Cloudinary using an
// UNSIGNED upload preset — this never touches your Express backend at
// all. The backend only ever sees the resulting url/publicId afterward,
// via GalleryService.addPhoto().
//
// cloud_name and upload_preset are safe to hardcode/expose in frontend
// code — they are NOT secrets. The actual secrets (CLOUDINARY_API_KEY,
// CLOUDINARY_API_SECRET) live only in the backend's .env and are never
// sent to the browser.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const CLOUD_NAME = 'diijhduq1';
const UPLOAD_PRESET = 'images';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  constructor(private http: HttpClient) {}

  upload(file: File): Observable<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    // authInterceptor now correctly scopes itself to your own backend
    // only (see auth.interceptor.ts), so this request to Cloudinary
    // never gets a stray Authorization header attached — no fix needed
    // here on this end.
    return this.http.post<any>(UPLOAD_URL, formData).pipe(
      map((res) => ({
        url: res.secure_url,
        publicId: res.public_id,
      }))
    );
  }
}