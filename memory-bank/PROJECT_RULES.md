# Project Rules

## General

- Keep implementation aligned with existing Next.js and NestJS patterns.
- Prefer small scoped changes over broad refactors.
- Use real backend data instead of hard-coded UI placeholders whenever the API already supports it.
- If frontend stores temporary state, prefer explicit keys in `localStorage` or `sessionStorage`.

## Frontend

- Main app path: `frontend/src/app`.
- Shared components path: `frontend/src/components`.
- API helper: `frontend/src/lib/api.ts`.
- Cart helper: `frontend/src/lib/cart.ts`.
- Use the same header style across main customer-facing pages:
  - fixed top nav
  - `bg-white/70 backdrop-blur-xl`
  - red `Làng Nghề` logo
- Avoid old `Làng Nghề Platform` nav copy on customer-facing pages unless intentionally used.
- Product cards should reuse `ProductCard` where possible.

## Backend

- Main API prefix: `/api/v1`.
- NestJS backend path: `backend/src`.
- Prisma schema path: `backend/prisma/schema.prisma`.
- New DB changes must have migration files under `backend/prisma/migrations`.

## Auth

- Frontend stores:
  - `langnghe_access_token`
  - `langnghe_refresh_token`
- `frontend/src/lib/api.ts` should attach bearer token automatically.
- API helper now attempts refresh on `401` for non-auth endpoints and retries once.

## Checkout And Orders

- `POST /orders` creates the order.
- Backend order DTO accepts string IDs, not strict UUID validation, because seed data may use non-versioned UUID-like strings such as `a0000000-0000-0000-0000-000000000001`.
- Current order service requires all selected items to belong to one artisan.

