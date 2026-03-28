**DAC TA KY THUAT v2.0**

**NEN TANG LANG NGHE TRUYEN THONG**

Tu xay dung: Frontend · Backend · Database · Deploy

_Giu nguyen: Cloudinary · Resend · GHN/GHTK · VNPay/MoMo_

Thang 3/2026

# Muc luc

1\. Tong quan he thong

2\. 3 Nhom nguoi dung & Tinh nang

3\. Cac quy trinh cot loi

4\. He thong Danh gia

5\. He thong Logistics

6\. Kien truc & Cong nghe \[DA CAP NHAT - Tu xay, bo Supabase/Vercel/Railway\]

7\. Co so du lieu - Cac bang chinh

8\. API - Cac endpoint chinh

9\. Bao mat & Chong gian lan

10\. Cau truc thu muc du an

11\. Moi truong & Deploy \[DA CAP NHAT - Docker + VPS + Coolify\]

12\. Lo trinh phat trien

# 1\. Tong quan He thong

## 1.1 Mo ta

Nen tang web ket noi nghe nhan voi nguoi mua le (B2C) va doanh nghiep (B2B). Su dung mo hinh Social Commerce: bai dang ket hop giao dien mang xa hoi voi tinh nang thuong mai dien tu. Tich hop logistics (GHN/GHTK) xu ly van chuyen trong app.

## 1.2 Nguyen tac kien truc

| **Nguyen tac** | **Mo ta ky thuat**                                                          | **Loi ich**                                             |
| -------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| One Platform   | 1 Next.js app duy nhat, responsive                                          | Khong can app rieng, 1 codebase, de maintain            |
| Multi-Role     | Bang UserRoles rieng (user_id, role, is_active). Khong lam nhieu loai User. | Them vai tro moi = them 1 dong DB, khong sua schema     |
| Modular        | Moi chuc nang la NestJS module rieng. Giao tiep qua service interface.      | Tat/bat module khong anh huong module khac              |
| Feature Flag   | Bang feature_flags trong DB. Bat/tat tinh nang khong can deploy lai.        | An toan khi ra tinh nang moi, rollback nhanh            |
| Event-driven   | Bull Queue + Event emitter. Service phat event, handler lang nghe.          | Them logic moi = them handler, khong sua code cu        |
| SEO-first      | Next.js SSR. URL than thien: /san-pham/\[slug\], /nghe-nhan/\[slug\]        | Nguoi mua tu tim den qua Google, giam chi phi quang cao |

## 1.3 Cac quyet dinh cong nghe quan trong

| **Quyet dinh**  | **Da chon**                           | **Ly do ky thuat**                                              |
| --------------- | ------------------------------------- | --------------------------------------------------------------- |
| Tim kiem MVP    | PostgreSQL Full-Text Search (pg_trgm) | Du dung den hang chuc nghin SP. Khong can server rieng.         |
| Tim kiem Beta+  | Elasticsearch (them vao khi can)      | Chi them khi PostgreSQL FTS khong du - khong toi uu som         |
| Job Queue MVP   | Goi truc tiep (synchronous)           | Chua co load lon. Don gian hon, it bug hon.                     |
| Job Queue Beta+ | BullMQ + Redis                        | Them khi can xu ly batch email, webhook van chuyen              |
| Luu tru anh     | Cloudinary (upload truc tiep tu FE)   | Free tier 25GB. Xu ly resize/compress tu dong. CDN san.         |
| Auth            | NextAuth.js (tu host) + JWT           | Mien phi. Ho tro Google/Facebook OAuth.                         |
| Real-time       | Socket.io (chat + thong bao)          | Tich hop NestJS tot. Ho tro namespace, room.                    |
| Blockchain      | KHONG co o MVP - de sau               | Chuan bi san cot nullable trong DB, them sau bang feature flag. |

# 2\. 3 Nhom Nguoi dung & Tinh nang

_Dashboard hien thi theo vai tro dang active. 1 tai khoan co the bat nhieu vai tro dong thoi._

## 2.1 Nghe nhan / Ho san xuat

### MVP - phai co truoc khi ra mat

| **Tinh nang**       | **Mo ta ky thuat**                                                                                                                                                                                                                                                                                                          | **Rang buoc / Bao ve**                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Dang ky + xac minh  | Email/SDT + OTP. Upload CCCD 2 mat + selfie → luu Cloudinary, luu URL vao DB. KHONG require admin duyet.                                                                                                                                                                                                                    | OTP het han 5 phut. CCCD luu de truy cuu tranh chap - khong dung de chan dang ky.                                  |
| Ho so nghe nhan     | Thong tin co ban, anh dai dien, lang nghe, chuyen mon. URL: /nghe-nhan/\[slug\]. SSR cho SEO.                                                                                                                                                                                                                               | Slug tu dong tao tu ten, de sua. Tat ca trang nghe nhan duoc Google index.                                         |
| Dang san pham       | Ten, mo ta, nhieu anh (toi da 10), danh muc, tag, gia le, gia si, ton kho, thoi gian lam, thoi gian giao. URL: /san-pham/\[slug\].                                                                                                                                                                                          | Yeu cau toi thieu 1 anh nen trang (>800x800px). Cloudinary tu dong kiem tra. Gia si chi hien voi user co role B2B. |
| Quan ly ton kho     | Truong quantity trong bang products. Cap nhat truc tiep. Canh bao < nguong (mac dinh: 3). Tu an khi quantity = 0.                                                                                                                                                                                                           | Lock optimistic khi nhieu nguoi dat cung luc (version field trong products).                                       |
| Quan ly don hang    | Xem danh sach theo trang thai. Xac nhan, cap nhat trang thai, nhap ma van don (MVP) hoac tao van don GHN (Beta+).                                                                                                                                                                                                           | Chi nghe nhan cua don do moi xem duoc. Authorization check o API.                                                  |
| Nhan Custom Order   | Khach gui yeu cau (mo ta + anh mau + deadline + budget). Nghe nhan bao gia. Khach xac nhan. Bat dau lam. MVP: KHONG nhan coc tren nen tang. Can co chinh sach huy ro rang hien thi truoc khi khach xac nhan: neu huy sau khi nghe nhan bat dau lam, khach chiu trach nhiem thuong luong boi thuong truc tiep voi nghe nhan. | Trang thai: pending_review → quoted → confirmed → in_progress → done. Khong xu ly tien coc o MVP.                  |
| Thong bao restock   | Khi cap nhat ton kho tu 0 → >0: doc danh sach subscriber → gui email hang loat.                                                                                                                                                                                                                                             | BullMQ o Beta+ khi so luong lon. MVP co the goi dong bo neu it.                                                    |
| Vi so du (Beta+)    | Truong wallet_balance trong bang users. Chi cap nhat sau khi don hoan thanh va escrow giai ngan.                                                                                                                                                                                                                            | Khong cho rut khi dang co khieu nai. Lich su luu bang wallet_transactions.                                         |
| Dashboard nghe nhan | Doanh thu (tong, theo thang), so don, luot xem SP, danh gia TB, top SP. Cache Redis 15 phut.                                                                                                                                                                                                                                | Chi tinh don co trang thai completed. Doanh thu la so tien da nhan (tru hoa hong).                                 |

### Giai doan sau

- ArtisanID on-chain (Polygon) - cot blockchain_token_id da co san, = NULL den khi bat
- Rut tien tu dong bang VietQR API - hien tai admin chuyen tay
- Video quy trinh lam nghe - them field video_url vao products
- Push notification mobile - Firebase FCM

## 2.2 Nguoi mua B2C

### MVP

