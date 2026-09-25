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
import { Observable, from, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

const CLOUD_NAME = 'diijhduq1';
const UPLOAD_PRESET = 'images';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Cloudinary's unsigned preset caps uploads at 10MB. iPhone photos
// (especially from newer models with high-megapixel sensors, ProRAW, or
// Live Photos) routinely exceed this — a real photo can be 15-25MB+.
// Resizing/re-encoding client-side before upload keeps every upload
// comfortably under that limit, works identically on iOS/Android/desktop,
// and also means less data to send over a slow mobile connection.
const MAX_DIMENSION_PX = 2000;
const JPEG_QUALITY = 0.85;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  constructor(private http: HttpClient) {}

  upload(file: File): Observable<CloudinaryUploadResult> {
    return from(this.compressImage(file)).pipe(
      switchMap((compressedFile) => {
        const formData = new FormData();
        formData.append('file', compressedFile);
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
      })
    );
  }

  // Resizes the image down to MAX_DIMENSION_PX on its longest side (if
  // larger) and re-encodes it as JPEG. Uses the browser's own image
  // decoder via createImageBitmap, which on Safari/iOS can decode HEIC
  // natively — so this also transparently converts HEIC to JPEG, which
  // Cloudinary and every browser can then display with zero extra work.
  //
  // If anything goes wrong here (unsupported format, decode failure),
  // we fall back to uploading the original file untouched rather than
  // blocking the upload entirely.
  private async compressImage(file: File): Promise<File> {
    try {
      const bitmap = await createImageBitmap(file);

      const scale = Math.min(
        1,
        MAX_DIMENSION_PX / Math.max(bitmap.width, bitmap.height)
      );
      const targetWidth = Math.round(bitmap.width * scale);
      const targetHeight = Math.round(bitmap.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return file;
      }

      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      bitmap.close();

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
      );

      if (!blob) {
        return file;
      }

      // Give the compressed file a .jpg name regardless of the original
      // extension (e.g. photo.heic -> photo.jpg), since that's what it
      // actually is now.
      const newName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
      return new File([blob], newName, { type: 'image/jpeg' });
    } catch (err) {
      console.error('Image compression failed, uploading original file:', err);
      return file;
    }
  }
}
