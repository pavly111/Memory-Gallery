// components/dashboard/dashboard.component.ts
// Parent component — fetches the event list, renders one EventCardComponent
// per event via *ngFor, and handles the events those children emit.
//
// events/isLoading/errorMessage are SIGNALS — plain properties set inside
// RxJS .subscribe() callbacks weren't reliably triggering a re-render
// under this project's zoneless change detection. Same root cause and
// fix as AuthComponent.

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EventCardComponent } from '../event-card/event-card';
import { CreateEventModalComponent } from '../create-event-modal/create-event-modal';
import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EventCardComponent, CreateEventModalComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  events = signal<EventModel[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  showCreateModal = false;

  constructor(
    private eventService: EventService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.isLoading.set(true);
    this.eventService.getMyEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.errorMessage.set('Could not load your events. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  trackByEventId(index: number, event: EventModel): string {
    return event._id;
  }

  isEventOwner(event: EventModel): boolean {
    return event.ownerId === this.authService.currentUser()?._id;
  }

  goToEventGallery(eventId: string): void {
    this.router.navigate(['/event', eventId]);
  }

  confirmAndDeleteEvent(eventId: string): void {
    if (!confirm('Delete this event? This also deletes all its photos permanently.')) {
      return;
    }

    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.events.update((current) => current.filter((e) => e._id !== eventId));
      },
      error: (err) => {
        // Most likely cause: the current user isn't the owner — the
        // backend enforces owner-only deletion regardless of whether the
        // delete button was visible to them.
        this.errorMessage.set(
          err?.error?.message || 'Could not delete this event.'
        );
      },
    });
  }

  openCreateEventModal(): void {
    this.showCreateModal = true;
  }

  onEventCreated(newEvent: EventModel): void {
    this.events.update((current) => [newEvent, ...current]); // newest first
    this.showCreateModal = false;
  }

  onModalCancelled(): void {
    this.showCreateModal = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}