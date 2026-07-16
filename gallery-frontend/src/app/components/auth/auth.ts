// components/auth/auth.component.ts
// Combined login/register screen, matching the mockup's single toggle
// pill rather than two separate pages.
//
// errorMessage and isLoading are SIGNALS, not plain properties — this
// project appears to run zoneless change detection (or something similar
// suppressing automatic view updates from RxJS subscribe callbacks), which
// meant plain property assignments inside .subscribe() weren't reliably
// triggering a re-render. Signals sidestep that entirely, regardless of
// zoneless/zone-based mode.

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent implements OnInit {
  mode: AuthMode = 'login';

  name = '';
  email = '';
  password = '';
  showPassword = false;

  isLoading = signal(false);
  errorMessage = signal('');

  private returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const returnUrlParam = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrlParam) {
      this.returnUrl = returnUrlParam;
    }
  }

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.errorMessage.set('');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.email || !this.password || (this.mode === 'register' && !this.name)) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    this.isLoading.set(true);

    const request$ =
      this.mode === 'login'
        ? this.authService.login(this.email, this.password)
        : this.authService.register(this.name, this.email, this.password);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Something went wrong. Please try again.'
        );
      },
    });
  }
}