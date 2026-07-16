// components/event-card/event-card.component.ts
// Child component — receives one EventModel via @Input, emits two events
// via @Output. Has zero knowledge of routing or delete logic; the parent
// decides what a click or delete request actually means.

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventModel } from '../../models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCardComponent {
  @Input({ required: true }) event!: EventModel;

  // Determines whether the delete button shows at all. This is a UI
  // convenience only — the backend independently enforces owner-only
  // deletion regardless of what this input is set to, so there's no
  // security implication if a parent ever passes this incorrectly, just
  // a confusing UX (a visible button that 403s).
  @Input() isOwner = false;

  @Output() cardClicked = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<string>();

  onCardClick(): void {
    this.cardClicked.emit(this.event._id);
  }

  onDeleteClick(mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation(); // don't also trigger onCardClick
    this.deleteRequested.emit(this.event._id);
  }
}