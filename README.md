# Alaik

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

## Production

**API** — build the container from the `backend/` directory and provide secrets via env:

```bash
cd backend
docker build -f Alaik.Api/Dockerfile -t alaik-api .
docker run -p 8080:8080 \
  -e ConnectionStrings__Default="Host=<db>;Port=5432;Database=alaik;Username=<u>;Password=<p>" \
  -e Jwt__Key="<a strong secret, at least 32 characters>" \
  alaik-api
```

The API refuses to start in `Production` if `Jwt__Key` is missing, too short, or the
checked-in dev placeholder. Migrations apply automatically on startup.

**Frontend / iOS** — point the build at the hosted API and package with Capacitor:

```bash
cd alaik-web
echo "VITE_API_URL=https://your-api.example.com" > .env.production
npm run build && npx cap sync ios && npx cap open ios
```

### Before the App Store
- Personal data (email) → add a **privacy policy** and Apple **App Privacy** labels.
- **Account deletion** is built (Profile → «Удалить аккаунт»), satisfying Apple's requirement.
- Add **push notifications** (APNs) — the owner threshold notifications are stored server-side
  and shown in-app today; wiring APNs on top is the natural next step.
- KZ data-localization: store user data on servers located in Kazakhstan.

## Features of note

- **Email auth** — register/login with email + password, unique emails, JWT + refresh.
- **One reservation per event** — enforced server-side (per user or per anonymous browser key).
- **Owner notifications** — the event owner is notified once each time coverage crosses
  50%, 80% and 100% (in-app bell + unread badge).
- **Product links** — paste a store link to auto-pull photo/title (OpenGraph); guests tap
  through to the store. Marketplaces that block scraping fall back to a manual photo URL.
- **Delete account** — removes the user, their events (cascade) and refresh tokens.

## Privacy invariant

The owner endpoints (`/api/events/*`) return only counts and item data — never
`reservedBy`. Guests (`/api/public/*`) see whether an item is taken, never by whom. This
is enforced in the API, not just the UI.
