# Active Context

## Current Focus

The latest work focused on completing the buyer checkout flow:

- selected cart items
- checkout page
- saved shipping addresses
- Vietnam address filters
- order creation
- auth refresh for protected checkout APIs

## Important Files

Frontend:

- `frontend/src/app/gio-hang/page.tsx`
- `frontend/src/app/thanh-toan/page.tsx`
- `frontend/src/app/san-pham/[slug]/page.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/cart.ts`
- `frontend/src/components/AddToCartPanel.tsx`
- `frontend/src/components/ui/ConfirmModal.tsx`

Backend:

- `backend/src/orders/dto/create-order.dto.ts`
- `backend/src/orders/orders.service.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/shipping-addresses/*`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260501062000_add_shipping_addresses/migration.sql`

## Current Runtime Notes

- Frontend usually runs on `http://localhost:3000`.
- Backend should run on `http://localhost:3001/api/v1`.
- If port 3000 is occupied, Next may move to 3001 and conflict with backend. Keep frontend on 3000 and backend on 3001.
- Some previous issues were caused by stale access tokens; after auth changes, log in again.

## Recent Bug Context

- Address save failed with `401 Unauthorized` because access token expired and refresh token was not stored after login.
- Order creation failed with `400 Bad Request` because backend DTO required strict UUID, while seeded artisan ID was a non-versioned UUID-like string.

Both were addressed in code.

