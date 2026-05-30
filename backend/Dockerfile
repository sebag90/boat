FROM docker.io/library/python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml ./
RUN uv pip install --system --no-cache \
    "fastapi>=0.110" "uvicorn[standard]>=0.29" "sqlalchemy>=2.0" \
    "psycopg[binary]>=3.1" "python-multipart>=0.0.9" "pydantic>=2.6" \
    "passlib>=1.7.4"

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
