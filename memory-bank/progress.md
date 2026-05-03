# Progress

## Completed

### Infrastructure
- NestJS backend với Prisma + PostgreSQL.
- Next.js frontend.
- Docker Compose (DB + Backend + Frontend + Nginx).
- Upload file lên Cloudinary (ảnh, video).
- eKYC xác minh nghệ nhân (OCR + FaceMatch với FPT.AI).
- PostgreSQL `unaccent` extension để tìm kiếm không dấu.

### Auth & User
- Đăng ký 3 bước: nhập email → OTP → mật khẩu + tên.
- Đăng nhập / Đăng xuất (xóa refresh token ở DB).
- Refresh token: queue-based, proactive check 60s trước khi hết hạn, không race condition.
- Hồ sơ cá nhân `/ho-so` (xem, chỉnh sửa avatar/bio/làng).
- Hồ sơ công khai `/ho-so/[slug]` (follow/unfollow, xem sản phẩm, giao diện đồng bộ với `/ho-so`).
- Hồ sơ hiển thị "Nhận xét từ người khác" là review người dùng/nghệ nhân, không trộn review sản phẩm.
- Thống kê chi tiêu người mua `/ho-so/thong-ke` dùng dữ liệu backend thật cho số đơn, chi tiêu và category.
- Refresh token rotation ở backend đã sửa để refresh token mới được lưu hash trước khi trả về frontend.

### Artisan
- Đăng ký nghệ nhân `/nghe-nhan/dang-ky` với eKYC.
- Dashboard nghệ nhân `/nghe-nhan` (sidebar layout, protected route).
- Quản lý sản phẩm: CRUD + phân trang + tìm kiếm debounce.
- Quản lý đơn hàng nghệ nhân: xem + cập nhật trạng thái, mặc định vào tab đơn mới/chờ xác nhận.
- Nghệ nhân có thể đánh giá người mua sau khi đơn hoàn thành.
- Sidebar nghệ nhân có nút về trang chủ trên mọi thiết bị và badge số đơn mới trên tab "Đơn hàng".
- Thống kê doanh thu nghệ nhân `/nghe-nhan/thong-ke` với filter ngày thực tế hơn: preset khoảng ngày và nhóm biểu đồ riêng.
- Hồ sơ công khai nghệ nhân `/nghe-nhan/[slug]`.

### Sản phẩm & Mua sắm
- Trang chủ: Hero slider, Tạo Tác Xu Hướng (5 sản phẩm), danh sách + phân trang.
- Tìm kiếm tiếng Việt không dấu (unaccent).
- Lọc theo danh mục.
- Trang chi tiết sản phẩm `/san-pham/[slug]`: gallery, thông tin nghệ nhân, đánh giá.
- Đánh giá sản phẩm dùng bảng `ProductReview` riêng, không dùng review nghệ nhân.
- Giỏ hàng `/gio-hang`: thêm/xóa/chọn/số lượng/voucher LANGNGHE.
- Thanh toán `/thanh-toan`: COD + chuyển khoản, chọn địa chỉ, ghi chú.

### Đơn hàng
- Tạo đơn hàng (giảm tồn kho trong transaction, 5% platform fee).
- Lịch sử đơn hàng người mua `/don-hang`: phân trang + lọc trạng thái + tìm kiếm không dấu.
- Workflow trạng thái: `pending → processing → shipped → completed`.
- Người mua chỉ hủy được khi `pending`, không thể hủy khi `processing+`.
- Mua lại đơn (thêm sản phẩm vào giỏ).
- Đánh giá sau đơn hoàn thành:
  - Buyer đánh giá nghệ nhân 1 lần cho mỗi đơn.
  - Buyer đánh giá từng sản phẩm trong đơn qua `ProductReview`.
  - Nếu mua lại cùng sản phẩm ở đơn khác thì có thể đánh giá sản phẩm lần nữa.
  - Sau khi đã đánh giá thành công thì ẩn nút đánh giá/hiện trạng thái đã đánh giá.
