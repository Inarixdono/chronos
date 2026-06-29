# Chronos Frontend

Admin UI for the Chronos print backend.

## Setup

```bash
npm install
npm run dev
```

## Env vars

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL |

## Requirements

The [Phase 2 backend](../backend) must be running at `localhost:8000` before starting the dev server.

The dev server proxies `/api` and `/ws` requests to the backend, so there are no CORS issues during development.
