# Squeeze - compression console (frontend)

Next.js 14 (App Router) + Tailwind + Redux Toolkit / RTK Query + socket.io-client.
Pairs with the NestJS compression API (expected on http://localhost:3000/v1).

## Run

```bash
cp .env.local.example .env.local
npm install
npm run dev        # http://localhost:3001
```

The API's FRONTEND_URL should point here (http://localhost:3001) so Stripe redirects land back on /billing.

## What's inside

- /login, /register        - email/password auth (JWT stored in localStorage via Redux)
- /dashboard               - drag-drop upload -> presigned PUT (with XHR progress) -> job creation,
                             live job progress over WebSocket, savings bars, usage strip
- /billing                 - plans from the API, Stripe Checkout + customer portal
- /keys                    - API keys (one-time reveal, revoke)

State: Redux Toolkit store with an auth slice + RTK Query API slice (`src/store/api.ts`).
Live updates: socket.io /progress namespace patches the RTK Query jobs cache in place
(`src/components/JobsTable.tsx`), with a 15s polling fallback.
