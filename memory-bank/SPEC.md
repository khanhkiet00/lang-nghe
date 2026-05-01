# Làng Nghề Platform - SPEC

## Product Scope

Làng Nghề is a marketplace for Vietnamese craft products. The current frontend is a Next.js app under `frontend/`, backed by a NestJS API under `backend/`.

Core user flows currently implemented or being completed:

- Browse public products from real backend data on the home page.
- View product detail pages at `/san-pham/[slug]`.
- Add products to cart and manage cart items at `/gio-hang`.
- Select a subset of cart items for checkout.
- Checkout selected items at `/thanh-toan`.
- Save and reuse multiple shipping addresses per user.
- View/edit personal profile at `/ho-so`.
- View public user profiles at `/ho-so/[slug]`.
- Link from product detail artisan blocks to the public profile when possible.
- Artisan dashboard/product/order management pages exist under `/nghe-nhan`.

## Checkout Requirements

Checkout is a logged-in buyer flow.

Input:

- Selected cart items from `langnghe_checkout_item_ids` in `sessionStorage`.
- Cart item data from `langnghe_cart_items` in `localStorage`.
- User token from `langnghe_access_token`.

Behavior:

- Redirect unauthenticated users to `/auth?mode=login`.
- Load saved shipping addresses from `GET /api/v1/shipping-addresses`.
- Allow adding and editing shipping addresses in a modal.
- Let user select one shipping address for the order.
- Support payment method values accepted by backend:
  - `cod`
  - `bank_transfer`
- Submit order to `POST /api/v1/orders`.
- On successful order, remove ordered products from the local cart.

Constraints:

- Current backend only supports one artisan per order. Checkout blocks mixed-artisan selected carts.
- Shipping fee is still simple logic: free for subtotal >= 500,000 VND, otherwise 30,000 VND.
- Payment integration is not implemented; order is created with pending payment status.

## Shipping Address Requirements

A user can have multiple saved shipping addresses.

Saved address fields:

- `label`
- `name`
- `phone`
- `address`
- `ward`
- `district`
- `province`
- `isDefault`

Frontend address modal uses Vietnam administrative filters:

- Province / city
- District
- Ward

Data source:

- `https://provinces.open-api.vn/api/v1`

Fallback:

- If the external address API fails, the modal falls back to manual input.

## Cart Requirements

Cart is localStorage-backed.

Cart supports:

- Add item from product detail page.
- Quantity adjustment.
- Remove item with confirmation modal.
- Select individual items for checkout.
- Select all items.
- Summary only counts selected items.

## Product Detail Requirements

Product detail page should align visually with home page.

Current expectations:

- Header/nav matches home page: fixed translucent nav with red `Làng Nghề` logo.
- Artisan card is data-driven, not hard-coded.
- Artisan links prefer `/ho-so/[profileSlug]`, falling back to `/nghe-nhan/[artisanSlug]`.
- Recommendations use `ProductCard` for consistency with home page.

