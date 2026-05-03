# Active Context

## Current Focus

Dự án đang ở giai đoạn hoàn thiện UX và logic review sau khi luồng mua sắm cốt lõi đã xong.

Công việc gần nhất:
- Sửa luồng đăng ký nghệ nhân: JSX, dùng `api` client cho request cần auth, refresh token rotation ở backend.
- Tách review sản phẩm và review nghệ nhân/người dùng:
  - `Review`: đánh giá giữa người dùng với nhau (buyer đánh giá nghệ nhân, nghệ nhân đánh giá buyer).
  - `ProductReview`: đánh giá sản phẩm theo từng đơn hàng.
- Hoàn thành UI review sau đơn `completed`: người mua có thể đánh giá nghệ nhân và từng sản phẩm trong cùng modal.
- Nghệ nhân có thể đánh giá người mua ở `/nghe-nhan/don-hang` khi đơn đã hoàn thành.
- Thêm like/dislike và trả lời cho cả review người dùng và review sản phẩm.
- Chỉnh hồ sơ `/ho-so` và `/ho-so/[slug]`: tab rõ hơn, nhãn "Nhận xét từ người khác", review hồ sơ không hiển thị media sản phẩm.
- Chỉnh dashboard nghệ nhân:
  - `/nghe-nhan/don-hang` mặc định mở tab `Chờ xác nhận`.
  - Sidebar hiển thị badge số đơn mới trên tab "Đơn hàng".
  - Có nút về trang chủ trên mọi thiết bị.
  - Filter thống kê thực tế hơn: khoảng ngày riêng, nhóm biểu đồ riêng.
- Sửa thống kê chi tiêu người mua để dùng data thật thay vì số đơn/category set cứng.

## Việc cần làm tiếp theo (ưu tiên cao nhất)

1. **Redirect khi session hết hạn**
   - Khi refresh token hết hạn, hiện tại `api.ts` xóa token im lặng
   - Cần: dispatch event hoặc redirect sang `/auth?mode=login` với toast thông báo

2. **Kiểm thử lại review end-to-end trên dữ liệu thật**
   - Buyer hoàn thành đơn -> đánh giá nghệ nhân + sản phẩm
   - Product detail chỉ hiện `ProductReview`
   - Hồ sơ chỉ hiện `Review` kiểu người dùng/nghệ nhân
   - Artisan completed order -> đánh giá buyer

## Important Files

### Frontend
- `frontend/src/components/ui/Navbar.tsx` — Navbar dùng chung toàn app
- `frontend/src/lib/api.ts` — API helper với refresh token tự động
- `frontend/src/lib/cart.ts` — Quản lý giỏ hàng localStorage
- `frontend/src/app/page.tsx` — Trang chủ
- `frontend/src/app/don-hang/page.tsx` — Lịch sử đơn hàng
- `frontend/src/app/thanh-toan/page.tsx` — Thanh toán
- `frontend/src/app/gio-hang/page.tsx` — Giỏ hàng
- `frontend/src/app/ho-so/page.tsx` — Hồ sơ cá nhân
- `frontend/src/app/ho-so/[slug]/page.tsx` — Hồ sơ công khai
- `frontend/src/app/san-pham/[slug]/page.tsx` — Chi tiết sản phẩm
- `frontend/src/app/nghe-nhan/(dashboard)/layout.tsx` — Layout dashboard nghệ nhân
- `frontend/src/app/nghe-nhan/(dashboard)/don-hang/page.tsx` — Quản lý đơn hàng nghệ nhân + đánh giá buyer
- `frontend/src/components/ReviewList.tsx` — List review dùng chung, like/dislike/reply/show more
- `frontend/src/components/ReviewAttachments.tsx` — Xem ảnh/video review trong overlay tại chỗ
- `frontend/src/components/ui/ReviewModal.tsx` — Buyer đánh giá nghệ nhân + sản phẩm
- `frontend/src/components/ui/BuyerReviewModal.tsx` — Nghệ nhân đánh giá người mua
- `frontend/src/components/ArtisanSidebar.tsx` — Sidebar/mobile nav nghệ nhân + badge đơn mới

### Backend
- `backend/src/orders/orders.service.ts` — Logic đơn hàng
- `backend/src/orders/orders.controller.ts` — Routes đơn hàng
- `backend/src/auth/auth.service.ts` — Auth + refresh token
- `backend/src/shipping-addresses/*` — API địa chỉ giao hàng
- `backend/src/reviews/*` — API đánh giá
- `backend/src/analytics/*` — API thống kê
- `backend/prisma/schema.prisma` — Database schema
- `backend/prisma/migrations/20260502143000_add_product_reviews/migration.sql` — Bảng product review
- `backend/prisma/migrations/20260502152000_add_review_reactions_replies/migration.sql` — Like/dislike/reply review

## Runtime Notes

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api/v1`
- Không để cả 2 cùng port 3000/3001.
- Sau auth changes: đăng xuất + đăng nhập lại để refresh token được lưu.
- Backend dev server có thể đang tắt sau khi chạy migration/generate. Người dùng đã nói "no" khi được hỏi restart.
- Đã chạy `npx.cmd prisma generate`, `npx.cmd prisma migrate deploy`, backend build pass.
- Frontend lint các file chạm vào pass với warning cũ (`<img>`, deps `useEffect`).
- Full frontend build/tsc đang bị chặn bởi lỗi cũ không liên quan ở `frontend/src/app/don-hang/[id]/page.tsx:342`: prop `message` nhận JSX thay vì string.
