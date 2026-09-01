# Boat Organizer

A simple, mobile-friendly tool to manage multiple boats: documents, maintenance
history, to-do lists, shopping lists and a trip log book.

## Stack
- **Backend**: FastAPI (Python, dependencies managed with `uv`)
- **Database**: PostgreSQL
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query
  (Leaflet maps, `marked` Markdown), served by Caddy
- **Runtime**: Podman containers on a shared network

## Features
- Manage multiple boats from a single homepage
- **Documents**: structured entries with a **title**, **description** and an
  optional file (manuals/certificates in common formats), plus a
  **case-insensitive search** over title/description/filename
- **Maintenance history**: each entry has a **title**, **date**, **description**
  and an optional **receipt**; entries are shown as *date — title*, newest first
- **To-Do list** per boat
- **Shopping list** per boat: each item has a **name**, **description** and an
  optional **link**
- **Log book** per boat: **date**, **crew**, **start**, **goal** and a
  **description** of each trip
- Click any entry to open a **read-only popup** (descriptions rendered as
  **Markdown**); press **Modify** to edit it
- Dates shown in European `DD-MM-YYYY HH:MM` format
- **Responsive** layout usable on a smartphone
- **Multi-user authentication** via an `htpasswd` file (HTTP Basic)

## Users & authentication

Auth is backed by a standard Apache `htpasswd` file at `auth/htpasswd`
(mounted read-only into the backend; `apr1`/MD5 hashes).

- `just backend` creates a default **admin / admin** user if no file exists yet.
- Add or change a user: `just adduser <username> <password>`
  (restart the backend afterwards with `just backend`).

The frontend shows a sign-in screen and stores the session in the browser;
"Sign out" clears it. Every `/api/...` request is authenticated.

## Project structure

```
boat/
├── justfile              # dev commands: db / backend / frontend / adduser / down
├── auth/htpasswd         # user credentials (git-ignored, auto-created)
├── backend/              # FastAPI + SQLAlchemy (uv-managed)
│   ├── Containerfile
│   └── app/{main,models,schemas,db,auth}.py
└── frontend/             # React 19 + TS + Vite + Tailwind v4, served by Caddy
    ├── Containerfile, Caddyfile
    ├── smoke/           # headless jsdom smoke test (`just frontend-test`)
    └── src/
        ├── api/         # TanStack Query hooks per resource
        ├── components/  # ui/, layout/, entries/, detail/, dropzone/,
        │                # attachments/, logbook/, documents/, maintenance/,
        │                # todos/, shopping/, settings/, fleet/
        ├── hooks/       # session, selected boat, GPS auto-tracker
        ├── i18n/        # en + it dictionaries, provider
        ├── lib/         # api client, auth, format, nautical math, geojson
        ├── pages/       # LoginPage, WorkspacePage, TabContent
        └── styles/      # Tailwind theme (maritime light)
```

### Frontend notes
- **Deepwater Navigation theme**: fixed deep-navy sidebar (desktop) with a light
  ocean-blue active pill, translucent seafoam top bar, white 12px cards lifted by
  soft ambient shadows on a `#f6fafe` ground, ocean-blue (`#006399`) primary
  buttons, safety orange (`#f74b00`) for alerts, Montserrat headlines + Inter UI
  (`label-mono` = 12px uppercase technical labels, `text-headline-*` scale) — all
  Tailwind v4 theme tokens in `src/styles/index.css` (see `DESIGN.md` and
  `stitch_maritime_fleet_manager/` reference screens).
- **i18n**: English/Italian toggle on the login screen and in the header,
  persisted in `localStorage` (`app_locale`).
- **Logbook**: GPS waypoint capture, interval auto-tracker (with screen wake
  lock), JSONL/CSV/TSV track import, Haversine distance/speed maths, Leaflet
  route map and a geojson.io deep link.
- **Backend host override**: configurable on the login screen (`api_host`),
  empty means same-origin requests.

## Development

Deploy each component individually with `just`:

```sh
just db                      # start postgres
just backend                 # build & run the FastAPI backend
just frontend                # build & run the frontend
just adduser <user> <pass>   # add/update a login
just down                    # tear everything down
```

Then open <http://localhost:8080> (default login: `admin` / `admin`).

- Frontend: http://localhost:8080
- Backend API + docs: http://localhost:8000/docs
- Postgres: localhost:5432 (user/pass/db: `boat`)

> Note: the schema is created automatically on startup (`create_all`, no
> migrations). After model changes during development, recreate the DB volume:
> `just down && podman volume rm boat-db-data`.

### Running the backend locally (without a container)

```sh
cd backend
uv sync
HTPASSWD_FILE=../auth/htpasswd uv run uvicorn app.main:app --reload
```

### Running the frontend locally

```sh
just frontend-dev     # http://localhost:5173, proxies /api to :8000
just frontend-build   # typecheck + production build
just frontend-test    # headless smoke test of the whole UI
```
