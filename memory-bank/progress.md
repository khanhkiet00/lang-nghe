# Progress

## Completed

- Home page reads backend products and renders product cards/trending products.
- Product detail page exists at `/san-pham/[slug]`.
- Product detail nav/header aligned with home page.
- Product detail artisan card is data-driven and links to public profile when possible.
- Product detail recommendations use `ProductCard` styling.
- Cart page exists at `/gio-hang`.
- Cart header aligned with home page.
- Cart supports selecting individual products.
- Cart supports select all.
- Cart summary only counts selected products.
- Cart remove button uses confirmation modal before deleting an item.
- Checkout page created at `/thanh-toan`.
- Checkout reads selected cart items from sessionStorage/localStorage.
- Checkout displays selected items and order summary.
- Checkout supports COD and bank transfer values.
- Checkout allows buyer note.
- Checkout submits to backend `POST /orders`.
- Shipping address backend model and migration added.
- Shipping address API added:
  - `GET /shipping-addresses`
  - `POST /shipping-addresses`
  - `PATCH /shipping-addresses/:id`
  - `DELETE /shipping-addresses/:id`
- Checkout address modal supports add/edit saved addresses.
- Address modal supports Vietnam province/district/ward cascading filters.
- Frontend API helper refreshes tokens on 401.
- Backend login returns `refreshToken` in JSON for localStorage-based frontend refresh flow.
- Backend order DTO relaxed ID validation from UUID to non-empty string.
- Prisma migration `20260501062000_add_shipping_addresses` created and applied.
- Prisma client generated after adding `ShippingAddress`.

## Verified

- `frontend`: `npx.cmd tsc --noEmit` passes.
- `backend`: `npx.cmd tsc --noEmit` passes.
- `backend`: `npx.cmd prisma validate` passed after adding `ShippingAddress`.
- `backend`: `npx.cmd prisma migrate deploy` successfully applied shipping address migration.

## Known Manual Steps

- Restart backend after backend changes.
- Log in again after auth changes so `langnghe_refresh_token` is stored.
- If cart/order data predates the latest cart flow, clear cart and add products again from product detail pages.

## Remaining Work

- Build a real order success/history link after checkout instead of only showing success state.
- Add delete address confirmation UI if needed.
- Add address search/autocomplete polish.
- Implement actual payment integration for bank transfer/QR if required.
- Support multi-artisan checkout by splitting into multiple orders.
- Add more robust e2e tests for cart -> checkout -> order creation.

