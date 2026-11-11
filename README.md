# Gia Dụng Thông Minh 3AE - Brand Guidelines & Design System v2.0

> **Hệ thống nhận diện thương hiệu & Design System toàn diện cho Gia Dụng Thông Minh 3AE.**  
> Thiết kế theo tiêu chuẩn công nghiệp: Tinh giản, Đẳng cấp công nghệ, Nhất quán đa nền tảng và Sẵn sàng cho Graphic Designer & Developer.

---

## 📌 Tổng Quan Hệ Thống

| Hạng mục | Tài liệu / File liên quan | Mô tả |
| :--- | :--- | :--- |
| **Brand Guidelines Master** | [`BRAND_GUIDELINES.md`](./BRAND_GUIDELINES.md) | Bộ quy chuẩn cốt lõi: Sứ mệnh, Tính cách thương hiệu, Logo rules, Bảng màu, Typography & Tone of Voice |
| **Interactive Design System Portal** | [`design-system.html`](./design-system.html) | Cổng thông tin tương tác: Tokens, Foundation Cards, Components, UI Kit Storefront |
| **Brand Guide Web Specimen** | [`brand.html`](./brand.html) | Bản mẫu hiển thị nhận diện trực quan cho web và in ấn |
| **Design System Core** | [`designs/giadungthongminh-design-system/`](./designs/giadungthongminh-design-system/) | CSS Tokens, Component JSX/TypeScript, Specimen Cards, Storefront UI Kit |
| **Graphic Design Workspace** | [`Graphic Design/`](./Graphic%20Design/) | Thư mục phân chia không gian làm việc cho Graphic Designer (Logo, Banners, Social, POSM) |

---

## 🎨 Design Tokens

- **Màu sắc cốt lõi:**
  - `Brand Primary`: `#0066CC` (Tech Blue - Đáng tin cậy, thông minh, đổi mới)
  - `Brand Secondary`: `#FF6B00` (Energy Orange - Năng động, trải nghiệm, ấm cúng)
  - `Accent Gold`: `#D4AF37` (Chất lượng cao, bảo hành, cam kết cao cấp)
  - `Neutral Dark`: `#1E293B` (Văn bản chính, nền tối sang trọng)
  - `Neutral Light`: `#F8FAFC` (Nền sáng thanh lịch, bảo vệ mắt)
- **Typography:**
  - Font chuẩn: `Inter`, `-apple-system`, `sans-serif`
  - Tỉ lệ phân cấp (Modular Scale: 1.25): Display (40px) $\to$ H1 (32px) $\to$ H2 (24px) $\to$ H3 (20px) $\to$ Body (16px) $\to$ Small (13px).
- **Spacing:** Hệ thống 4-point / 8-point (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).

---

## 🧩 Cấu Trúc Thành Phần (Components)

Các thành phần được đóng gói đầy đủ code, định kiểu và tài liệu:
- **Button:** [`components/Button`](./designs/giadungthongminh-design-system/components/Button/) (`Primary`, `Secondary`, `Outline`, `Ghost` với 3 kích thước `sm`, `md`, `lg`)
- **Badge:** [`components/Badge`](./designs/giadungthongminh-design-system/components/Badge/) (`Hot`, `Sale`, `New`, `Tech`, `Success`, `Warning`)
- **Header:** [`components/Header`](./designs/giadungthongminh-design-system/components/Header/) (Thanh điều hướng responsive, menu danh mục, thanh tìm kiếm, giỏ hàng)
- **ProductCard:** [`components/ProductCard`](./designs/giadungthongminh-design-system/components/ProductCard/) (Thẻ sản phẩm thông minh chuẩn E-commerce)

---

## 🚀 Hướng Dẫn Trải Nghiệm & Xem Trực Tiếp

### Cách 1: Mở trực tiếp trên trình duyệt
Click đúp chuột hoặc kéo thả các file sau vào trình duyệt:
- [`design-system.html`](./design-system.html)
- [`brand.html`](./brand.html)

### Cách 2: Chạy Local HTTP Server
Trong thư mục dự án, chạy lệnh PowerShell:
```powershell
python -m http.server 8080
# hoặc
npx serve -l 8080
```
Sau đó truy cập: [http://localhost:8080/design-system.html](http://localhost:8080/design-system.html)

---

## 🛠 Hướng Dẫn Cho Graphic Designer

Toàn bộ các tài nguyên và hướng dẫn quy chuẩn cho thiết kế được lưu tại:
- [`Graphic Design/HUONG_DAN_CHO_GRAPHIC_DESIGN.md`](./Graphic%20Design/HUONG_DAN_CHO_GRAPHIC_DESIGN.md)
- Không gian làm việc được phân mục rõ ràng:
  - `Graphic Design/01_Logo_Master/`: File vector logo gốc, lưới an toàn, quy chuẩn nền.
  - `Graphic Design/02_Social_Media/`: Template banner Facebook, TikTok, Zalo OA (tỉ lệ 1:1, 16:9, 9:16).
  - `Graphic Design/03_E-Commerce_Banners/`: Banner sàn TMĐT Shopee, Lazada, Haravan.
  - `Graphic Design/04_POSM_Showroom/`: Standee, catalogue in ấn, sticker bảo hành.

---

&copy; 2026 Gia Dụng Thông Minh 3AE. All rights reserved.