| **Tinh nang**       | **Mo ta ky thuat**                                                                                          | **Rang buoc / Bao ve**                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Tim kiem & loc      | PostgreSQL FTS voi pg_trgm. Index tren ten, mo ta, tag. URL: /tim-kiem?q=...                                | Full-text search co tieng Viet (unaccent). Loc theo danh muc, khoang gia, danh gia, lang nghe.         |
| Gio hang            | Luu trong localStorage (khach) hoac bang carts (da dang nhap). Khi checkout: tach don theo artisan_id.      | Khi checkout: kiem tra lai ton kho real-time. Neu het hang → bao nguoi dung. Lock ton kho khi tao don. |
| Dat hang + phi ship | Nhap dia chi → MVP: phi ship thoa thuan. Beta+: goi GHN API tinh phi tu dong, hien thi truoc khi xac nhan.  | Phi ship do NGUOI MUA chiu. Nghe nhan co the set free_shipping_threshold → mien phi ship tu X dong.    |
| Theo doi van don    | MVP: nguoi mua tu tra ma tren web GHN/GHTK. Beta+: tracking realtime trong app qua webhook.                 | Webhook tu GHN can xac thuc (verify HMAC signature). Luu tat ca event de hien thi lich su.             |
| Custom Order        | Tao yeu cau voi mo ta, anh mau (Cloudinary), deadline, budget. Chon nghe nhan muc tieu.                     | MVP: KHONG xu ly tien coc. Chi la kenh lien lac + ho so yeu cau.                                       |
| Follow nghe nhan    | Bang user_follows (follower_id, followee_id). Khi nghe nhan dang SP → phat event → gui email cho followers. | Gioi han follow: max 500. Huy follow khong xoa lich su mua hang.                                       |
| Thong bao restock   | Dang ky bang restock_notifications (user_id, product_id). Xoa sau khi gui thong bao.                        | 1 user chi dang ky 1 lan cho 1 SP. Unique constraint.                                                  |
| Danh gia SP         | Chi mo sau khi order_status = 'completed'. Mot don = mot danh gia. Khong sua sau khi gui.                   | Kiem tra dieu kien o API. Luu reviewer_id + order_id de tranh trung lap.                               |
| Dashboard nguoi mua | Lich su don, trang thai van chuyen, SP yeu thich, Custom Order dang cho. Cache nhe o Redis.                 | Don hien theo thu tu moi nhat.                                                                         |

### Giai doan sau

- Scan QR nguon goc (phu thuoc blockchain ProductNFT)
- Thanh toan VNPay/MoMo + Soft Escrow
- Hoan tra / doi hang (can chinh sach ro truoc khi lam)

## 2.3 Doanh nghiep B2B

### MVP

| **Tinh nang**       | **Mo ta ky thuat**                                                                                                                                         | **Rang buoc / Bao ve**                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Dang ky B2B         | Upload Giay phep kinh doanh + thong tin cong ty. Luu Cloudinary. 1 tai khoan/doanh nghiep.                                                                 | Khong can admin duyet. Chi dung de xac minh tu cach phap nhan khi can.                              |
| Tim nha cung cap    | Tim nghe nhan theo nganh hang, nang luc SX, khu vuc. FTS giong B2C.                                                                                        | Chi hien nghe nhan co is_b2b_enabled = true va da xac minh CCCD.                                    |
| RFQ bao gia         | Tao RFQ: mo ta SP + so luong + thoi han (DN tu chon 1-14 ngay, mac dinh 3 ngay). Gui cho nhieu nghe nhan. Sau thoi han: tu dong dong, hien bao gia cho DN. | Bao gia an voi nhau den khi het thoi han → tranh copy. Sau thoi han: tat ca bao gia hien dong thoi. |
| Theo doi tien do SX | Nghe nhan cap nhat: phan tram hoan thanh + anh tien do + du kien xong ngay. DN xem real-time.                                                              | Nghe nhan chi cap nhat duoc don minh. Khong cho sua ngay cap nhat cu.                               |
| Hop dong dien tu    | Tao PDF tu template (pdf-lib). Ca 2 ben xac nhan OTP. Luu SHA-256 hash cua PDF vao DB + luu PDF len Cloudinary.                                            | OTP het han 5 phut. Hash ghi vao bang contracts.pdf_hash. Khong cho sua hop dong sau khi du chu ky. |
| Dashboard B2B       | Tong don theo trang thai, tien do SX, lich su hop dong, nha cung cap thuong xuyen.                                                                         | Phan tach ro don B2B vs B2C trong cung 1 tai khoan.                                                 |

### Giai doan sau

- Soft Escrow cho B2B (khi co VNPay/MoMo)
- Hoa don VAT tu dong
- B2BEscrow smart contract (Polygon)

## 2.4 Tinh nang chung - Tat ca nhom

| **Tinh nang**       | **Mo ta ky thuat**                                                                                                       | **Ghi chu**                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Feed bai dang       | 2 loai: san-pham (B2C) va dat-hang-si (B2B). Infinite scroll. Loc theo danh muc, lang nghe, gia. Cache Redis 5 phut.     | SSR trang dau cho SEO. URL /feed?loai=san-pham&danh-muc=gom                                                   |
| Chat realtime       | Socket.io. Namespace /chat. Room theo conversation_id. Luu lich su vao bang messages. Load 50 tin nhan moi nhat.         | Xac thuc socket qua JWT. Thong bao 'dang go'. Danh dau da doc bang read_at (TIMESTAMP NULL, null = chua doc). |
| Thong bao trong app | Bang notifications. Phat qua Socket.io khi co nguoi dung online. Email (Resend) khi offline.                             | Loai: order_new, order_status, review_new, message_new, restock, rfq_response.                                |
| Email               | Resend API. Template HTML cho tung loai email. Goi truc tiep o MVP (sync). BullMQ o Beta+.                               | Rate limit: max 3 email/phut/user. Log tat ca email da gui.                                                   |
| Admin dashboard     | Trang /admin (bao ve bang role = superadmin). Thong ke, tranh chap, rut tien (Beta+), cam tai khoan.                     | Route bao ve middleware kiem tra role. Log moi hanh dong admin.                                               |
| Danh gia 2 chieu    | Sau khi completed: mo review_window (14 ngay). Ca 2 phia danh gia. Hien thi cong khai sau khi ca 2 xong HOAC sau 7 ngay. | Kiem tra: chua co review cho order nay. Diem tinh theo trong so thoi gian.                                    |
| SEO                 | Next.js generateMetadata cho tung trang. Sitemap.xml tu dong tao. robots.txt. OpenGraph.                                 | URL: /san-pham/\[slug\], /nghe-nhan/\[slug\], /lang-nghe/\[slug\], /danh-muc/\[slug\]                         |

# 3\. Cac Quy trinh Cot loi

## 3.1 Quy trinh mua hang B2C - day du