- Trang chi tiết đơn hàng `/don-hang/[orderId]` — timeline trực quan, thông tin giao hàng, tóm tắt thanh toán, nút hủy.
- Chi tiết đơn hàng Nghệ nhân (Drawer) — minh bạch phí sàn 5%, thực nhận, mã vận đơn.

### Reviews
- Tách rõ 2 loại review:
  - `Review`: review giữa người dùng với người dùng (nghệ nhân/buyer).
  - `ProductReview`: review sản phẩm, gắn với `orderId + productId + reviewer_id`.
- Like/dislike review và trả lời review cho cả `Review` và `ProductReview`.
- Media ảnh/video chỉ hiển thị ở review sản phẩm; review hồ sơ không hiện media sản phẩm.
- Media review mở overlay xem ngay trong trang, không chuyển route.
- Review list có chế độ hiển thị vài đánh giá trước, người dùng bấm xem thêm để mở rộng.

### UI/UX
- **Navbar dùng chung** (`components/ui/Navbar.tsx`) với tìm kiếm context-aware trên tất cả trang.
- Trang auth với OTP 6 ô (paste, auto-focus, backspace).
- `ConfirmModal` dùng chung cho mọi thao tác xóa/hủy.
- `ReviewModal` cho đánh giá sau đơn.
- `ReviewList` dùng chung cho product/profile reviews, có like/dislike/reply/show-more.
- `BuyerReviewModal` cho nghệ nhân đánh giá người mua.
- Địa chỉ giao hàng: modal add/edit + Vietnam province/district/ward cascading.
- Link xem chi tiết sản phẩm & đánh giá từ Dashboard nghệ nhân.

## Verified

- `backend`: `npm.cmd run build` pass.
- `backend`: `npx.cmd prisma generate` và `npx.cmd prisma migrate deploy` pass.
- `frontend`: eslint các file đã chỉnh pass, còn warning cũ về `<img>` và deps `useEffect`.
- Migration `20260501062000_add_shipping_addresses` đã apply.
- Migration `20260502143000_add_product_reviews` đã apply.
- Migration `20260502152000_add_review_reactions_replies` đã apply.
- Logic phân quyền: Sửa lỗi 403 khi nghệ nhân tự mua hàng của chính mình.
- Refresh token hoạt động ổn định trên toàn bộ hệ thống quản trị.

## Known Issues

- Full frontend build/tsc hiện bị chặn bởi lỗi cũ không liên quan ở `frontend/src/app/don-hang/[id]/page.tsx:342`: prop `message` đang truyền JSX nhưng type yêu cầu string.

## Known Manual Steps

- Sau khi thay đổi auth, cần đăng xuất và đăng nhập lại để `langnghe_refresh_token` được lưu đúng.
- Frontend chạy port 3000, backend port 3001 (tránh xung đột).
- Restart backend sau mọi thay đổi NestJS.
- Cài đặt xưởng `/nghe-nhan/settings` — đã chuyển sang dùng api client.
- Backend dev server có thể đang tắt sau khi migration/generate; người dùng đã từ chối restart ở bước trước.

## Remaining Work (Theo thứ tự ưu tiên)

### Cao
- [ ] Redirect + toast khi refresh token hết hạn (hiện chỉ xóa token im lặng).
- [ ] Kiểm thử thủ công end-to-end luồng buyer review nghệ nhân + sản phẩm và artisan review buyer trên database đang chạy.

### Trung bình
- [ ] Xóa địa chỉ giao hàng (backend có `DELETE /shipping-addresses/:id`, UI chưa có nút xóa).
- [ ] Badge "Sắp hết hàng" (tồn kho < 5) trên ProductCard.

### Thấp
- [ ] Payment gateway (VNPay / Momo).
- [ ] Tách đơn nhiều nghệ nhân (flow tách giỏ → nhiều đơn song song).
- [ ] Thông báo realtime (WebSocket / SSE).
- [ ] Admin panel (duyệt nghệ nhân, quản lý toàn bộ đơn hàng).
- [ ] SEO + Sitemap động.
