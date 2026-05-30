# Boat Organizer — development deployment with Podman
# Run `just db`, `just backend`, then `just frontend`.

set shell := ["bash", "-uc"]

network := "boat-net"
pg_user := "boat"
pg_pass := "boat"
pg_db := "boat"

# Ensure the shared podman network exists
_net:
    podman network exists {{network}} || podman network create {{network}}

# Deploy a postgres instance
db: _net
    -podman rm -f boat-db
    podman volume inspect boat-db-data >/dev/null 2>&1 || podman volume create boat-db-data
    podman run -d --name boat-db --network {{network}} \
        -e POSTGRES_USER={{pg_user}} \
        -e POSTGRES_PASSWORD={{pg_pass}} \
        -e POSTGRES_DB={{pg_db}} \
        -p 5432:5432 \
        -v boat-db-data:/var/lib/postgresql/data \
        docker.io/library/postgres:16
    @echo "Postgres running on localhost:5432"

# Build and deploy the backend container
backend: _net _htpasswd
    podman build -t boat-backend ./backend
    -podman rm -f boat-backend
    podman run -d --name boat-backend --network {{network}} \
        -e DATABASE_URL="postgresql+psycopg://{{pg_user}}:{{pg_pass}}@boat-db:5432/{{pg_db}}" \
        -e HTPASSWD_FILE=/app/auth/htpasswd \
        -v ./auth/htpasswd:/app/auth/htpasswd:ro,Z \
        -p 8000:8000 \
        boat-backend
    @echo "Backend running on http://localhost:8000"

# Create a default admin user (admin/admin) if no htpasswd file exists yet
_htpasswd:
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p auth
    if [ ! -s auth/htpasswd ]; then
        echo "admin:$(openssl passwd -apr1 admin)" > auth/htpasswd
        echo "Created default user -> admin / admin (change it with 'just adduser')"
    fi

# Add or update a user: just adduser alice s3cret
adduser user password:
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p auth
    touch auth/htpasswd
    # remove existing entry for this user, then append the new one
    grep -v "^{{user}}:" auth/htpasswd > auth/htpasswd.tmp || true
    echo "{{user}}:$(openssl passwd -apr1 '{{password}}')" >> auth/htpasswd.tmp
    mv auth/htpasswd.tmp auth/htpasswd
    echo "User '{{user}}' saved. Restart the backend if it is running ('just backend')."

# Build and deploy the frontend container
frontend: _net
    podman build -t boat-frontend ./frontend
    -podman rm -f boat-frontend
    podman run -d --name boat-frontend --network {{network}} \
        -p 8080:80 \
        boat-frontend
    @echo "Frontend running on http://localhost:8080"

# Stop and remove all containers
down:
    -podman rm -f boat-frontend boat-backend boat-db
