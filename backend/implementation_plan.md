# Movie Discovery Platform — Implementation Plan

**Deadline:** 48 hours from 2026-03-07 17:07 IST → **2026-03-09 17:07 IST**

> The platform lets users discover movies/TV shows via TMDB, watch trailers, manage favorites/watch history, and gives admins a full CRUD dashboard — all backed by a Node/Express/MongoDB REST API with JWT auth.

---

## User Review Required

> [!IMPORTANT]
> You will need a **TMDB API Key**. Get one free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api). Provide it before we start the build so it can be placed in `.env`.

> [!IMPORTANT]
> MongoDB connection: We'll use **MongoDB Atlas (cloud)** by default. If you prefer a local MongoDB instance, let me know before the build begins.

> [!WARNING]
> The Admin Panel is a protected route — only users with `role: "admin"` in the DB can access it. The first admin must be seeded manually or set via a DB client (MongoDB Compass / Atlas UI) after registering.

---

## Proposed Changes

### Phase 1 — Backend

---

#### Project Root

##### [NEW] `d:/Movie_Discovery_Platform/backend/package.json`
Express + Mongoose + JWT + bcrypt + cors + dotenv dependencies.

##### [NEW] `d:/Movie_Discovery_Platform/backend/.env`
```
PORT=5000
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<secret key>
TMDB_API_KEY=<your TMDB key>
CLIENT_URL=http://localhost:5173
```

##### [NEW] `d:/Movie_Discovery_Platform/backend/server.js`
Entry point — Express app, CORS config, routes wiring, MongoDB connect.

---

#### Backend Models (`backend/models/`)

| File | Description |
|---|---|
| `User.js` | `name`, `email`, `password` (hashed), `role` (user/admin), `isBanned` |
| `Movie.js` | Admin-managed movie: title, poster, description, movieId, releaseDate, trailerUrl, genre, category |
| `Favorite.js` | `userId`, `movieId` (TMDB or custom), `movieData` (snapshot) |
| `WatchHistory.js` | `userId`, `movieId`, `movieData`, `watchedAt` |

#### Backend Routes (`backend/routes/`)

| File | Endpoints |
|---|---|
| `auth.routes.js` | `POST /api/auth/register`, `/login`, `/logout`, `/me` |
| `movie.routes.js` (admin) | `GET/POST /api/movies`, `PUT/DELETE /api/movies/:id` |
| `favorite.routes.js` | `GET/POST/DELETE /api/favorites` |
| `watchHistory.routes.js` | `GET/POST /api/history`, `DELETE /api/history/:id` |
| `user.routes.js` (admin) | `GET /api/users`, `PATCH /api/users/:id/ban`, `DELETE /api/users/:id` |

#### Backend Middleware (`backend/middleware/`)

| File | Purpose |
|---|---|
| `auth.middleware.js` | Verify JWT, attach `req.user` |
| `admin.middleware.js` | Check `req.user.role === 'admin'` |
| `error.middleware.js` | Global error handler |

---

### Phase 2 — Frontend

---

#### Project Root

##### [NEW] `d:/Movie_Discovery_Platform/frontend/` (Vite + React scaffold)
Bootstrapped with `npm create vite@latest . -- --template react`.

##### [NEW] `d:/Movie_Discovery_Platform/frontend/.env`
```
VITE_TMDB_API_KEY=<your key>
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_BACKEND_URL=http://localhost:5000
```

---

#### Frontend Source Structure

```
frontend/src/
├── api/
│   ├── tmdb.js          # Axios instance for TMDB
│   └── backend.js       # Axios instance for our backend (with JWT interceptor)
├── store/
│   ├── index.js         # Redux store
│   └── slices/
│       ├── authSlice.js
│       ├── movieSlice.js
│       ├── favoritesSlice.js
│       ├── watchHistorySlice.js
│       └── uiSlice.js   # theme, loaders, modals
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── MovieCard.jsx
│   ├── SkeletonCard.jsx
│   ├── TrailerModal.jsx
│   ├── InfiniteScrollList.jsx
│   ├── SearchBar.jsx
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
├── pages/
│   ├── Home.jsx
│   ├── Search.jsx
│   ├── MovieDetail.jsx
│   ├── TVShowDetail.jsx
│   ├── PeoplePage.jsx
│   ├── Favorites.jsx
│   ├── WatchHistory.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── ManageMovies.jsx
│       └── ManageUsers.jsx
├── hooks/
│   ├── useDebounce.js
│   └── useInfiniteScroll.js
├── App.jsx              # Route definitions
├── main.jsx
└── index.css            # Global styles, CSS vars, dark/light theme
```

