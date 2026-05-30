import base64
import os

from fastapi import HTTPException, Request, status
from passlib.apache import HtpasswdFile

HTPASSWD_FILE = os.getenv("HTPASSWD_FILE", "htpasswd")


def _load() -> HtpasswdFile | None:
    if not os.path.exists(HTPASSWD_FILE):
        return None
    # Reload on every request so newly added users work without a restart.
    return HtpasswdFile(HTPASSWD_FILE)


def _verify(token: str) -> str | None:
    """token is base64("username:password"); returns username if valid."""
    try:
        decoded = base64.b64decode(token).decode("utf-8")
    except Exception:
        return None
    username, sep, password = decoded.partition(":")
    if not sep:
        return None
    ht = _load()
    if ht is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication is not configured (htpasswd file missing).",
        )
    if ht.check_password(username, password):
        return username
    return None


def require_auth(request: Request) -> str:
    """Authenticate via the Authorization: Basic header, or an `auth` query
    parameter (base64 user:pass). The query param lets plain file links (e.g.
    PDFs opened in a new tab on mobile) carry credentials."""
    token: str | None = None
    authz = request.headers.get("Authorization", "")
    if authz.lower().startswith("basic "):
        token = authz.split(" ", 1)[1]
    if not token:
        token = request.query_params.get("auth")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Basic"},
        )

    username = _verify(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return username