| **Buoc**   | **Hanh dong**           | **Ky thuat xu ly**                                                                                  | **Rang buoc**                                                                                                                                                                                              |
| ---------- | ----------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1          | Them vao gio            | Cap nhat localStorage hoac bang carts                                                               | Kiem tra ton kho: neu <= 0 → bao 'het hang'                                                                                                                                                                |
| 2          | Checkout                | POST /api/orders/preview - tinh phi ship, chia don theo artisan_id                                  | Kiem tra lai ton kho lan cuoi truoc khi tao don                                                                                                                                                            |
| 3          | Xac nhan dat hang       | Transaction DB: tru quantity (optimistic lock), tao orders va order_items                           | Neu ton kho khong du → rollback, bao loi nguoi dung                                                                                                                                                        |
| 4a - MVP   | Thanh toan chuyen khoan | Email xac nhan don co STK ngan hang. Nguoi mua chuyen khoan, gui anh bien lai qua chat.             | Don trang thai: pending_payment                                                                                                                                                                            |
| 4b - Beta+ | Thanh toan VNPay/MoMo   | Redirect den cong thanh toan. Nhan webhook xac nhan. Cap nhat order_status = paid. Giu tien escrow. | Xac thuc webhook signature truoc khi cap nhat                                                                                                                                                              |
| 5          | Nghe nhan xu ly         | Xac nhan, chuan bi hang. MVP: nhap ma van don. Beta+: tao van don GHN tu dong.                      | Trang thai: confirmed → processing → shipped                                                                                                                                                               |
| 6          | GHN giao hang           | Beta+: nhan webhook → luu order_tracking_events → thong bao nguoi mua.                              | Xac thuc GHN webhook. Xu ly case giao that bai (buoc 7b)                                                                                                                                                   |
| 7a         | Giao thanh cong         | Nguoi mua bam 'Da nhan hang' HOAC 7 ngay khong phan hoi → job tu dong cap nhat completed.           | Sau completed: mo review_window. Beta+: giai ngan escrow sau 3 ngay (khong co khieu nai) - artisan_amount = subtotal \* (1 - platform_fee_rate). Ghi ro platform_fee_rate vao feature_flags (mac dinh 5%). |
| 7b         | Giao that bai           | GHN bao that bai 3 lan → thong bao 2 phia. Nguoi mua chon: giao lai hoac huy.                       | Neu huy: hoan tien. Phi ship dat hang lai tinh them.                                                                                                                                                       |
| 8          | Khieu nai (neu co)      | Trong 3 ngay sau completed: nguoi mua mo khieu nai, upload bang chung. He thong giu tien (Beta+).   | Nghe nhan co 2 ngay phan hoi. Neu khong → admin xu ly.                                                                                                                                                     |
| 9          | Danh gia 2 chieu        | Mo review form cho ca 2 phia. An ket qua den khi ca 2 xong hoac 7 ngay.                             | Don completed, chua co review, trong 14 ngay. Sau review: kiem tra nguong uy tin.                                                                                                                          |

## 3.2 Quy trinh B2B - RFQ den hop dong

| **Buoc** | **Hanh dong**      | **Ky thuat**                                                                                                                 |
| -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1        | DN tao RFQ         | Luu bang rfqs. Set thoi han (DN chon 1-14 ngay, mac dinh: 3 ngay). Gui thong bao den cac nghe nhan du tieu chuan.            |
| 2        | Nghe nhan bao gia  | Luu bang rfq_quotes. Bao gia an cho den khi het thoi han (visible_at = rfq.deadline).                                        |
| 3        | RFQ het han        | Job tu dong: cap nhat rfq.status = closed. Hien tat ca bao gia. Thong bao DN.                                                |
| 4        | DN chon nghe nhan  | Tao bang b2b_orders lien ket rfq_id va artisan_id. Gui thong bao nghe nhan duoc chon.                                        |
| 5        | Ky hop dong        | Tao ban nhap PDF. Ca 2 doc. Moi ben nhan OTP. Nhap OTP → xac nhan. Du 2 OTP: finalize PDF, tinh SHA-256, luu bang contracts. |
| 6        | San xuat + tien do | Nghe nhan cap nhat bang production_updates (percent, note, photos, estimated_done).                                          |
| 7        | Giao hang          | Nhu luong B2C buoc 5-7. Beta+: tich hop GHN/GHTK cho don si.                                                                 |
| 8        | Danh gia           | Nhu luong B2C buoc 9.                                                                                                        |

## 3.3 Chinh sach phi ship & hoan tra

| **Truong hop**                     | **Quy tac xu ly**                                                      | **Ai chiu phi**         |
| ---------------------------------- | ---------------------------------------------------------------------- | ----------------------- |
| Don hang B2C binh thuong           | Nguoi mua chiu phi ship. Hien ro truoc khi xac nhan dat hang.          | Nguoi mua               |
| Nghe nhan set mien phi ship        | Neu gia don >= free_shipping_threshold → mien phi. Nghe nhan chiu phi. | Nghe nhan               |
| Hang loi do nghe nhan              | Hoan 100% tien hang + phi ship chieu di. Nghe nhan chiu phi ship hoan. | Nghe nhan               |
| Hang dung mo ta, khach khong thich | KHONG hoan. Hang thu cong lam theo don dat - khong the ban lai.        | Nguoi mua tu chiu       |
| Hang hong do van chuyen            | GHN boi thuong theo bao hiem van don. Nghe nhan khai gia tri khi gui.  | GHN boi thuong          |
| Giao that bai, khach huy           | Hoan tien hang. Khach chiu phi ship da phat sinh.                      | Nguoi mua chiu phi ship |
| Giao that bai, khach muon giao lai | Tao don giao lai moi. Nguoi mua tra them phi ship moi.                 | Nguoi mua               |

# 4\. He thong Danh gia 2 Chieu

## 4.1 Co so du lieu

| **Truong**           | **Kieu**         | **Mo ta**                                      |
| -------------------- | ---------------- | ---------------------------------------------- |
| id                   | UUID PK          |                                                |
| order_id             | UUID FK → orders | Moi don chi co 1 review tu moi phia            |
| reviewer_id          | UUID FK → users  | Nguoi viet danh gia                            |
| reviewee_id          | UUID FK → users  | Nguoi duoc danh gia                            |
| role                 | ENUM             | reviewer_role: buyer hoac seller               |
| rating               | SMALLINT         | 1-5, bat buoc                                  |
| rating_quality       | SMALLINT NULL    | Tieu chi con: chat luong hang (seller only)    |
| rating_accuracy      | SMALLINT NULL    | Tieu chi con: dung mo ta (seller only)         |
| rating_shipping      | SMALLINT NULL    | Tieu chi con: giao dung hen (seller only)      |
| rating_communication | SMALLINT NULL    | Tieu chi con: giao tiep                        |
| rating_payment       | SMALLINT NULL    | Tieu chi con: thanh toan dung han (buyer only) |
| comment              | TEXT NULL        | Toi da 500 ky tu                               |
| photos               | TEXT\[\] NULL    | Mang URL anh tu Cloudinary, toi da 3           |
| is_visible           | BOOLEAN          | false den khi ca 2 xong hoac sau 7 ngay        |
| seller_reply         | TEXT NULL        | Phan hoi cong khai cua nghe nhan               |
| created_at           | TIMESTAMP        |                                                |
| visible_at           | TIMESTAMP NULL   | Thoi diem hien thi cong khai                   |

## 4.2 Cong thuc tinh diem uy tin

Khong dung trung binh cong don gian. Dung trong so theo thoi gian:

- Danh gia trong 30 ngay gan nhat: nhan he so 3
- Danh gia tu 31-90 ngay: nhan he so 2
- Danh gia cu hon 90 ngay: nhan he so 1

Cong thuc: reputation_score = SUM(rating \* weight) / SUM(weight)

Luu vao truong reputation_score trong bang users, cap nhat moi khi co review moi.

Chi hien diem khi co >= 3 danh gia. Hien 'Chua co danh gia' neu it hon.

## 4.3 Nguong tu dong theo diem uy tin

| **Tinh huong**                             | **Hanh dong he thong**                                                                                                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diem &lt; 3.0 sau khi co &gt;= 5 danh gia  | Gui email canh bao lan 1 khi diem xuong duoi 3.5. Neu tiep tuc giam: tu dong an tat ca SP (is_active = false) va gui email huong dan cai thien. Cho nghe nhan 7 ngay de phan hoi truoc khi admin review. |
| Diem &lt; 2.5 sau khi co &gt;= 10 danh gia | Tu dong tam khoa tai khoan (is_suspended = true). Tao ticket admin.                                                                                                                                      |
| Bi bao cao > 3 lan trong 30 ngay           | Tu dong tam khoa (is_suspended = true). Tao ticket admin.                                                                                                                                                |
| Huy don > 50% trong 30 ngay                | Giam thu tu hien thi tren feed (sort score x 0.5). Gui email canh bao.                                                                                                                                   |
| Dat >= 4.8 sao va >= 50 danh gia           | Tu dong gan badge verified_artisan = true. Hien tren ho so va bai dang.                                                                                                                                  |

