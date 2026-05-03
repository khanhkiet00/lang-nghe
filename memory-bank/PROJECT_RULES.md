# Project Rules

## General

- Giữ code nhất quán với pattern Next.js (App Router) và NestJS hiện có.
- Ưu tiên thay đổi nhỏ, có scope rõ ràng thay vì refactor lớn.
- Dùng data thật từ backend thay vì placeholder hardcode khi API đã có.
- State tạm thời: dùng `localStorage` hoặc `sessionStorage` với key rõ ràng có prefix `langnghe_`.

## Frontend

- App path: `frontend/src/app`.
- Shared components: `frontend/src/components`.
- UI components: `frontend/src/components/ui`.
- API helper: `frontend/src/lib/api.ts` — dùng `api.get/post/patch/put/delete`.
- Cart helper: `frontend/src/lib/cart.ts`.

### Navbar
- **Tất cả trang** phải dùng `Navbar` từ `@/components/ui/Navbar`.
- Không dùng `<nav>` inline tự tạo trên trang customer-facing.
- Trang cần search: truyền `showSearch={true}` + `searchPlaceholder` + `onSearchChange`.
- Trang không cần search: `showSearch={false}`.

### Style
- Background trang: `bg-[#F9F9F7]`.
- Text chính: `text-[#1A1C1C]`.
- Màu brand: `#C84B31` (đỏ đất).
- Màu brand phụ: `#52652A` (xanh lá đất).
- Navbar: `fixed top-0 z-50 bg-white/70 backdrop-blur-xl`.
- Content bắt đầu từ: `pt-24` hoặc `pt-28` (tránh bị navbar che).

### Components
- Card sản phẩm: dùng `ProductCard` (`@/components/ProductCard`).
- Modal xác nhận: dùng `ConfirmModal` (`@/components/ui/ConfirmModal`).
- Modal đánh giá: dùng `ReviewModal` (`@/components/ui/ReviewModal`).

## Backend

- API prefix: `/api/v1`.
- Backend path: `backend/src`.
- Prisma schema: `backend/prisma/schema.prisma`.
- Mọi thay đổi DB cần migration file trong `backend/prisma/migrations`.
- Sau migration mới: chạy `npx prisma generate` để update Prisma client.

## Auth

- Frontend lưu:
  - `langnghe_access_token` — JWT ngắn hạn (≈15 phút)
  - `langnghe_refresh_token` — token dài hạn (≈7 ngày)
- `api.ts` tự động attach Bearer token và refresh khi cần.
- Không dùng `fetch` trực tiếp cho các API cần auth — luôn dùng `api.*`.
- Ngoại lệ: auth endpoints (`/auth/*`) và upload endpoint có thể dùng `fetch` trực tiếp.

## Checkout & Orders

- `POST /orders` tạo đơn, giảm tồn kho trong 1 transaction.
- Backend chỉ cho phép 1 nghệ nhân/đơn hiện tại.
- Order status flow: `pending → processing → shipped → completed`.
- Người mua: chỉ hủy khi `pending`, confirm nhận khi `shipped`.
- Nghệ nhân: confirm → xử lý → giao → hoàn thành.

## Search

- Tìm kiếm không dấu dùng PostgreSQL `unaccent` extension.
- Debounce 500ms trên frontend trước khi gọi API.
- Pattern: `unaccent(field) ILIKE unaccent('%keyword%')`.
