# Decisions

## 2026-05-01

### Public Profile Links From Product Detail

Product detail artisan links now prefer public user profile routes:

- preferred: `/ho-so/[profile.slug]`
- fallback: `/nghe-nhan/[artisanProfile.slug]`

Reason: the user wants clicking artisan/profile areas from product detail to show the public profile data for that person.

### Cart Item Selection

Cart checkout is based on selected items, not all items.

Reason: buyers may keep products in the cart but only purchase a subset.

Implementation:

- Selection state stays in the cart page.
- Selected item IDs are written to `sessionStorage` key `langnghe_checkout_item_ids` before routing to `/thanh-toan`.

### Shipping Addresses

Shipping addresses are persisted in the backend instead of only localStorage.

Reason: a logged-in user should be able to reuse multiple receiving addresses.

Implementation:

- Prisma model: `ShippingAddress`
- API: `/api/v1/shipping-addresses`
- Auth required for all address endpoints.

### Vietnam Address Filtering

Checkout address modal uses Province Open API v1 for cascading Vietnam address selection.

Reason: the current form and backend address JSON use 3 administrative fields: province, district, ward.

Fallback:

- Manual input remains available if external API fails.

### Order DTO ID Validation

Backend `CreateOrderDto` accepts non-empty strings for `artisanId` and `productId` instead of `@IsUUID`.

Reason: existing seed data includes ID strings that are valid Prisma `String` IDs but do not satisfy strict UUID version validation.

### Auth Refresh

Frontend API helper refreshes access tokens on `401` and retries once.

Reason: checkout and shipping address endpoints require auth, and a stale access token caused address save to fail.