# 5\. He thong Logistics

## 5.1 Lo trinh tich hop

| **Giai doan** | **Don vi** | **Tinh nang**                                                                | **Cach tich hop**                                                     |
| ------------- | ---------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| MVP           | Thu cong   | Nghe nhan nhap ma van don. Nguoi mua tu tra tren web GHN/GHTK.               | Khong can API. Chi luu truong tracking_code trong orders.             |
| Beta          | GHN API    | Tinh phi ship tu dong, tao van don trong app, tracking realtime qua webhook. | GHN Partner API. Sandbox test mien phi. Production: dang ky GHN Shop. |
| V1.0+         | GHN + GHTK | Nguoi mua chon don vi. So sanh phi ship. GHTK phu rong nong thon tot hon.    | GHTK API tuong tu GHN. Them 1 adapter interface cho moi don vi.       |

## 5.2 Tich hop GHN API (Beta+)

Cac API can goi:

- POST /shiip/public-api/v2/shipping-order/available-services - lay danh sach dich vu
- GET /shiip/public-api/v2/shipping-order/fee - tinh phi ship
- POST /shiip/public-api/v2/shipping-order/create - tao van don
- GET /shiip/public-api/v2/shipping-order/detail - xem chi tiet don
- POST /webhook - nhan cap nhat trang thai tu GHN

Cau hinh can thiet:

- GHN_TOKEN - API token tu GHN Shop
- GHN_SHOP_ID - Shop ID tren GHN
- GHN_WEBHOOK_SECRET - xac thuc webhook

## 5.3 Xu ly webhook GHN

- Nhan POST tu GHN vao /api/webhook/ghn
- Xac thuc: kiem tra header X-GHN-Signature (HMAC SHA-256) theo tai lieu GHN Partner API
- Parse event: status, order_code, timestamp
- Tim order tuong ung qua tracking_code
- Luu event vao bang order_tracking_events
- Cap nhat order.shipping_status tuong ung
- Phat Socket.io event den nguoi mua (neu online)
- Gui email thong bao (neu offline)
- Xu ly case giao that bai: sau 3 lan → cap nhat order.status = delivery_failed → thong bao 2 phia

# 6\. Kien truc & Cong nghe

_DA CAP NHAT so voi v1: Bo Supabase → PostgreSQL Docker tu quan ly. Bo Vercel/Railway/Upstash → VPS + Coolify. Giu nguyen Cloudinary, Resend, GHN, VNPay._

## 6.1 Phan loai cong nghe

| **Thanh phan** | **Quyet dinh** | **Cong nghe**                    | **Thay the cai gi**                      |
| -------------- | -------------- | -------------------------------- | ---------------------------------------- |
| Frontend       | Tu xay 100%    | Next.js 14 + TypeScript          | (khong thay doi)                         |
| Backend API    | Tu xay 100%    | NestJS + TypeScript              | (khong thay doi)                         |
| Database       | Tu host        | PostgreSQL 15 (Docker tren VPS)  | Bo Supabase                              |
| Cache          | Tu host        | Redis 7 (Docker tren VPS)        | Bo Upstash Redis                         |
| Reverse Proxy  | Tu host        | Nginx (Docker tren VPS)          | Bo Vercel edge routing                   |
| Host FE        | Tu host        | VPS + Coolify                    | Bo Vercel                                |
| Host BE        | Tu host        | VPS + Coolify                    | Bo Railway                               |
| File storage   | Giu Cloudinary | Cloudinary SDK v2                | Khong doi - khong dang tu xay            |
| Email          | Giu Resend     | Resend SDK v3                    | Khong doi - SMTP tu host de vao spam     |
| Van chuyen     | Giu GHN/GHTK   | GHN Partner API                  | Khong the tu xay - mang luoi vat ly      |
| Thanh toan     | Giu VNPay/MoMo | Payment API (Beta+)              | Khong the tu xay - can giay phep phap ly |
| Monitor        | Giu Sentry     | Sentry Free                      | Khong doi - self-host Sentry can 8GB RAM |
| CI/CD          | Tu xay         | GitHub Actions + Coolify Webhook | Bo pipeline Railway/Vercel               |

## 6.2 Stack cong nghe day du (da cap nhat)

| **Lop**            | **Cong nghe**                    | **Version**       | **Ghi chu**                                                                                                                                 |
| ------------------ | -------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend framework | Next.js                          | 14.x (App Router) | SSR/SSG/ISR. Server Components.                                                                                                             |
| Frontend language  | TypeScript                       | 5.x               | Strict mode. Shared types voi BE.                                                                                                           |
| Frontend styling   | Tailwind CSS                     | 3.x               | JIT mode. Custom theme.                                                                                                                     |
| State management   | Zustand                          | 4.x               | Chi cho global state (user, cart).                                                                                                          |
| Data fetching      | TanStack Query                   | 5.x               | Cache, refetch, optimistic updates.                                                                                                         |
| UI components      | shadcn/ui                        | Latest            | Tren Radix UI. Copy code vao du an.                                                                                                         |
| Backend framework  | NestJS                           | 10.x              | Module, Controller, Service, Guard.                                                                                                         |
| Backend language   | TypeScript                       | 5.x               | Chung types voi FE qua package noi bo.                                                                                                      |
| ORM                | Prisma                           | 5.x               | Type-safe. Migrations. Seeding.                                                                                                             |
| Database           | PostgreSQL                       | 15.x              | TU HOST qua Docker. Extension: pg_trgm, unaccent.                                                                                           |
| Cache              | Redis                            | 7.x               | TU HOST qua Docker. Session, rate limit, feed cache.                                                                                        |
| Real-time          | Socket.io                        | 4.x               | Namespace /chat va /notifications.                                                                                                          |
| Reverse Proxy      | Nginx                            | Alpine            | TU HOST qua Docker. Dieu huong FE/BE/WebSocket. SSL.                                                                                        |
| DB Admin (dev)     | Adminer                          | Latest            | TU HOST qua Docker. Giao dien web quan ly DB.                                                                                               |
| File storage       | Cloudinary                       | SDK v2            | Upload truc tiep tu FE bang signed URL.                                                                                                     |
| Email              | Resend                           | SDK v3            | Template HTML. 3000 email/thang mien phi.                                                                                                   |
| Auth               | NextAuth.js                      | 5.x (v5)          | 5.x (v5 / Auth.js) - co breaking changes so v4: session callback, middleware, OAuth config thay doi. Kiem tra docs Auth.js truoc khi setup. |
| PDF                | pdf-lib                          | 1.x               | Tao hop dong PDF phia BE.                                                                                                                   |
| Containerization   | Docker                           | 24.x              | Docker Compose cho local dev va production.                                                                                                 |
| Deploy             | Coolify                          | Latest            | Quan ly deploy tren VPS. Giao dien web giong Vercel.                                                                                        |
| CI/CD              | GitHub Actions + Coolify Webhook | Latest            | Push code → test → Coolify tu deploy.                                                                                                       |
| Monitoring         | Sentry                           | 7.x               | Frontend + Backend error tracking.                                                                                                          |

## 6.3 Cac bien moi truong (ENV) can thiet

