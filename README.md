# Outfit Recommendation App

Full-stack mobile-first outfit recommendation app with:

- `frontend/`: React + Vite client with runtime `config.json`
- `backend/`: Fastify API with Drizzle-backed PostgreSQL access
- `db/`: SQL migrations and seed catalog data

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start the backend with a PostgreSQL database configured through `DATABASE_URL`:

```bash
npm run dev:backend
```

3. Start the frontend:

```bash
npm run dev:frontend
```

4. Run tests:

```bash
npm test
npm run test:e2e
```
