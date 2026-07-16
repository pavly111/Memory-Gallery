// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AuthComponent } from './components/auth/auth';
import { EventGalleryComponent } from './components/event-gallery/event-gallery';
import { InviteJoinComponent } from './components/invite-join/invite-join';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'event/:id',
    component: EventGalleryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'join/:code',
    component: InviteJoinComponent,
    // Deliberately NOT behind authGuard — a logged-out user needs to be
    // ABLE to land here first. InviteJoinComponent itself checks login
    // status and redirects to /auth with a returnUrl if needed.
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];