# Làng Nghề Platform — SPEC

## Tổng quan

Làng Nghề là sàn thương mại điện tử cho sản phẩm thủ công truyền thống Việt Nam.

- Frontend: Next.js 14 (App Router) tại `frontend/`
- Backend: NestJS + Prisma + PostgreSQL tại `backend/`
- Auth: JWT (access token ngắn hạn + refresh token dài hạn)

---

## User Roles

| Role | Mô tả |
|---|---|
| `buyer` | Người mua — mặc định sau đăng ký |
| `artisan` | Nghệ nhân — sau khi đăng ký và xác minh eKYC |

---

## Core User Flows

### 1. Mua sắm (Buyer)
- Browse sản phẩm từ trang chủ → lọc danh mục → tìm kiếm.
- Xem chi tiết sản phẩm `/san-pham/[slug]`.
- Thêm vào giỏ, quản lý giỏ `/gio-hang`.
- Thanh toán `/thanh-toan` — chọn địa chỉ, chọn phương thức.
- Xem đơn hàng `/don-hang` — phân trang, lọc, tìm kiếm.
- **(TODO)** Xem chi tiết đơn `/don-hang/[orderId]`.
- Đánh giá sau khi đơn hoàn thành: đánh giá nghệ nhân và đánh giá từng sản phẩm trong đơn.

### 2. Nghệ nhân (Artisan)
- Đăng ký và xác minh eKYC `/nghe-nhan/dang-ky`.
- Dashboard `/nghe-nhan` — quản lý sản phẩm và đơn hàng.
- Thêm/sửa/xóa sản phẩm.
- Cập nhật trạng thái đơn hàng.
- Đánh giá người mua sau khi đơn hoàn thành.
- Xem thống kê doanh thu.
- Hồ sơ công khai `/nghe-nhan/[slug]`.

### 3. Hồ sơ
- Hồ sơ cá nhân `/ho-so` — chỉnh sửa thông tin, xem đơn hàng.
- Hồ sơ công khai `/ho-so/[slug]` — follow/unfollow, xem sản phẩm.
- Thống kê chi tiêu `/ho-so/thong-ke`.

---

## Checkout Requirements

**Input:**
- Selected item IDs từ `sessionStorage["langnghe_checkout_item_ids"]`.
- Cart data từ `localStorage["langnghe_cart_items"]`.
- Access token từ `localStorage["langnghe_access_token"]`.

**Behavior:**
- Redirect về `/auth?mode=login` nếu chưa đăng nhập.
- Load địa chỉ đã lưu từ `GET /shipping-addresses`.
- Add/edit địa chỉ qua modal (cascade province/district/ward).
- Hỗ trợ payment method: `cod`, `bank_transfer`.
- Submit `POST /orders` — giảm tồn kho trong transaction.
- Xóa sản phẩm đã đặt khỏi giỏ sau khi thành công.

**Constraints:**
- 1 đơn chỉ được 1 nghệ nhân.
- Shipping fee: free nếu subtotal ≥ 500.000đ, ngược lại 30.000đ.
- Chưa tích hợp payment gateway thật.

---

## Order Status Flow

```
pending → processing → shipped → completed
    ↓           ↓
cancelled   (không thể hủy)
```

- **Buyer**: hủy khi `pending`, confirm nhận khi `shipped → completed`.
- **Artisan**: pending → processing → shipped → completed.

---

## Cart Requirements

- localStorage-backed (`langnghe_cart_items`).
- Chọn từng sản phẩm hoặc chọn tất cả.
- Tóm tắt chỉ tính sản phẩm đã chọn.
- Xóa sản phẩm có ConfirmModal.
- Voucher `LANGNGHE` giảm 50.000đ.

---

## Shipping Address Requirements

Mỗi user có thể lưu nhiều địa chỉ giao hàng.

**Fields:** `label`, `name`, `phone`, `address`, `ward`, `district`, `province`, `isDefault`.

**Cascading filter:** dùng `https://provinces.open-api.vn/api/v1`.
Fallback: nhập thủ công nếu API ngoài lỗi.

---

## Search Requirements

- Hỗ trợ tìm kiếm không dấu (PostgreSQL `unaccent`).
- VD: gõ "gom su" vẫn tìm được "gốm sứ".
- Debounce 500ms trên frontend.
- Áp dụng: tìm sản phẩm (trang chủ), tìm đơn hàng (lịch sử đơn).

---

## Navigation Requirements

- Tất cả trang dùng `Navbar` từ `@/components/ui/Navbar`.
- Navbar cố định top, glassmorphism (`bg-white/70 backdrop-blur-xl`).
- Logo đỏ "Làng Nghề" link về `/`.
- Links: Trang chủ, Đơn hàng (khi đã đăng nhập), Cart icon, User avatar menu.
- Search bar chỉ hiện ở trang chủ (search sản phẩm) và đơn hàng (search đơn).

---

## Review Requirements

- Chỉ mở sau khi đơn `completed`.
- 5 tiêu chí: quality, accuracy, shipping, communication, payment (1–5 sao).
- Bình luận text tùy chọn.
- Tách 2 loại đánh giá:
  - `Review`: đánh giá giữa người dùng với người dùng (buyer -> nghệ nhân, nghệ nhân -> buyer). Hiển thị trên hồ sơ với nhãn "Nhận xét từ người khác".
  - `ProductReview`: đánh giá sản phẩm theo từng đơn hàng. Hiển thị trên trang chi tiết sản phẩm.
- Media ảnh/video chỉ nằm ở `ProductReview`; hồ sơ không hiển thị media review sản phẩm.
- Unique:
  - Buyer chỉ đánh giá nghệ nhân 1 lần cho mỗi đơn.
  - Buyer chỉ đánh giá mỗi sản phẩm 1 lần trong cùng đơn.
  - Nếu mua lại cùng sản phẩm ở đơn khác thì được đánh giá sản phẩm lần nữa.
- Review hỗ trợ like/dislike và trả lời.

---

## eKYC Requirements

- Nghệ nhân phải xác minh bằng eKYC để được cấp role `artisan`.
- Bước 1: Upload ảnh CCCD → OCR trích xuất tên tự động.
- Bước 2: Chụp selfie → FaceMatch với ảnh CCCD.
- Ngưỡng chấp nhận: độ khớp khuôn mặt ≥ 40%.
- Dùng FPT.AI API.

---

## API Endpoints (Tóm tắt)

| Module | Endpoints |
|---|---|
| Auth | POST /auth/login, /register, /refresh, /logout, /request-register-otp, /verify-otp |
| Products | GET /products, /products/:slug, POST/PATCH/DELETE /products |
| Orders | GET/POST /orders, GET /orders/:id, PATCH /orders/:id/status |
| Reviews | POST /reviews, GET /users/:id/reviews, GET /products/:id/reviews, POST /reviews/:id/reaction, POST /product-reviews/:id/reaction, POST /reviews/:id/replies, POST /product-reviews/:id/replies |
| Shipping | GET/POST /shipping-addresses, PATCH/DELETE /shipping-addresses/:id |
| Users | GET /users/me, PATCH /users/me, GET /users/public/:slug |
| Artisans | GET /artisans/:slug, POST /artisans/register |
| Analytics | GET /analytics/buyer, /analytics/artisan |
| Upload | POST /upload |
| eKYC | POST /ekyc/ocr, /ekyc/face-match |
