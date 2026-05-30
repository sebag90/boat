# Boat Organizer

A simple, mobile-friendly tool to manage multiple boats: documents, maintenance
history, to-do lists, shopping lists and a trip log book.

## Stack
- **Backend**: FastAPI (Python, dependencies managed with `uv`)
- **Database**: PostgreSQL
- **Frontend**: React + Vite, served by nginx
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
│   ├── Dockerfile
│   └── app/{main,models,schemas,db,auth}.py
└── frontend/             # React + Vite, served by nginx
    ├── Dockerfile, nginx.conf
    └── src/{pages,components,api.js,format.js,styles.css}
```

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
cd frontend
npm install
npm run dev    # http://localhost:5173, proxies /api to :8000
```