---

#### Key Pages & Feature Breakdown

| Page / Component | TMDB Integration | Backend Integration |
|---|---|---|
| **Home** | Trending, Popular, Now Playing, Top Rated (movies + TV) | — |
| **Search** | Multi-search with debounce (300ms) | — |
| **Movie Detail** | Movie info, cast, trailers (YouTube) | POST watch history, GET/POST/DELETE favorites |
| **TV Detail** | Show info, seasons, trailer | POST watch history |
| **People** | Actor info, movie credits | — |
| **Favorites** | Snapshot stored | GET favorites from backend |
| **Watch History** | — | GET history from backend |
| **Admin — Movies** | — | Full CRUD on `/api/movies` |
| **Admin — Users** | — | List, ban, delete users |

---

#### Infinite Scroll
Custom `useInfiniteScroll` hook using `IntersectionObserver`. Triggers next TMDB page fetch when sentinel element enters viewport. Applied on: Home sections, Search results.

#### Trailer Modal
- Fetch video data from `GET /movie/{id}/videos` TMDB endpoint.
- Filter for `type === "Trailer"` and `site === "YouTube"`.
- Embed `https://www.youtube.com/embed/{key}` in an `<iframe>` inside a modal overlay.
- Fallback message: *"Trailer for this movie is currently unavailable."*

#### Skeleton UI
`SkeletonCard` component: grey animated pulse placeholder matching MovieCard dimensions. Shown whenever `isLoading === true` in any slice.

#### Error Handling
- Missing poster → `/assets/placeholder.png`
- Missing description → `"Description not available"`
- Missing trailer → show fallback text, no crash (wrapped in try/catch + conditional render)

#### Dark / Light Mode (Bonus)
CSS custom properties (`--bg`, `--text`, `--card-bg`, etc.) toggled via `data-theme` attribute on `<html>`. Persisted to `localStorage`.

---

### Phase 3 — Responsive Design

All components use CSS Grid / Flexbox with breakpoints:
- `< 600px` → mobile (single column)
- `600–1024px` → tablet (2-column grid)
- `> 1024px` → desktop (4–5 column grid)

---

## Verification Plan

### Automated / Dev-Server Tests

1. **Backend health check**
   ```bash
   cd d:/Movie_Discovery_Platform/backend
   node server.js
   # Expect: "Server running on port 5000" + "MongoDB connected"
   ```

2. **Frontend dev server**
   ```bash
   cd d:/Movie_Discovery_Platform/frontend
   npm run dev
   # Expect: Vite server at http://localhost:5173
   ```

3. **Auth endpoints** (via browser or Postman):
   - `POST /api/auth/register` → 201 + token
   - `POST /api/auth/login` → 200 + token
   - `GET /api/auth/me` with Bearer token → 200 + user object

4. **Favorites endpoints:**
   - `POST /api/favorites` → 201
   - `GET /api/favorites` → 200 + array
   - `DELETE /api/favorites/:movieId` → 200

5. **Watch history:**
   - `POST /api/history` → 201
   - `GET /api/history` → 200 + array

### Browser Verification (done via browser subagent after build)

| Test | Expected |
|---|---|
| Open Home page | Trending + Popular sections render with real TMDB data |
| Type in Search bar | Results appear after 300ms debounce |
| Click Movie → Trailer button | YouTube embed appears in modal |
| Add movie to Favorites (logged in) | Card shows filled heart; appears on /favorites |
| Open movie detail | Movie added to /watch-history |
| Log out and try /favorites | Redirect to /login |
| Log in as admin → /admin | Admin dashboard renders; add/edit/delete works |
| Resize to 375px width | Layout reflows, no overflow |

### Manual Verification (user)
1. Register a new account and verify you receive a JWT back.
2. Go to Favorites, add 2–3 movies, refresh the page — they should persist.
3. Watch a trailer — verify the movie appears in Watch History.
4. In MongoDB Atlas UI, elevate your user's `role` to `"admin"`, log back in, and visit `/admin` — verify the dashboard is accessible.