| **Nhom**         | **Bien**                                                         | **Mo ta**                                                           |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Database         | DATABASE_URL                                                     | postgresql://user:pass@postgres:5432/langnghe_prod (Docker network) |
| Redis            | REDIS_URL                                                        | redis://redis:6379 (Docker network)                                 |
| Auth             | NEXTAUTH_SECRET, NEXTAUTH_URL                                    | JWT secret va URL chinh thuc cua app                                |
| OAuth (tuy chon) | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET                           | Google OAuth credentials                                            |
| Cloudinary       | CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Cloudinary credentials                                              |
| Email            | RESEND_API_KEY, EMAIL_FROM                                       | Resend API key va dia chi gui                                       |
| GHN (Beta+)      | GHN_TOKEN, GHN_SHOP_ID, GHN_WEBHOOK_SECRET                       | GHN Partner API credentials                                         |
| VNPay (Beta+)    | VNPAY_TMN_CODE, VNPAY_HASH_SECRET                                | VNPay sandbox/production credentials                                |
| App              | NEXT_PUBLIC_API_URL, NODE_ENV                                    | URL API public va moi truong                                        |
| Admin            | ADMIN_EMAIL                                                      | Email tai khoan admin duy nhat                                      |
| Monitor          | SENTRY_DSN                                                       | Sentry project DSN                                                  |

# 7\. Co so Du lieu - Cac Bang Chinh

_Day la schema tham khao. Cac bang co cot created_at, updated_at o moi bang. UUID la PK mac dinh._

## 7.1 Cac bang cot loi

| **Bang**              | **Truong chinh**                                                                                                                                                                                                                         | **Muc dich**                                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| users                 | id, email, phone, password_hash, wallet_balance, reputation_score, is_suspended, is_b2b_enabled, blockchain_wallet_address (nullable)                                                                                                    | Tai khoan nguoi dung. 1 bang cho tat ca role.                                                                                                                                                            |
| user_roles            | id, user_id (FK), role (ENUM: artisan/buyer/b2b/admin), is_active                                                                                                                                                                        | Role cua tung user. 1 user co nhieu role.                                                                                                                                                                |
| user_profiles         | id, user_id (FK), display_name, avatar_url, bio, village, specialty, experience_years, cccd_front_url, cccd_back_url, selfie_url, slug (UNIQUE)                                                                                          | Thong tin ho so hien thi.                                                                                                                                                                                |
| products              | id, artisan_id (FK), title, slug, description, category_id, price_retail, price_wholesale, quantity, version (optimistic lock), min_order_qty, is_active, is_b2b_available, free_shipping_threshold, blockchain_token_id (nullable)      | San pham cua nghe nhan.                                                                                                                                                                                  |
| product_images        | id, product_id (FK), url, is_primary, sort_order                                                                                                                                                                                         | Anh san pham (nhieu anh).                                                                                                                                                                                |
| product_tags          | id, product_id (FK), tag                                                                                                                                                                                                                 | Tag/nhan. Dung cho FTS.                                                                                                                                                                                  |
| categories            | id, name, slug, parent_id (nullable)                                                                                                                                                                                                     | Danh muc phan cap.                                                                                                                                                                                       |
| orders                | id, buyer_id (FK), artisan_id (FK), status (ENUM), payment_status, payment_method, shipping_address (JSONB), tracking_code, shipping_carrier, shipping_fee, subtotal, platform_fee, artisan_amount, notes, escrow_released_at (nullable) | Don hang. 1 don = 1 nguoi mua + 1 nghe nhan.                                                                                                                                                             |
| order_items           | id, order_id (FK), product_id (FK), quantity, price_at_time, product_snapshot (JSONB)                                                                                                                                                    | SP trong don. Snapshot de khong bi anh huong khi SP thay doi gia. product_snapshot JSONB phai chua: {title, primary_image_url, artisan_name, unit} - du de hien thi trong lich su don ma khong can join. |
| order_tracking_events | id, order_id (FK), status, description, happened_at, raw_webhook (JSONB)                                                                                                                                                                 | Lich su van chuyen tu webhook GHN/GHTK.                                                                                                                                                                  |
| custom_orders         | id, buyer_id (FK), artisan_id (FK), title, description, reference_images (TEXT\[\]), budget, deadline, status (ENUM), quoted_price, notes                                                                                                | Yeu cau lam hang rieng.                                                                                                                                                                                  |
| rfqs                  | id, buyer_id (FK), title, description, quantity, deadline, status (ENUM)                                                                                                                                                                 | Yeu cau bao gia B2B.                                                                                                                                                                                     |
| rfq_recipients        | id, rfq_id (FK), artisan_id (FK), status                                                                                                                                                                                                 | DS nghe nhan nhan RFQ.                                                                                                                                                                                   |
| rfq_quotes            | id, rfq_id (FK), artisan_id (FK), price, lead_time, notes, visible_at                                                                                                                                                                    | Bao gia. An den khi het han.                                                                                                                                                                             |
| b2b_orders            | id, rfq_id (FK), buyer_id (FK), artisan_id (FK), status, production_percent, contract_id (FK)                                                                                                                                            | Don si sau khi ky hop dong.                                                                                                                                                                              |
| production_updates    | id, b2b_order_id (FK), percent, note, photos (TEXT\[\]), estimated_done                                                                                                                                                                  | Cap nhat tien do san xuat.                                                                                                                                                                               |
| contracts             | id, b2b_order_id (FK), pdf_url, pdf_hash (SHA-256), buyer_signed_at, artisan_signed_at, status                                                                                                                                           | Hop dong dien tu.                                                                                                                                                                                        |
| reviews               | id, order_id (FK), reviewer_id (FK), reviewee_id (FK), reviewer_role, rating, rating_quality, rating_accuracy, rating_shipping, rating_communication, rating_payment, comment, photos (TEXT\[\]), is_visible, seller_reply, visible_at   | Danh gia 2 chieu.                                                                                                                                                                                        |
| conversations         | id, last_message_at --- quan he qua bang conversation_participants(conversation_id, user_id) de query hieu qua                                                                                                                           | Cuoc hoi thoai.                                                                                                                                                                                          |
| messages              | id, conversation_id (FK), sender_id (FK), content, read_at (TIMESTAMP NULL), created_at                                                                                                                                                  | Tin nhan.                                                                                                                                                                                                |
| notifications         | id, user_id (FK), type (ENUM), title, body, data (JSONB), is_read                                                                                                                                                                        | Thong bao trong app.                                                                                                                                                                                     |
| restock_notifications | id, user_id (FK), product_id (FK) - UNIQUE(user_id, product_id)                                                                                                                                                                          | Dang ky thong bao co hang.                                                                                                                                                                               |
| user_follows          | id, follower_id (FK), followee_id (FK) - UNIQUE(follower_id, followee_id)                                                                                                                                                                | Follow nghe nhan.                                                                                                                                                                                        |
| wallet_transactions   | id, user_id (FK), type, amount, balance_after, reference_id, reference_type, note                                                                                                                                                        | Lich su giao dich vi.                                                                                                                                                                                    |
| withdrawal_requests   | id, artisan_id (FK), amount, bank_name, bank_account, status, processed_at                                                                                                                                                               | Yeu cau rut tien.                                                                                                                                                                                        |
| disputes              | id, order_id (FK), opener_id (FK), reason, evidence_urls (TEXT\[\]), status (ENUM: open/resolved/rejected), admin_note, resolved_at, resolution (ENUM: refund_buyer/release_seller/partial)                                              | Khieu nai don hang. Append-only log kem theo.                                                                                                                                                            |
| feature_flags         | id, name (UNIQUE), is_enabled, description                                                                                                                                                                                               | Bat/tat tinh nang khong can deploy.                                                                                                                                                                      |
| admin_logs            | id, admin_id (FK), action, target_type, target_id, note                                                                                                                                                                                  | Log hanh dong admin (append-only).                                                                                                                                                                       |
| otp_codes             | id, phone_or_email, code_hash, purpose (ENUM), expires_at, used_at, attempt_count                                                                                                                                                        | OTP xac minh.                                                                                                                                                                                            |

