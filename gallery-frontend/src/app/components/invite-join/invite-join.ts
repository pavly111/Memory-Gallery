// components/invite-join/invite-join.component.ts
// Handles /join/:code. Two distinct paths:
//   - Already logged in  -> join immediately, then go straight to the gallery
//   - Not logged in yet  -> redirect to /auth with a returnUrl query param,
//     so AuthComponent can send them back here automatically after they
//     log in or register. This is the gap flagged since app.routes.ts was
//     first written — this component is what actually closes it.

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InviteService } from '../../services/invite.service';

@Component({
  selector: 'app-invite-join',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invite-join.html',
  styleUrl: './invite-join.css',
})
export class InviteJoinComponent implements OnInit {
  // Signals — same zoneless change detection fix applied throughout this
  // project. Set inside an RxJS subscribe() callback, which plain
  // properties weren't reliably triggering a re-render for.
  isLoading = signal(true);
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private inviteService: InviteService
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (!this.authService.isLoggedIn()) {
      // Not logged in — send them to auth, carrying this exact URL as
      // returnUrl so AuthComponent knows where to send them back to
      // once login/register succeeds.
      this.router.navigate(['/auth'], {
        queryParams: { returnUrl: `/join/${code}` },
      });
      return;
    }

    this.joinEvent(code);
  }

  private joinEvent(code: string): void {
    this.inviteService.joinByCode(code).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        this.router.navigate(['/event', result.eventId]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'This invite link is invalid or has expired.'
        );
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}