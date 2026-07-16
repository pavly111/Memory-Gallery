// guards/auth.guard.ts
// Functional route guard (Angular 15+ style, matches the functional
// interceptor pattern used in auth.interceptor.ts). Blocks access to any
// route it's attached to if the user isn't logged in, redirecting to the
// auth screen instead.

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Not logged in — redirect to auth instead of allowing the navigation.
  router.navigate(['/auth']);
  return false;
};