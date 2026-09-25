// services/event.service.ts
// Wraps the three /api/events endpoints. Auth is handled automatically —
// this service never touches tokens directly, since authInterceptor
// attaches the Authorization header to every outgoing request already.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventModel } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private baseUrl = '/api/events';

  constructor(private http: HttpClient) {}

  // GET /api/events — every event the logged-in user belongs to
  getMyEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(this.baseUrl);
  }

  // GET /api/events/:eventId — single event, membership-gated server-side
  getEventById(eventId: string): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.baseUrl}/${eventId}`);
  }

  // POST /api/events — creates the event AND auto-joins the creator as owner
  // (that auto-join happens entirely server-side, nothing to do here)
  createEvent(name: string, date?: string, coverUrl?: string): Observable<EventModel> {
    return this.http.post<EventModel>(this.baseUrl, { name, date, coverUrl });
  }

  // DELETE /api/events/:eventId — owner only; backend enforces this
  // regardless of what the UI shows/hides, same pattern as photo deletion.
  deleteEvent(eventId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${eventId}`);
  }
}