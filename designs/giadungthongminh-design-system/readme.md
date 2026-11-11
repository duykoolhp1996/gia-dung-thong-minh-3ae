# Gia Dụng Thông Minh Design System

> **Hệ thống thiết kế & Brand System chuẩn mực của Gia Dụng Thông Minh 3AE (GĐTM)**  
> Phiên bản: 2.0 (Authoring format chuẩn `baoyu-design`)  
> Nền tảng: Thương mại điện tử thiết bị gia dụng & Smarthome chính hãng tại Việt Nam

---

## 1. TỔNG QUAN THƯƠNG HIỆU & BỐI CẢNH (CONTEXT)
- **Tên thương hiệu**: Gia Dụng Thông Minh 3AE (Gia Dụng Thông Minh / GĐTM)
- **Lĩnh vực hoạt động**: Phân phối thiết bị nhà thông minh (Hunonic Việt Nam), gia dụng dinh dưỡng & đời sống tiện ích (Gaabor, Masuto, Kostcor).
- **Sứ mệnh**: *"Đơn giản hóa việc nhà, bảo vệ sức khỏe và nâng tầm chuẩn sống cho hàng triệu gia đình Việt thông qua công nghệ thông minh, dễ tiếp cận và bền bỉ."*
- **Slogan chủ đạo**: **"Nhẹ gánh việc nhà, Nhờ nhà thông minh"**
- **Khẩu hiệu bảo chứng**: **"Sản phẩm chính hãng — Xuất VAT đầy đủ — Bảo hành toàn diện"**

---

## 2. CONTENT FUNDAMENTALS (NGUYÊN TẮC NỘI DUNG)
- **Giọng điệu (Tone of Voice)**: Chân thành, gần gũi, đáng tin cậy và hướng dẫn tận tình (The Helpful Companion & Smart Creator).
- **Xưng hô**: Xưng `3AE` hoặc `Gia Dụng Thông Minh`, gọi khách hàng là `Anh/Chị`, `Gia đình mình`.
- **Nguyên tắc chuyển đổi thuật ngữ**:
  - Không nói thuật ngữ kỹ thuật khó hiểu đơn thuần (Ví dụ: `BLDC 110.000 RPM`, `Air-flow 65m/s`).
  - Luôn quy đổi sang lợi ích đời sống thực tế: *"Động cơ phản lực sấy khô tóc chỉ trong 3 phút, bảo vệ nang tóc không bị xơ rối"*.
- **Cam kết pháp lý & dịch vụ**: Mọi điểm chạm đều gắn liền với thông điệp: `100% Chính Hãng — Xuất VAT Đầy Đủ — Bảo Hành Điện Tử 1 Đổi 1`.

---

## 3. VISUAL FOUNDATIONS (NỀN TẢNG THỊ GIÁC)

### 3.1. Bảng màu Nhận diện (Color System)
- **Brand Primary (`#FCD10C`)**: Vàng công nghệ rực rỡ, tượng trưng cho ánh sáng và năng lượng tiện nghi của tổ ấm. Sử dụng cho Top announcement bar, logo, nút CTA chính và các điểm nhấn tương tác.
- **Brand Dark (`#000000`)**: Đen tuyền công nghệ, làm nền cho Main Navbar, Footer, mang lại chiều sâu tương phản tuyệt đối và cảm giác đẳng cấp.
- **Surface Canvas (`#F8FAFC`)**: Trắng xám dịu mắt, chống mỏi mắt khi lướt xem hàng trăm sản phẩm.
- **Surface Raised (`#FFFFFF`)**: Nền thẻ sản phẩm, dropdown menu, khung tìm kiếm bo tròn.
- **Verified Green (`#10B981`)**: Bảo chứng hàng chính hãng 100%, sẵn kho.
- **Promo Red (`#EF4444`)**: Flash sale, % giảm giá, cảnh báo an toàn điện.
- **Tech Blue (`#0284C7`)**: Xuất hóa đơn VAT, kết nối WiFi IoT, tài liệu kỹ thuật.
- **Tỷ lệ thị giác**: Quy tắc **60% Nền tảng** (`#FFFFFF` / `#F8FAFC`) - **30% Cấu trúc** (`#000000` / `#0F172A`) - **10% Kích hoạt thị giác** (`#FCD10C`).

### 3.2. Hệ thống Typography
- **Tiêu đề (Display / Headings)**: **Plus Jakarta Sans** (Weights: 700 Bold, 800 ExtraBold, 900 Black). Nét chữ hình học hiện đại, khỏe khoắn, công nghệ.
- **Văn bản & Bảng số liệu (Body / Data)**: **Inter** (Weights: 400 Regular, 500 Medium, 600 SemiBold). Tối ưu khả năng đọc trên màn hình số và hiển thị số tiền rõ ràng.

