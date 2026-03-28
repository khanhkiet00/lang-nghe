# Các lựa chọn công nghệ quan trọng cho Nền tảng Làng Nghề

Dựa trên tài liệu SPEC.md, các lựa chọn công nghệ quan trọng cho dự án bao gồm:

*   **Database:** PostgreSQL 15 (Docker trên VPS) - Tự host, thay thế Supabase.
*   **Deployment:** Docker + VPS + Coolify - Tự host, thay thế Vercel/Railway/Upstash.
*   **Frontend:** Next.js 14 (App Router) + TypeScript.
*   **Backend:** NestJS 10 + TypeScript.
*   **Auth MVP (tuần 2):** email/password + OTP (5 phút) + JWT access/refresh + RBAC via user_roles, RefreshToken lưu DB; no secrets in source, env args.
    - **JWT tokens:** `accessToken` 15m (Bearer header) + `refreshToken` 7d (HttpOnly secure cookie)
    - **Password hashing:** bcrypt (10 rounds)
    - **OTP flow:** 6-digit code, 5-min expiry, sent via Resend API
    - **RBAC:** `@Roles()` decorator + guard checking `user.roles` array (buyer, artisan, admin)
    - **Test:** E2E coverage of register → verify-OTP → login → refresh → /me → logout (2/2 pass)
