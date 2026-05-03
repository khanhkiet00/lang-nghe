# Decisions

## 2026-05-01 — Phase 1: Core E-commerce

### Public Profile Links From Product Detail
- Product detail artisan links prefer `/ho-so/[profile.slug]`, fallback `/nghe-nhan/[artisanSlug]`.
- Lý do: người dùng muốn nhấn vào nghệ nhân hiển thị hồ sơ công khai đầy đủ.

### Cart Item Selection
- Checkout dựa trên selected items, không phải toàn bộ giỏ.
- Lý do: người mua có thể giữ sản phẩm trong giỏ nhưng chỉ mua một phần.
- Implementation: selected IDs lưu vào `sessionStorage["langnghe_checkout_item_ids"]`.

### Shipping Addresses
- Địa chỉ lưu trên backend (Prisma `ShippingAddress`), không phải localStorage.
- Lý do: tái sử dụng địa chỉ giữa các phiên đăng nhập.

### Vietnam Address Filtering
- Modal địa chỉ dùng `https://provinces.open-api.vn/api/v1` cho cascading province/district/ward.
- Fallback: nhập thủ công nếu API ngoài lỗi.

### Order DTO ID Validation
- `CreateOrderDto` chấp nhận non-empty string thay vì strict `@IsUUID`.
- Lý do: seed data dùng ID kiểu UUID-like string không pass strict UUID validation.

### Order Status Constraints (Buyer)
- Người mua chỉ hủy được khi trạng thái `pending`.
- Khi `processing` trở lên: không cho hủy.
- Khi `shipped`: người mua có thể xác nhận `completed`.

### Review After Order
- Đánh giá chỉ mở sau khi đơn `completed`.
- Gồm: 5 tiêu chí sao (quality, accuracy, shipping, communication, payment), bình luận, upload ảnh.
- Backend ràng buộc unique: mỗi đơn chỉ review 1 lần.

## 2026-05-01 — Phase 2: Navigation & UX

### Unified Navbar
- Tạo `components/ui/Navbar.tsx` dùng chung cho tất cả trang.
- Props: `showSearch`, `searchPlaceholder`, `searchValue`, `onSearchChange`, `activePage`.
- Trang cần tìm kiếm (trang chủ, đơn hàng) bật `showSearch=true` với placeholder phù hợp.
- Trang không cần tìm kiếm ẩn search bar.
- Lý do: nhất quán UI và tránh duplicate code nav trên từng trang.

### Navbar Links
- Bỏ link "Nghệ nhân" khỏi Navbar (theo yêu cầu người dùng, tránh link trỏ `#` vô nghĩa).
- Giữ: Trang chủ, Đơn hàng (khi đã đăng nhập), CartNavIcon, user avatar menu.

### Featured Products Count
- "Tạo Tác Xu Hướng" hiển thị 5 sản phẩm (1 big card + 4 small cards).
- Tăng từ 3 lên 5 theo yêu cầu người dùng.

## 2026-05-01 — Phase 3: Token Management

### Refresh Token — Queue-Based Strategy
- Cũ: refresh chạy khi nhận 401, nhiều request đồng thời gây race condition.
- Mới:
  1. **Proactive check**: trước mỗi request, kiểm tra JWT `exp`. Nếu < 60 giây → refresh trước.
  2. **Queue**: nếu đang refresh, các request khác xếp hàng chờ kết quả, không gọi refresh riêng.
  3. **Fallback**: nếu vẫn nhận 401 sau proactive refresh → retry 1 lần nữa.
- Lý do: tránh gọi refresh API nhiều lần song song, tránh invalidate refresh token sớm.

## 2026-05-03 — Phase 4: Reviews & Artisan UX

### Review Domain Split
- `Review` là đánh giá giữa người dùng với người dùng:
  - Buyer đánh giá nghệ nhân sau khi đơn hoàn thành.
  - Nghệ nhân đánh giá buyer sau khi đơn hoàn thành.
  - Hiển thị trong hồ sơ với nhãn "Nhận xét từ người khác".
- `ProductReview` là đánh giá sản phẩm:
  - Gắn với `orderId + productId + reviewer_id`.
  - Cho phép cùng buyer đánh giá cùng sản phẩm nhiều lần nếu là các đơn hàng khác nhau.
  - Hiển thị trên trang chi tiết sản phẩm, không hiển thị trong hồ sơ nghệ nhân.
- Lý do: tránh trộn uy tín nghệ nhân với chất lượng từng sản phẩm, đồng thời giữ đúng nghiệp vụ mua lại/đánh giá lại theo đơn.

### Review Media
- Media ảnh/video chỉ thuộc review sản phẩm.
- Review hồ sơ/nghệ nhân không hiển thị media sản phẩm.
- Khi bấm media trong review, mở overlay ngay trong trang thay vì chuyển sang route/tab khác.

### Review Interactions
- Review có like/dislike và trả lời.
- Cùng một user chỉ có một reaction trên mỗi review; bấm lại cùng reaction để bỏ, bấm reaction khác để đổi.
- Áp dụng cho cả `Review` và `ProductReview`.

### Completed Order Review Behavior
- Nút đánh giá chỉ xuất hiện khi đơn `completed`.
- Sau khi đánh giá thành công thì ẩn nút và hiển thị trạng thái đã đánh giá.
- Nếu gửi đánh giá lỗi thì giữ luồng để người dùng đánh giá lại.

### Artisan Order Default View
- Trang `/nghe-nhan/don-hang` mặc định mở tab `Chờ xác nhận`.
- Sidebar nghệ nhân hiển thị badge số đơn pending ở tab "Đơn hàng".
- Lý do: khi nghệ nhân vào quản lý đơn, nhu cầu thực tế đầu tiên là xử lý đơn mới.

### Artisan Dashboard Filters
- Tách khoảng thời gian và cách nhóm biểu đồ:
  - Preset khoảng ngày: 7 ngày, 30 ngày, tháng này, năm nay, tùy chỉnh.
  - Nhóm biểu đồ: ngày, tháng, quý, năm.
- Default là 30 ngày gần nhất, nhóm theo ngày.
- Lý do: filter cũ trộn range và aggregation nên khó dùng trong thực tế.
