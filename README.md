# -digital-marketing-dashboard

## Quick start
```bash
cp .env.example .env
# set VITE_API_BASE_URL to your Django base (e.g., http://localhost:8000)
corepack enable
pnpm i || yarn || npm i
pnpm dev || yarn dev || npm run dev
```

### Expected backend endpoints
- `GET /api/events/` → list of Event
- `GET /api/events/stats/` → aggregate stats

Adjust `src/services/eventApi.ts` if your URLs differ.