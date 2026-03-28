# Project Rules cho Nền tảng Làng Nghề

## 💻 TECH STACK & ARCHITECTURE
- Tech stack: Next.js 14 App Router + TypeScript (strict), NestJS 10 + Prisma + PostgreSQL + Redis + Docker + Coolify.
- Luôn tuân thủ Đặc tả Kỹ thuật v2.0 (xem file lang_nghe_tech_spec.md).
- Multi-role với bảng user_roles.
- Modular design: mỗi tính năng là NestJS module riêng.
- SEO-first, SSR cho các trang công khai.
- Sử dụng optimistic locking cho ton kho, feature flags, event-driven.
- Không bao giờ expose secret keys lên client.
- Test trước khi commit thay đổi lớn.

## 🧠 QUẢN LÝ BỘ NHỚ AI (Cho Local Ollama)
- **Context Limit:** Chỉ đọc tối đa 5 file liên quan trực tiếp đến Task. Nếu file quá dài (>300 dòng), hãy yêu cầu chia nhỏ module.
- **Memory Sync:** Sau mỗi Task hoàn thành, PHẢI cập nhật `progress.md`, `active-context.md` và `decisions.md`.
- **Reset Point:** Khi RAM máy bị đầy hoặc AI bắt đầu trả lời chậm, hãy tóm tắt trạng thái và yêu cầu User "Reset Session".

## 🛡 QUY TẮC PHÁT TRIỂN & SECURITY
- **Auth:** Sử dụng HttpOnly Cookies cho JWT, RBAC qua bảng `user_roles`.
- **Database:** Luôn sử dụng Optimistic Locking cho tồn kho (bảng `products`).
- **Secrets:** Không bao giờ hardcode API Keys, Database URL. Sử dụng `.env` và xác thực qua `ConfigService` trong NestJS.
- **SEO:** Slug phải friendly (vd: /san-pham/gom-su-bat-trang-cao-cap).

## 🚢 DEVOPS & DEPLOYMENT
- **Docker:** Sử dụng Multi-stage build cho cả Next.js và NestJS để giảm dung lượng Image trên Coolify.
- **Event-driven:** Sử dụng cho hệ thống thông báo trạng thái đơn hàng và tin nhắn nghệ nhân.