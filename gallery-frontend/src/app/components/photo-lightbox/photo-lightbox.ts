// components/photo-lightbox/photo-lightbox.component.ts
// Child component — shown when a photo is clicked in EventGalleryComponent.
// Displays the photo full-size with a download button and close control.

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-photo-lightbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-lightbox.html',
  styleUrl: './photo-lightbox.css',
})
export class PhotoLightboxComponent {
  @Input({ required: true }) photo!: Photo;
  @Output() closed = new EventEmitter<void>();

  // isDownloading is a signal for the same reason as everywhere else in
  // this project — it gets set inside a fetch().then() callback, which
  // (like RxJS subscribe callbacks) isn't reliably picked up by zoneless
  // change detection when using a plain property.
  isDownloading = signal(false);
  downloadError = signal('');

  onBackdropClick(): void {
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }

  // Downloads the actual image file rather than just navigating to the
  // Cloudinary URL — a plain <a href="..."> to a cross-origin image
  // usually just opens it in a new tab instead of downloading, depending
  // on the browser. Fetching it as a blob and creating a temporary object
  // URL forces a real download with a sensible filename either way.
  onDownload(): void {
    this.isDownloading.set(true);
    this.downloadError.set('');

    fetch(this.photo.url)
      .then((response) => {
        if (!response.ok) throw new Error('Download failed');
        return response.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = this.buildFilename();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        this.isDownloading.set(false);
      })
      .catch(() => {
        this.downloadError.set('Could not download this photo. Please try again.');
        this.isDownloading.set(false);
      });
  }

  private buildFilename(): string {
    // Cloudinary URLs end in the original extension (e.g. .jpg) — reuse
    // it if present, otherwise fall back to .jpg as a reasonable default.
    const match = this.photo.url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
    const extension = match ? match[1] : 'jpg';
    return `memory-gallery-${this.photo._id}.${extension}`;
  }
}