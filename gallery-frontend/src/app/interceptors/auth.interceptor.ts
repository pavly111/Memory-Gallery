// interceptors/auth.interceptor.ts
// Attaches "Authorization: Bearer <token>" to every outgoing request
// automatically, so no component or service ever has to think about it
// manually. This is a FUNCTIONAL interceptor (Angular 15+ style) — the
// modern replacement for the old class-based HttpInterceptor.

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Only attach the token to requests going to OUR backend — never to
  // third-party APIs (e.g. Cloudinary's direct upload endpoint). Adjust
  // this base URL if your backend runs somewhere other than localhost:5000.
  const isOwnBackend = req.url.startsWith('http://localhost:5000');
  const isAuthEndpoint = req.url.includes('/api/auth/');

  if (!token || !isOwnBackend || isAuthEndpoint) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};