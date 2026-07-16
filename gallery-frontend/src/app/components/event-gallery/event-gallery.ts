// components/event-gallery/event-gallery.component.ts
// event/photos/isLoading/isUploading/errorMessage are all signals — same
// zoneless change detection fix applied throughout this project.

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventModel } from '../../models/event.model';
import { Photo } from '../../models/photo.model';
import { EventService } from '../../services/event.service';
import { GalleryService } from '../../services/gallery.service';
import { CloudinaryUploadService } from '../../services/cloudinary-upload.service';
import { InviteService } from '../../services/invite.service';
import { AuthService } from '../../services/auth.service';
import { RandomTiltDirective } from '../../directives/random-tilt.directive';
import { PhotoLightboxComponent } from '../photo-lightbox/photo-lightbox';

@Component({
  selector: 'app-event-gallery',
  standalone: true,
  imports: [CommonModule, RandomTiltDirective, PhotoLightboxComponent],
  templateUrl: './event-gallery.html',
  styleUrl: './event-gallery.css',
})
export class EventGalleryComponent implements OnInit {
  event = signal<EventModel | null>(null);
  photos = signal<Photo[]>([]);
  eventId = '';

  isLoading = signal(true);
  isUploading = signal(false);
  errorMessage = signal('');
  selectedPhoto = signal<Photo | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private galleryService: GalleryService,
    private cloudinaryUpload: CloudinaryUploadService,
    private inviteService: InviteService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.eventId) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadEventAndPhotos();
  }

  private loadEventAndPhotos(): void {
    this.isLoading.set(true);

    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => this.event.set(event),
      error: () => {
        this.errorMessage.set('Could not load this event — you may not have access.');
        this.isLoading.set(false);
      },
    });

    this.galleryService.getPhotos(this.eventId).subscribe({
      next: (photos) => {
        this.photos.set(photos);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load photos for this event.');
        this.isLoading.set(false);
      },
    });
  }

  trackByPhotoId(index: number, photo: Photo): string {
    return photo._id;
  }

  onFileSelected(fileEvent: Event): void {
    const input = fileEvent.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploading.set(true);

    this.cloudinaryUpload.upload(file).subscribe({
      next: (result) => {
        this.galleryService
          .addPhoto(this.eventId, result.url, result.publicId)
          .subscribe({
            next: (photo) => {
              this.photos.update((current) => [photo, ...current]);
              this.isUploading.set(false);
            },
            error: () => {
              this.errorMessage.set('Uploaded to Cloudinary but failed to save — try again.');
              this.isUploading.set(false);
            },
          });
      },
      error: () => {
        this.errorMessage.set('Upload failed. Please try again.');
        this.isUploading.set(false);
      },
    });

    input.value = '';
  }

  canDeletePhoto(photo: Photo): boolean {
    const currentUserId = this.authService.currentUser()?._id;
    const currentEvent = this.event();
    if (!currentUserId || !currentEvent) return false;
    return photo.uploaderId._id === currentUserId || currentEvent.ownerId === currentUserId;
  }

  deletePhoto(photoId: string): void {
    if (!confirm('Delete this photo?')) return;

    this.galleryService.deletePhoto(this.eventId, photoId).subscribe({
      next: () => {
        this.photos.update((current) => current.filter((p) => p._id !== photoId));
      },
      error: () => {
        this.errorMessage.set('Could not delete this photo.');
      },
    });
  }

  inviteFriends(): void {
    this.inviteService.createInvite(this.eventId).subscribe({
      next: (invite) => {
        const link = `${window.location.origin}/join/${invite.inviteCode}`;
        navigator.clipboard.writeText(link);
        alert(`Invite link copied to clipboard:\n${link}`);
      },
      error: () => {
        this.errorMessage.set('Could not generate an invite link.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  openLightbox(photo: Photo): void {
    this.selectedPhoto.set(photo);
  }

  closeLightbox(): void {
    this.selectedPhoto.set(null);
  }
}