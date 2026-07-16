// models/auth-response.model.ts
// The exact shape returned by both POST /api/auth/register and
// POST /api/auth/login — needed by AuthService in the next step.

import { User } from './user.model';

export interface AuthResponse {
  token: string;
  user: User;
}