// models/user.model.ts
// Matches the backend's User model (passwordHash is never sent to the
// frontend — it's stripped server-side via the toJSON transform).

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string; // ISO date string — JSON has no native Date type
}