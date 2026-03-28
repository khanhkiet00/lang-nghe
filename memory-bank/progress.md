# Lộ trình phát triển Nền tảng Làng Nghề

## 12.1 MVP - Tháng 1 đến 3

| Tuần | Công việc kỹ thuật | Kết quả kiểm tra |
|---|---|---|
| 1 | Setup: Docker Compose (PG+Redis+Nginx+Adminer), folder structure, ESLint, Prettier, Prisma schema | Hoàn thành: docker-compose up, backend+frontend skeleton, Prisma migrate, Health API, nginx gateway |
| 2 | Auth: đăng ký + OTP (Resend) + đăng nhập + JWT (access+refresh) + RBAC guard | ✅ Hoàn thành: register + verify-OTP + login + refresh + RBAC @Roles guard, HttpOnly cookies, E2E tests 2/2 đạt |
| 3 | Hồ sơ: tạo profile, upload ảnh (Cloudinary signed URL), slug SEO, trang nghe-nhan/[slug] SSR | Hoàn tất: frontend /page.tsx form + logic auth/login, artisan/me, upload Cloudinary, SSR slug page (404 nếu chưa có data) |
| 4 | Sản phẩm: CRUD + ảnh + tag + FTS (pg_trgm + unaccent) + trang san-pham/[slug] SSR | Tìm kiếm tiếng Việt có dấu hoạt động, trang SP có SEO |
| 5 | Feed: hiển thị SP, lọc, sắp xếp, infinite scroll. Giỏ hàng (localStorage + DB khi đăng nhập). | Feed hiện đúng, giỏ hàng giữ sau khi refresh |
| 6 | Đặt hàng: tạo đơn (tách theo nghệ nhân, optimistic lock tồn kho), tính phí ship thủ công, email xác nhận | 2 SP từ 2 nghệ nhân → 2 đơn riêng, tồn kho trừ đúng, email gửi thành công |
| 7 | Trạng thái đơn: timeline cập nhật, logistics thủ công (nhập mã vận đơn), 7 ngày tự động xác nhận | Người mua thấy lịch sử đơn, nghệ nhân nhập được mã vận đơn |
| 8 | Đánh giá: mở sau completed, ẩn đến khi cả 2 xong, tính điểm uy tín, ngưỡng tự động | Đánh giá hiện đúng, điểm tính theo công thức, SP tự ẩn khi < 3.0 |
| 9 | Chat: Socket.io, lưu lịch sử, biểu tượng đang gõ, thông báo tin nhắn mới | Tin nhắn tới < 1 giây, thông báo hiện khi có tin mới |
| 10 | B2B: RFQ (có thời hạn), báo giá ẩn đến hết hạn, hợp đồng OTP + PDF + SHA-256 | Ký hợp đồng bằng OTP hoạt động, hash lưu vào DB và có thể verify |
| 11 | Dashboard 3 role, Admin cơ bản, ngưỡng tự động (ẩn SP, tạm khóa), Custom Order cơ bản | Admin xem được thống kê, có thể khóa user |
| 12 | Fix bug, SEO audit, Cloudflare Tunnel test với người dùng thật, deploy lên VPS + Coolify | Có link https:// thật chạy 24/7, SSL hợp lệ, 5 người dùng cùng lúc OK |

## 12.2 Beta - Tháng 4 đến 6

- Logistics GHN: tích hợp API (tính phí, tạo vận đơn tự động, webhook tracking realtime)
- Thanh toán VNPay hoặc MoMo Sandbox → Production
- Soft Escrow: giữ tiền sau khi thanh toán, giải ngân khi hoàn thành
- Ví số dư nghệ nhân: tích lũy từ đơn, admin duyệt rút tiền
- BullMQ cho email batch và webhook GHN bất đồng bộ
- Feed cá nhân hóa cơ bản (theo danh mục đã xem, nghệ nhân đã follow)
- Custom Order với escrow
- SEO nâng cao: Sitemap, structured data (JSON-LD), Open Graph

## 12.3 V1.0 - Tháng 7 đến 9

- Thêm GHTK (đơn vị vận chuyển thứ 2 - phủ rộng nông thôn tốt hơn)
- Rút tiền tự động bằng VietQR API - loại bỏ bước admin duyệt
- Blockchain: bật feature flag blockchain_enabled → ProductNFT, ArtisanID trên Polygon
- Tối ưu hiệu suất: cache Redis cho feed, phân tích query chậm, thêm index nếu cần

## 12.4 Mở rộng - Tháng 10+

- Thêm nhóm người dùng mới (nếu có nhu cầu thực tế)
- Đa ngôn ngữ Việt/Anh (next-intl)
- AI gợi ý SP (collaborative filtering đơn giản bằng PostgreSQL)
- Zalo ZNS thêm vào kênh thông báo (không thay thế email)
- Báo cáo thị trường: bán insights xu hướng thủ công cho doanh nghiệp