### 3.3. Hình khối, Bo góc & Đổ bóng (Shapes, Radius & Elevation)
- **Pill Radius (`9999px`)**: Dành riêng cho ô tìm kiếm trung tâm `[ Bạn tìm gì hôm nay? 🔍 ]`, các tag cam kết chính hãng, chip danh mục nhanh và nút gọi hotline.
- **Card Radius (`16px`)**: Bo góc mềm mại cho khung thẻ sản phẩm (Product Card), banner quảng cáo, hộp quà tặng.
- **Button Radius (`10px`)**: Bo góc cân đối cho các nút bấm hành động và ô nhập liệu form.
- **Shadows**:
  - Tĩnh: `0 1px 3px rgba(15, 23, 42, 0.06)`.
  - Tương tác (Hover): `0 10px 15px -3px rgba(15, 23, 42, 0.1)` kết hợp `transform: translateY(-2px)`.

---

## 4. ICONOGRAPHY (HỆ THỐNG BIỂU TƯỢNG)
- **Phong cách**: Line stroke đồng nhất **2.0px**, đầu mút bo tròn (**Round Cap & Join**).
- **Thư viện SVG lưu trữ tại**: `assets/Icons/`
  - `cart.svg`: Giỏ hàng mua sắm
  - `search.svg`: Kính lúp tìm kiếm
  - `heart.svg`: Danh sách yêu thích
  - `user.svg`: Tài khoản người dùng
  - `menu.svg`: Menu danh mục 3 gạch
- **Logo Vector tại**: `assets/Logos/`
  - `logo-full.svg`: Logo bản ngang hoàn chỉnh (Mái nhà + Monogram GĐTM + Wordmark giadungthongminh)
  - `logo-mark.svg`: Biểu tượng Monogram độc lập (cho App icon, Favicon, Watermark)

---

## 5. MỤC LỤC THƯ MỤC & TÀI SẢN (MANIFEST INDEX)

```
designs/giadungthongminh-design-system/
├── styles.css                 # File CSS gốc kết nối toàn bộ tokens
├── readme.md                  # Hướng dẫn chi tiết hệ thống thiết kế
├── SKILL.md                   # File khai báo Skill theo chuẩn baoyu-design
├── preview.html               # Trang xem trước toàn diện một file
├── index.html                 # Trang tổng quan tương tác trực tiếp
├── tokens/                    # Khai báo CSS Custom Properties
│   ├── colors.css             # Mã màu Core, Neutral, Semantic
│   ├── typography.css         # Thang phông chữ, line-height
│   ├── spacing.css            # Thang khoảng cách 4px-80px
│   └── elevation.css          # Bo góc & hệ thống đổ bóng
├── assets/                    # Tài nguyên hình ảnh, logo, icon
│   ├── Logos/                 # logo-full.svg, logo-mark.svg
│   └── Icons/                 # cart.svg, search.svg, user.svg...
├── guidelines/                # Foundation Cards (@dsCard)
│   ├── brand-philosophy.card.html
│   ├── brand-colors.card.html
│   ├── semantic-colors.card.html
│   ├── typography.card.html
│   ├── radius-elevation.card.html
│   └── co-branding.card.html
├── components/                # React UI Primitives
│   ├── Button/                # Button.jsx, Button.d.ts, Button.prompt.md, preview.html
│   ├── Badge/                 # Badge.jsx, Badge.d.ts, Badge.prompt.md, preview.html
│   ├── Header/                # Header.jsx, Header.d.ts, Header.prompt.md, preview.html
│   └── ProductCard/           # ProductCard.jsx, ProductCard.d.ts, ProductCard.prompt.md, preview.html
└── ui_kits/                   # Màn hình giao diện hoàn chỉnh
    └── storefront/            # index.html (Trang chủ cửa hàng trực tuyến)
```

---

## 6. HƯỚNG DẪN TÍCH HỢP CHO LẬP TRÌNH VIÊN & DESIGNER
1. **Liên kết CSS**: Nhúng `styles.css` và `components/bundle.css` vào ứng dụng web của bạn.
2. **Sử dụng React Components**: Import trực tiếp từ thư mục `components/` với đầy đủ gợi ý TypeScript types.
3. **Quy tắc Co-branding**: Khi đặt logo 3AE cạnh đối tác (Hunonic, Gaabor, Masuto), luôn dùng vạch phân cách `#CBD5E1` có chiều cao bằng 60% logo và giữ tỷ lệ diện tích 1:1.
