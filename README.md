# Krishna Residency Management System

Society operations for **Krishna Residency**: 44 galas, monthly maintenance ₹400 (common boring motor + street lights). Admin **Create Account** is on `/login`. Modules: Dashboard, Collection, Expense, Vehicle, Notice, Emergency numbers, Event.

Stack: Next.js App Router, TypeScript, MongoDB + Mongoose, Tailwind CSS, JWT httpOnly cookies, Vercel Blob, PWA.

## Setup

1. Copy env:

```bash
cp .env.example .env.local
```

2. Fill values:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string for admin sessions |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (expense bills). Optional until you upload files |
| `ADMIN_EMAIL` | First admin email (default `admin@krishnaresidency.local`) |
| `ADMIN_MOBILE` | First admin mobile |
| `ADMIN_PASSWORD` | First admin password |
| `ADMIN_NAME` | Display name |
| `ALLOW_SEED` | Set `true` to allow `POST /api/seed` in production |

3. Install and run:

```bash
npm install
npm run seed
npm run dev
```

Open http://localhost:3000 — unauthenticated users go to `/login`.

Seed also via `POST /api/seed` (creates admin if missing, 44 flats if empty, default expense categories). Existing records are not overwritten.

## Deploy (Vercel)

- Import the repo and set the same env vars.
- Add `BLOB_READ_WRITE_TOKEN` from the Vercel Blob store.
- After first deploy, run seed locally against Atlas **or** call `/api/seed` once with `ALLOW_SEED=true`.

## Modules

Dashboard (fund + Krishna Residency Common + monthly split), Flats, Collections, Expenses, Vehicles, Notices, Important Numbers, Notifications, More.

Login: email **or** mobile + password. Admin-only. All mutating APIs use `requireAdmin`.