# 8\. API - Cac Endpoint Chinh

_RESTful API. Base URL: /api/v1. Xac thuc bang Bearer JWT token trong Authorization header. Phan trang bang ?page=1&limit=20._

## 8.1 Auth

| **Method** | **Endpoint**     | **Mo ta**                           | **Auth**               |
| ---------- | ---------------- | ----------------------------------- | ---------------------- |
| POST       | /auth/register   | Dang ky tai khoan moi + gui OTP     | Public                 |
| POST       | /auth/verify-otp | Xac minh OTP dang ky                | Public                 |
| POST       | /auth/login      | Dang nhap bang email/SDT + password | Public                 |
| POST       | /auth/refresh    | Lam moi access token                | Refresh token (cookie) |
| POST       | /auth/logout     | Huy token                           | User                   |
| GET        | /auth/me         | Lay thong tin user hien tai         | User                   |

## 8.2 San pham

| **Method** | **Endpoint**                 | **Mo ta**                         | **Auth**        |
| ---------- | ---------------------------- | --------------------------------- | --------------- |
| GET        | /products                    | Danh sach SP co loc va phan trang | Public (SSR)    |
| GET        | /products/:slug              | Chi tiet SP                       | Public (SSR)    |
| POST       | /products                    | Tao SP moi                        | Artisan         |
| PATCH      | /products/:id                | Cap nhat SP                       | Artisan (owner) |
| DELETE     | /products/:id                | Xoa SP (soft delete)              | Artisan (owner) |
| PATCH      | /products/:id/stock          | Cap nhat ton kho                  | Artisan (owner) |
| POST       | /products/:id/restock-notify | Dang ky thong bao co hang         | Buyer           |

## 8.3 Don hang

| **Method** | **Endpoint**         | **Mo ta**                                                                                                 | **Auth**           |
| ---------- | -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| POST       | /orders              | Tao don hang (co the nhieu don tu 1 gio hang)                                                             | Buyer              |
| GET        | /orders              | Danh sach don cua user (mua hoac ban)                                                                     | User               |
| GET        | /orders/:id          | Chi tiet don                                                                                              | User (participant) |
| PATCH      | /orders/:id/confirm  | Nghe nhan xac nhan don                                                                                    | Artisan            |
| PATCH      | /orders/:id/ship     | Cap nhat ma van don / tao van don GHN                                                                     | Artisan            |
| PATCH      | /orders/:id/complete | Nguoi mua xac nhan nhan hang                                                                              | Buyer              |
| PATCH      | /orders/:id/cancel   | Huy don hang (chi khi con o pending_payment hoac confirmed). Buyer hoac Artisan deu co the huy kem ly do. | User (participant) |
| POST       | /orders/:id/dispute  | Mo khieu nai                                                                                              | Buyer              |
| GET        | /orders/:id/tracking | Lich su van chuyen                                                                                        | User (participant) |

## 8.4 Danh gia, Chat, Thong bao

| **Method** | **Endpoint**                | **Mo ta**                       | **Auth**           |
| ---------- | --------------------------- | ------------------------------- | ------------------ |
| POST       | /reviews                    | Tao danh gia cho don hoan thanh | User (participant) |
| POST       | /reviews/:id/reply          | Nghe nhan tra loi danh gia      | Artisan (reviewee) |
| GET        | /users/:id/reviews          | Danh gia cua 1 user             | Public             |
| GET        | /conversations              | Danh sach cuoc hoi thoai        | User               |
| POST       | /conversations              | Tao cuoc hoi thoai moi          | User               |
| GET        | /conversations/:id/messages | Lay tin nhan (co phan trang)    | User (participant) |
| GET        | /notifications              | Danh sach thong bao             | User               |
| PATCH      | /notifications/read-all     | Danh dau tat ca da doc          | User               |

## 8.5 B2B va Quan tri

| **Method** | **Endpoint**             | **Mo ta**                        | **Auth**           |
| ---------- | ------------------------ | -------------------------------- | ------------------ |
| POST       | /rfqs                    | Tao RFQ bao gia                  | B2B                |
| POST       | /rfqs/:id/quote          | Nghe nhan gui bao gia            | Artisan            |
| POST       | /b2b-orders              | Tao don B2B sau khi chon bao gia | B2B                |
| GET        | /b2b-orders/:id/contract | Lay hop dong PDF                 | User (participant) |
| POST       | /b2b-orders/:id/sign     | Ky hop dong bang OTP             | User (participant) |
| PATCH      | /b2b-orders/:id/progress | Cap nhat tien do san xuat        | Artisan            |
| GET        | /admin/stats             | Thong ke tong san                | Admin              |
| GET        | /admin/disputes          | Danh sach khieu nai              | Admin              |
| PATCH      | /admin/disputes/:id      | Xu ly khieu nai                  | Admin              |
| GET        | /admin/withdrawals       | Danh sach yeu cau rut tien       | Admin              |
| PATCH      | /admin/withdrawals/:id   | Duyet/tu choi rut tien           | Admin              |

# 9\. Bao mat & Chong gian lan

## 9.1 Xac thuc & Phan quyen

- JWT: access token (15 phut) + refresh token (30 ngay). Luu refresh token trong HttpOnly cookie.
- RBAC: Guard kiem tra role truoc moi controller method. Middleware chay truoc moi request.
- Resource ownership: Moi API endpoint kiem tra user co quyen voi resource cu the hay khong (khong chi role).
- Rate limiting: Nginx rate limit theo IP. NestJS ThrottleGuard theo user. Gioi han: 300 req/phut cho GET public (tranh chot SEO crawler), 60 req/phut cho POST/PATCH/DELETE public, 500 req/phut cho authenticated. Endpoint nhanh cam nhu /auth/login gioi han rieng: 10 lan/phut/IP.

## 9.2 Bao ve du lieu

- SQL injection: Prisma ORM su dung parameterized queries - an toan mac dinh.
- XSS: sanitize input o BE (class-sanitizer). Content-Security-Policy header o Nginx.
- CSRF: SameSite=Strict cookie. Origin check. CORS chi cho phep domain chinh.
- File upload: Chi chap nhan JPEG/PNG/WEBP. Kiem tra MIME type that su (khong chi extension). Upload qua Cloudinary signed URL - khong qua BE server.
- Password: bcrypt cost factor 12. Khong luu plain text. Yeu cau: toi thieu 8 ky tu.

## 9.3 Chong gian lan giao dich

- Optimistic locking: Truong version trong bang products. Cap nhat: UPDATE ... WHERE version = X AND quantity >= Y → neu 0 rows → rollback.
- Idempotency: Moi request tao don co idempotency_key. Neu trung → tra ve ket qua cu, khong tao them.
- Webhook xac thuc: GHN webhook phai co HMAC SHA-256 header hop le. Tu choi neu sai.
- OTP: Het han 5 phut. Toi da 3 lan thu sai → block 30 phut. Khong cho dung lai OTP cu.
- Log day du: Moi hanh dong tai chinh, ky hop dong, khieu nai deu co audit log khong the xoa (append-only).

# 10\. Cau truc Thu muc Du an

## 10.1 Frontend (Next.js App Router)

**Cau truc thu muc goi y:**

src/

app/ # App Router (Next.js 14)

(auth)/ # Nhom route: dang ky, dang nhap

dang-ky/page.tsx

dang-nhap/page.tsx

(main)/ # Nhom route: trang chinh

feed/page.tsx

san-pham/\[slug\]/page.tsx # /san-pham/\[slug\] - SSR

nghe-nhan/\[slug\]/page.tsx

gio-hang/page.tsx

dat-hang/page.tsx

don-hang/page.tsx

b2b/rfq/page.tsx

dashboard/page.tsx # Dashboard theo role

