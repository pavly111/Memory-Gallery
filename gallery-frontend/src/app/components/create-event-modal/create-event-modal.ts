// components/create-event-modal/create-event-modal.component.ts
// isSubmitting/errorMessage are signals — same zoneless change detection
// fix applied throughout this project.

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-create-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event-modal.html',
  styleUrl: './create-event-modal.css',
})
export class CreateEventModalComponent {
  @Output() eventCreated = new EventEmitter<EventModel>();
  @Output() cancelled = new EventEmitter<void>();

  eventName = '';
  eventDate = '';
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor(private eventService: EventService) {}

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.eventName.trim()) {
      this.errorMessage.set('Please give this event a name.');
      return;
    }

    this.isSubmitting.set(true);

    this.eventService.createEvent(this.eventName, this.eventDate || undefined).subscribe({
      next: (createdEvent) => {
        this.isSubmitting.set(false);
        this.eventCreated.emit(createdEvent);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Could not create the event. Please try again.');
      },
    });
  }
}