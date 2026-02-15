# Frontend (React + Vite)

This is the frontend client for LingoBurmese.

- Fetches lessons from backend API (`/api/lessons`).
- Uses lesson metadata (`level`, `unit`, `topic`) for unit navigation.
- Stores progress in browser `localStorage`.
- Mobile-first UI with bottom navigation tabs.

## Local Run

1. `npm install`
2. Set API URL in `.env.local` (optional):
   - `VITE_API_BASE_URL=http://localhost:4000`
3. `npm run dev`

Default local frontend URL: `http://localhost:5173`