tin-nhan/page.tsx

admin/page.tsx # /admin (chi superadmin)

api/auth/\[...nextauth\]/route.ts

components/

ui/ # shadcn/ui components

layout/ # Header, Footer, Sidebar

feed/ # PostCard, FeedFilters, FeedList

product/ # ProductCard, ProductGallery

order/ # OrderCard, OrderTimeline

review/ # ReviewForm, ReviewCard, StarRating

chat/ # ChatWindow, MessageBubble

cart/ # CartDrawer, CartItem

b2b/ # RFQForm, QuoteCard, ContractViewer

lib/

api.ts # Axios/Fetch client

socket.ts # Socket.io client singleton

auth.ts # NextAuth config

utils.ts # Format tien, ngay, slug

hooks/

useAuth.ts

useCart.ts

useSocket.ts

store/ # Zustand stores

authStore.ts

cartStore.ts

types/ # TypeScript types dung chung

## 10.2 Backend (NestJS)

src/

modules/

auth/ # Dang ky, dang nhap, JWT

users/ # User profile, roles, reputation

products/ # CRUD san pham, ton kho, FTS

orders/ # Don hang B2C, trang thai, escrow

custom-orders/ # Yeu cau lam hang rieng

b2b/ # RFQ, bao gia, don si

contracts/ # Hop dong OTP + PDF + SHA-256

reviews/ # Danh gia 2 chieu, diem uy tin

logistics/ # GHN API, webhook van chuyen

chat/ # Socket.io gateway, messages

notifications/ # Thong bao trong app + email

wallet/ # Vi so du, rut tien (Beta+)

search/ # PostgreSQL FTS (pg_trgm)

admin/ # Thong ke, tranh chap, quan ly

webhooks/ # GHN, VNPay webhook

common/

guards/ # RolesGuard, OwnershipGuard

decorators/ # @CurrentUser(), @Roles()

filters/ # HttpExceptionFilter

interceptors/ # Logging, transform response

pipes/ # ValidationPipe

prisma/

schema.prisma # Dinh nghia cac bang DB

migrations/ # Lich su thay doi schema

seed.ts # Du lieu mau dev

main.ts

app.module.ts

# 11\. Moi truong & Deploy

_DA CAP NHAT so voi v1: Bo Vercel/Railway/Supabase/Upstash → Tat ca tu host tren VPS bang Docker + Coolify._

## 11.1 Moi truong local (dev) - Docker Compose

Tat ca service chay tren laptop bang 1 lenh. Khong can internet (ngoai tru Cloudinary/Resend).

_Cai dat truoc: Docker Desktop (docker.com/products/docker-desktop), Node.js 20 LTS, Git._

**File docker-compose.yml:**

services:

postgres:

image: postgres:15-alpine

environment:

POSTGRES_USER: langnghe

POSTGRES_PASSWORD: langnghe123

POSTGRES_DB: langnghe_dev

ports: \['5432:5432'\]

volumes: \[postgres_data:/var/lib/postgresql/data\]

healthcheck:

test: \['CMD-SHELL', 'pg_isready -U langnghe'\]

redis:

image: redis:7-alpine

command: redis-server --appendonly yes

ports: \['6379:6379'\]

volumes: \[redis_data:/data\]

adminer:

image: adminer:latest

ports: \['8080:8080'\] # Chi dung khi dev

backend:

build: { context: ./backend, dockerfile: Dockerfile.dev }

ports: \['3001:3001'\]

volumes: \['./backend:/app', '/app/node_modules'\]

environment:

DATABASE_URL: postgresql://langnghe:langnghe123@postgres:5432/langnghe_dev

REDIS_URL: redis://redis:6379

env_file: .env

depends_on: { postgres: { condition: service_healthy } }

frontend:

build: { context: ./frontend, dockerfile: Dockerfile.dev }

ports: \['3000:3000'\]

volumes: \['./frontend:/app', '/app/node_modules', '/app/.next'\]

env_file: .env

depends_on: \[backend\]

nginx:

image: nginx:alpine

ports: \['80:80'\]

volumes: \['./nginx/nginx.local.conf:/etc/nginx/nginx.conf:ro'\]

depends_on: \[frontend, backend\]

volumes:

postgres_data:

redis_data:

**File nginx/nginx.local.conf:**

events { worker_connections 1024; }

