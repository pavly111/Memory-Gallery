// services/invite.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invite } from '../models/invite.model';

@Injectable({ providedIn: 'root' })
export class InviteService {
  private eventsUrl = 'http://localhost:5000/api/events';
  private invitesUrl = 'http://localhost:5000/api/invites';

  constructor(private http: HttpClient) {}

  // POST /api/events/:eventId/invite
  createInvite(eventId: string, expiresInDays?: number): Observable<Invite> {
    return this.http.post<Invite>(`${this.eventsUrl}/${eventId}/invite`, {
      expiresInDays,
    });
  }

  // POST /api/invites/:code/join
  joinByCode(code: string): Observable<{ eventId: string; alreadyMember: boolean }> {
    return this.http.post<{ eventId: string; alreadyMember: boolean }>(
      `${this.invitesUrl}/${code}/join`,
      {}
    );
  }
}