import os

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from passlib.apache import HtpasswdFile

HTPASSWD_FILE = os.getenv("HTPASSWD_FILE", "htpasswd")

security = HTTPBasic()


def _load() -> HtpasswdFile | None:
    if not os.path.exists(HTPASSWD_FILE):
        return None
    # Reload on every request so newly added users work without a restart.
    return HtpasswdFile(HTPASSWD_FILE)


def require_auth(
    credentials: HTTPBasicCredentials = Depends(security),
) -> str:
    ht = _load()
    if ht is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication is not configured (htpasswd file missing).",
        )
    if not ht.check_password(credentials.username, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username