http {

upstream frontend { server frontend:3000; }

upstream backend { server backend:3001; }

server {

listen 80;

location /api/ { proxy_pass <http://backend>; ... }

location /socket.io/ {

proxy_pass <http://backend>;

proxy_http_version 1.1;

proxy_set_header Upgrade \$http_upgrade;

proxy_set_header Connection 'upgrade';

}

location / { proxy_pass <http://frontend>; ... }

}

}

**Cac lenh hay dung:**

| **Lenh**                                                  | **Tac dung**                 |
| --------------------------------------------------------- | ---------------------------- |
| docker-compose up --build                                 | Chay va build lan dau        |
| docker-compose up -d                                      | Chay nen (background)        |
| docker-compose down                                       | Tat tat ca service           |
| docker-compose logs -f backend                            | Xem log BE realtime          |
| docker exec langnghe_be npx prisma migrate dev            | Chay migration               |
| docker exec langnghe_be npx prisma studio                 | Mo Prisma Studio xem DB      |
| docker exec langnghe_be npx prisma db seed                | Chay du lieu mau             |
| docker exec -it langnghe_db psql -U langnghe langnghe_dev | Vao PostgreSQL terminal      |
| docker exec -it langnghe_redis redis-cli                  | Vao Redis CLI                |
| docker-compose down -v                                    | Tat va reset toan bo du lieu |

## 11.2 Cai dat du an lan dau

- Tao thu muc: mkdir lang-nghe && cd lang-nghe
- Tao Frontend: npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
- Tao Backend: npm i -g @nestjs/cli && nest new backend
- Tao file docker-compose.yml va nginx/nginx.local.conf
- Cai Prisma: cd backend && npm i prisma @prisma/client && npx prisma init
- Chay docker: cd .. && docker-compose up --build
- Migrate DB: docker exec langnghe_be npx prisma migrate dev --name init
- Truy cap: <http://localhost> (app) · <http://localhost:8080> (Adminer quan ly DB)

## 11.3 Demo truoc khi deploy that - Cloudflare Tunnel

Khi muon cho nguoi khac xem thu tu laptop (khong can deploy):

- Cai dat: winget install Cloudflare.cloudflared (Windows) hoac brew install cloudflare/cloudflare/cloudflared (Mac)
- Chay app local truoc (docker-compose up)
- Tao tunnel: cloudflared tunnel --url <http://localhost>
- Nhan link dang <https://abc-xyz.trycloudflare.com> - chia se link cho nguoi dung

_Laptop tat = link chet. Chi dung cho demo nhanh, khong dung cho nguoi dung that._

## 11.4 Deploy production - VPS + Coolify (\$12-20/thang)

Thay the Vercel + Railway + Supabase + Upstash bang 1 VPS duy nhat.

### Buoc 1 - Chon VPS

| **Nha cung cap** | **Goi**       | **Cau hinh**               | **Chi phi** |
| ---------------- | ------------- | -------------------------- | ----------- |
| DigitalOcean     | Basic Droplet | 2 vCPU, 2GB RAM, 60GB SSD  | \$12/thang  |
| Vultr            | Cloud Compute | 2 vCPU, 2GB RAM, 55GB SSD  | \$12/thang  |
| Contabo          | VPS S SSD     | 4 vCPU, 8GB RAM, 100GB SSD | ~\$7/thang  |

_Chon Ubuntu 22.04 LTS. 2GB RAM du cho MVP nhung can theo doi sat - Next.js SSR + NestJS + PostgreSQL + Redis co the dung 1.5GB+. Tat Adminer tren production (port 8080 chi mo khi can). Nang cap len 4GB khi traffic tang._

### Buoc 2 - Cai dat VPS lan dau

- SSH vao VPS: ssh root@your-vps-ip
- Cap nhat: apt update && apt upgrade -y
- Cai Docker: curl -fsSL <https://get.docker.com> | sh
- Cai Docker Compose: apt install docker-compose-plugin -y
- Cai Coolify: curl -fsSL <https://cdn.coollabs.io/coolify/install.sh> | bash
- Tro ten mien ve IP VPS (A record trong DNS)
- Coolify tu dong cai SSL mien phi (Let's Encrypt)

### Buoc 3 - Deploy qua Coolify

- Mo trinh duyet: <http://your-vps-ip:8000> → dang nhap Coolify
- Ket noi GitHub repo cua ban
- Tao Resources: Frontend (Next.js), Backend (NestJS), PostgreSQL, Redis
- Them ENV variables vao tung service qua Coolify dashboard
- Moi lan push code len main → Coolify tu dong pull va re-deploy

### Nginx Production - them HTTPS

server {

listen 80;

server_name langnghe.vn <www.langnghe.vn>;

return 301 https://\$server_name\$request_uri;

}

server {

listen 443 ssl http2;

ssl_certificate /etc/letsencrypt/live/langnghe.vn/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/langnghe.vn/privkey.pem;

add_header X-Frame-Options DENY;

add_header X-Content-Type-Options nosniff;

\# ... cac location nhu local ...

}

## 11.5 CI/CD - GitHub Actions + Coolify Webhook

**File .github/workflows/deploy.yml:**

name: Deploy to VPS

on:

push:

branches: \[main\]

jobs:

deploy:

runs-on: ubuntu-latest

steps:

\- uses: actions/checkout@v4

\- uses: actions/setup-node@v4

with: { node-version: '20' }

\- name: Run Backend Tests

run: cd backend && npm ci && npm run test

\- name: Run Frontend Type Check

run: cd frontend && npm ci && npm run type-check

\- name: Notify Coolify Deploy

run: curl -X GET '\${{ secrets.COOLIFY_WEBHOOK_URL }}'

_Them COOLIFY_WEBHOOK_URL vao GitHub Secrets. Lay URL nay tu Coolify dashboard cua tung service._

## 11.6 Backup database tu dong

Chay backup moi ngay luc 2h sang (cron job tren VPS):

\# Them vao crontab: crontab -e

0 2 \* \* \* docker exec langnghe*db pg_dump -U langnghe langnghe_prod | gzip > /backups/db*\$(date +%Y%m%d).sql.gz

0 3 \* \* \* find /backups -name '\*.sql.gz' -mtime +7 -delete

_Nen copy backup len noi khac. Khuyen nghi: dung rclone sync len Cloudflare R2 hoac Backblaze B2 (chi phi thap, ~\$0.006/GB/thang). Cai rclone: apt install rclone, cau hinh credentials, them vao crontab: 0 4 \* \* \* rclone sync /backups r2:langnghe-backups. Neu VPS hong thi mat ca backup neu chi luu tren VPS._

# 12\. Lo trinh Phat trien

## 12.1 MVP - Thang 1 den 3

| **Tuan** | **Cong viec ky thuat**                                                                                   | **Ket qua kiem tra**                                                            |
| -------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1        | Setup: Docker Compose (PG+Redis+Nginx+Adminer), folder structure, ESLint, Prettier, Prisma schema        | docker-compose up → FE+BE+DB+Redis chay, Adminer xem duoc DB tai localhost:8080 |
| 2        | Auth: dang ky + OTP (Resend) + dang nhap + JWT (access+refresh) + RBAC guard                             | POST /auth/register → nhan OTP email, /auth/login → nhan JWT                    |
| 3        | Ho so: tao profile, upload anh (Cloudinary signed URL), slug SEO, trang nghe-nhan/\[slug\] SSR           | Trang /nghe-nhan/\[slug\] load duoc, co meta tag SEO                            |
| 4        | San pham: CRUD + anh + tag + FTS (pg_trgm + unaccent) + trang san-pham/\[slug\] SSR                      | Tim kiem tieng Viet co dau hoat dong, trang SP co SEO                           |
| 5        | Feed: hien thi SP, loc, sap xep, infinite scroll. Gio hang (localStorage + DB khi dang nhap).            | Feed hien dung, gio hang giu sau khi refresh                                    |
| 6        | Dat hang: tao don (tach theo nghe nhan, optimistic lock ton kho), tinh phi ship thu cong, email xac nhan | 2 SP tu 2 nghe nhan → 2 don rieng, ton kho tru dung, email gui thanh cong       |
| 7        | Trang thai don: timeline cap nhat, logistics thu cong (nhap ma van don), 7 ngay tu dong xac nhan         | Nguoi mua thay lich su don, nghe nhan nhap duoc ma van don                      |
| 8        | Danh gia: mo sau completed, an den khi ca 2 xong, tinh diem uy tin, nguong tu dong                       | Danh gia hien dung, diem tinh theo cong thuc, SP tu an khi < 3.0                |
| 9        | Chat: Socket.io, luu lich su, bieu tuong dang go, thong bao tin nhan moi                                 | Tin nhan toi < 1 giay, thong bao hien khi co tin moi                            |
| 10       | B2B: RFQ (co thoi han), bao gia an den het han, hop dong OTP + PDF + SHA-256                             | Ky hop dong bang OTP hoat dong, hash luu vao DB va co the verify                |
| 11       | Dashboard 3 role, Admin co ban, nguong tu dong (an SP, tam khoa), Custom Order co ban                    | Admin xem duoc thong ke, co the khoa user                                       |
| 12       | Fix bug, SEO audit, Cloudflare Tunnel test voi nguoi dung that, deploy len VPS + Coolify                 | Co link https:// that chay 24/7, SSL hop le, 5 nguoi dung cung luc OK           |

## 12.2 Beta - Thang 4 den 6

- Logistics GHN: tich hop API (tinh phi, tao van don tu dong, webhook tracking realtime)
- Thanh toan VNPay hoac MoMo Sandbox → Production
- Soft Escrow: giu tien sau khi thanh toan, giai ngan khi hoan thanh
- Vi so du nghe nhan: tich luy tu don, admin duyet rut tien
- BullMQ cho email batch va webhook GHN bat dong bo
- Feed ca nhan hoa co ban (theo danh muc da xem, nghe nhan da follow)
- Custom Order voi escrow
- SEO nang cao: Sitemap, structured data (JSON-LD), Open Graph

## 12.3 V1.0 - Thang 7 den 9

- Them GHTK (don vi van chuyen thu 2 - phu rong nong thon tot hon)
- Rut tien tu dong bang VietQR API - loai bo buoc admin duyet
- Blockchain: bat feature flag blockchain_enabled → ProductNFT, ArtisanID tren Polygon
- Toi uu hieu suat: cache Redis cho feed, phan tich query cham, them index neu can

## 12.4 Mo rong - Thang 10+

- Them nhom nguoi dung moi (neu co nhu cau thuc te)
- Da ngon ngu Viet/Anh (next-intl)
- AI goi y SP (collaborative filtering don gian bang PostgreSQL)
- Zalo ZNS them vao kenh thong bao (khong thay the email)
- Bao cao thi truong: ban insights xu huong thu cong cho doanh nghiep

_Dac ta Ky thuat v2.0 - Day du tat ca 12 chuong tu ban goc. Chi chinh sua chuong 6 (cong nghe) va chuong 11 (deploy): bo Supabase/Vercel/Railway, thay bang PostgreSQL Docker + VPS + Coolify. Giu nguyen Cloudinary, Resend, GHN, VNPay._