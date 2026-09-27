# Alaik

![CI](https://github.com/atukenov/alaik/actions/workflows/ci.yml/badge.svg)

Wishlist app for events (weddings, birthdays, baby showers, housewarmings). An owner
creates a gift list; guests open a public link and *reserve* gifts to avoid duplicates.
The owner only ever sees how many items are covered — **never who reserved what**, so the
surprise stays intact.

Built as a **responsive web app** (React + Vite + Tailwind) that wraps into **Capacitor**
for the App Store, backed by a **.NET 8-style API** (targets `net10.0` here) with
PostgreSQL.

## Structure

```
alaik/
├── alaik-web/          React + TS + Vite + Tailwind frontend (+ Capacitor iOS project)
├── backend/            .NET solution
│   ├── Alaik.Api/            ASP.NET Core Web API (controllers, auth, DTOs)
│   ├── Alaik.Domain/         Entities + enums
│   └── Alaik.Infrastructure/ EF Core DbContext, migrations, auth services, seeder
├── docker-compose.yml  PostgreSQL 16 (host port 5442)
└── design_handoff_alaik/  Original design references
```

## Run it

**1. Database**

```bash
docker compose up -d
```

**2. API** (auto-applies migrations and seeds demo data on start; runs on `:5050`)

```bash
cd backend
ASPNETCORE_ENVIRONMENT=Development dotnet run --project Alaik.Api --launch-profile http
```

**3. Frontend** (runs on `:5173`)

```bash
cd alaik-web
npm install
npm run dev
```

Open http://localhost:5173.

### Logging in

Auth is **email + password** (no email verification, unique email). Register a new
account in-app, or use the seeded demo account:

- **email:** `ayana@alaik.app`
- **password:** `alaik123`

## Responsive / mobile

The UI is a centered mobile column: full-bleed on phones and inside the Capacitor
WebView, a rounded card centered on desktop. All layout uses relative units and
safe-area insets.

## Capacitor / iOS

The iOS project lives in `alaik-web/ios`. To build for a device / App Store:

```bash
cd alaik-web
# point the build at your hosted API
echo "VITE_API_URL=https://your-api.example.com" > .env.production
npm run build
npx cap sync ios
npx cap open ios          # opens Xcode → set signing team, then Run/Archive
```

The API's CORS policy already allows the Capacitor WebView origins
(`capacitor://localhost`, `http://localhost`).

## Deploy

### API → Railway

The backend is Railway-ready: it binds to `$PORT` and parses Railway's `DATABASE_URL`.

1. Create a Railway project → **New → Deploy from GitHub repo** → select `atukenov/alaik`.
2. In the service **Settings**, set **Root Directory = `backend`**. Railway picks up
   [`backend/railway.toml`](backend/railway.toml) and builds
   [`Alaik.Api/Dockerfile`](backend/Alaik.Api/Dockerfile).
3. Add a **Postgres** plugin (New → Database → PostgreSQL) and attach it to the service —
   this injects `DATABASE_URL` automatically. For a Kazakhstan audience, pick a
   region/provider that keeps data in-country.
4. Add a service variable **`Jwt__Key`** = a strong secret (32+ chars). Optional
   **`Cors__Origins`** = your web origin(s) if you also host the web build.
5. Deploy. Migrations apply automatically on startup. Note the public URL
   (e.g. `https://alaik-api.up.railway.app`).

> Runs anywhere else the same way: build `backend/Alaik.Api/Dockerfile`, then supply
> either `DATABASE_URL` or `ConnectionStrings__Default`, plus `Jwt__Key`. The API refuses
> to start in `Production` if `Jwt__Key` is missing, too short, or the dev placeholder.

### Frontend / iOS → App Store

Point the build at the live API and package with Capacitor:

```bash
cd alaik-web
echo "VITE_API_URL=https://<your-railway-url>" > .env.production
npm run build && npx cap sync ios && npx cap open ios
```

In Xcode: set your signing Team → Archive → upload to App Store Connect. Listing copy and
the review checklist are in [`docs/APP_STORE.md`](docs/APP_STORE.md).

### Before the App Store
- Host [`docs/PRIVACY.md`](docs/PRIVACY.md) at a public URL and enter it in App Store Connect.
- Fill the **App Privacy** labels (guidance in [`docs/APP_STORE.md`](docs/APP_STORE.md)).
- **Account deletion** is built (Profile → «Удалить аккаунт»), satisfying Apple's requirement.
- Optional next step: **push notifications** (APNs) — owner threshold notifications are
  stored server-side and shown in-app today; APNs layers on top of the same records.

## Features of note

- **Email auth** — register/login with email + password, unique emails, JWT + refresh.
- **One reservation per event** — enforced server-side (per user or per anonymous browser key).
- **Owner notifications** — the event owner is notified once each time coverage crosses
  50%, 80% and 100% (in-app bell + unread badge).
- **Product links** — paste a store link to auto-pull photo/title (OpenGraph); guests tap
  through to the store. Marketplaces that block scraping fall back to a manual photo URL.
- **Delete account** — removes the user, their events (cascade) and refresh tokens.
- **Monetization** — three tiers (Free 1/10 · Plus 3/20 · Max unlimited), free-tier ads,
  and affiliate link tagging. Setup (RevenueCat, AdMob, affiliate IDs): [`docs/MONETIZATION.md`](docs/MONETIZATION.md).

## Privacy invariant

The owner endpoints (`/api/events/*`) return only counts and item data — never
`reservedBy`. Guests (`/api/public/*`) see whether an item is taken, never by whom. This
is enforced in the API, not just the UI.
