# Memory Gallery 📸

A full-stack photo-sharing platform for creating shared memory events, uploading photos, and inviting friends to join private event galleries.

**🔗 Live site:** [https://memory-gallery-q9y3.onrender.com](https://memory-gallery-q9y3.onrender.com)

> Built during my NTI (National Telecommunication Institute) training program, summer 2026.

---

## ✨ Features

- 🔐 Secure user registration and login with JWT authentication
- 🎉 Create events and automatically join as the owner
- 📤 Upload photos to a per-event gallery (Cloudinary-backed)
- 🖼️ View and delete photos with permission checks
- 🔗 Generate invite codes and join events through shareable links
- 👥 Owner/member role distinction and access control
- 📱 Installable as a Progressive Web App (PWA), with offline support and automatic update checks
- 🎨 Custom darkroom / archive-room visual theme

---

## 🛠️ Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT-based authentication
- bcrypt for password hashing
- Cloudinary for image hosting and cleanup

**Frontend**
- Angular (standalone components, signals, zoneless change detection)
- TypeScript
- Angular Router, HttpClient, RxJS
- Angular Service Worker (PWA)

**Deployment**
- Render (single web service — Express serves the built Angular app)
- MongoDB Atlas

---

## 📁 Project Structure

```text
Memory-Gallery/
├── gallery-backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── public/          # Angular production build output (generated, gitignored)
│   ├── index.js
│   └── package.json
│
└── gallery-frontend/
    ├── public/
    │   └── icons/
    ├── src/
    │   └── app/
    │       ├── components/
    │       ├── guards/
    │       ├── interceptors/
    │       ├── models/
    │       └── services/
    └── package.json
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js
- A MongoDB connection string (local or MongoDB Atlas)
- A Cloudinary account (cloud name, API key, API secret)

### 1. Clone the repo

```bash
git clone https://github.com/pavly111/Memory-Gallery.git
cd Memory-Gallery
```

### 2. Set up environment variables

Create a `.env` file inside `gallery-backend/`:

```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
DB_NAME=memory-gallery
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Install dependencies and run

**Backend:**

```bash
cd gallery-backend
npm install
npm run dev
```

Runs on `http://localhost:5000`.

**Frontend (separate terminal, for local development):**

```bash
cd gallery-frontend
npm install
npm start
```

Runs on `http://localhost:4200`.

### 4. Production build (single service)

To build the Angular app and serve it directly from Express (as done in production on Render):

```bash
cd gallery-backend
npm run build
npm start
```

Then open `http://localhost:5000`.

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/events` | List events for the current user |
| POST | `/api/events` | Create a new event |
| GET | `/api/events/:eventId` | Fetch a single event |
| DELETE | `/api/events/:eventId` | Delete an event (owner only) |
| GET | `/api/events/:eventId/photos` | List photos in an event |
| POST | `/api/events/:eventId/photos` | Upload a photo |
| DELETE | `/api/events/:eventId/photos/:photoId` | Delete a photo |
| POST | `/api/events/:eventId/invite` | Generate an invite code |
| POST | `/api/invites/:code/join` | Join an event via invite code |
| GET | `/api/health` | Health check |

---

## 📄 License

ISC

---

## 🙏 Acknowledgments

Built as part of my NTI training program — my first deep dive into Angular and full-stack deployment, from data modeling all the way to a live, installable production app.
