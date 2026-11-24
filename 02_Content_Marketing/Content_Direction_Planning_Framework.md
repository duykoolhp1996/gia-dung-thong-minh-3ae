# KHUNG THIẾT KẾ BẢNG ĐỊNH HƯỚNG KẾ HOẠCH NỘI DUNG (CONTENT DIRECTION & PLANNING FRAMEWORK)
## DỰ ÁN: GIA DỤNG THÔNG MINH 3AE

> **Bản chất của bảng này:** Hoàn toàn tách biệt khỏi Bảng Quản lý Vận hành/Task hàng ngày. Bảng này được thiết kế chuyên biệt cho việc **TƯ DUY CHIẾN LƯỢC, TÌM GÓC TIẾP CẬN (ANGLES), LÊN Ý TƯỞNG & HOẠCH ĐỊNH NỘI DUNG (PLANNING)**, nhưng vẫn liên kết dữ liệu tự động với Kho Sản Phẩm Mẫu và Kênh truyền thông.

---

## I. SO SÁNH: FILE QUẢN LÝ VẬN HÀNH vs BẢNG ĐỊNH HƯỚNG KẾ HOẠCH

```
┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
│   BẢNG QUẢN LÝ TÁC VỤ (EXECUTION TRACKER)    │       │  BẢNG ĐỊNH HƯỚNG KẾ HOẠCH (CONTENT DIRECTION) │
│       (Ví dụ: '✍️ Content Calendar')          │       │           (PLANNING & STRATEGY)              │
├──────────────────────────────────────────────┤       ├──────────────────────────────────────────────┤
│ • Tập trung vào: VẬN HÀNH & TIẾN ĐỘ          │       │ • Tập trung vào: CHIẾN LƯỢC & Ý TƯỞNG        │
│ • Đối tượng dùng: Content, Editor, Designer  │       │ • Đối tượng dùng: Trưởng phòng, Content Lead │
│ • Các cột điển hình:                         │       │ • Các cột điển hình:                         │
│   - Người nhận việc                          │       │   - Chiến dịch / Tuần / Chủ đề lớn           │
│   - Ngày nộp bài / Lịch đăng (Air date)      │       │   - Mã SKU liên kết (Kéo KSP & Link Drive)   │
│   - Trạng thái: Đang viết -> Chờ duyệt...    │       │   - Kênh đích & Tệp khán giả mục tiêu        │
│   - Link kịch bản nộp bài                    │       │   - Insight / Nỗi đau đời sống               │
│   - Feedback chỉnh sửa của Trưởng phòng      │       │   - Góc tiếp cận (Content Angle & Concept)   │
│                                              │       │   - Hook 3 giây đầu (Thị giác & Lời thoại)   │
│                                              │       │   - Định dạng sáng tạo (Format)              │
│                                              │       │   - Mục tiêu CTA & Trạng thái Kế hoạch       │
└──────────────────────────────────────────────┘       └──────────────────────────────────────────────┘
```

---

## II. CẤU TRÚC CHI TIẾT BẢNG CONTENT DIRECTION & PLANNING

Bảng kế hoạch được chia thành **5 Phân vùng chức năng (14 Cột chuẩn chiến lược)**:

```
┌──────────────────┬─────────────────────────────┬───────────────────────────┬──────────────────────────────────────────┬────────────────────────┐
│ 1. THỜI ĐIỂM     │ 2. SẢN PHẨM & TƯ LIỆU       │ 3. ĐỊNH HƯỚNG KÊNH        │ 4. CHIẾN LƯỢC SÁNG TẠO (TRỌNG TÂM PLAN) │ 5. DUYỆT & CHUYỂN GIAO │
│  (Sprint/Theme)  │  (Auto-link Kho Mẫu)        │  (Audience & Channel)     │    (Angle, Hook, Format, CTA)            │    (Handoff to Task)   │
└──────────────────┴─────────────────────────────┴───────────────────────────┴──────────────────────────────────────────┴────────────────────────┘
```

### Chi tiết 14 Cột dữ liệu chuyên biệt cho việc Lập Kế hoạch:

| STT | Tên Cột (Column Name) | Loại dữ liệu / Cách hoạt động | Mục đích & Ý nghĩa trong việc Lên kế hoạch |
| :---: | :--- | :--- | :--- |
| **1** | **Chiến Dịch / Tuần (Sprint/Week)** | Text / Dropdown (VD: `Tuần 46`, `Chiến dịch 12.12`, `Tết 2027`) | Nhóm các ý tưởng theo từng giai đoạn truyền thông để không bị rời rạc. |
| **2** | **Chủ Đề Tuần (Weekly Big Theme)** | Text (VD: *"Giải phóng gian bếp - Nấu nhàn ăn ngon"*, *"An toàn điện mùa nồm ẩm"*) | Định vị sợi chỉ đỏ xuyên suốt của toàn bộ video/bài viết trong tuần đó. |
| **3** | **Mã SKU Sản Phẩm (Liên kết Kho)** | **Dropdown chọn từ `📦 Quản Lý Sản Phẩm Mẫu (MKT)`** | Chọn mã SKU đang có sẵn trong kho để lên kế hoạch. |
| **4** | **Tên Sản Phẩm & KSP Cốt Lõi** | **Công thức tự động:** `=VLOOKUP(SKU, 'Quản Lý Sản Phẩm Mẫu'!B:Q, 16, FALSE)` | Tự động hiển thị tên và tính năng ăn tiền nhất mà không cần gõ lại. |
| **5** | **Kho Tư Liệu MKT (Drive Link)** | **Công thức tự động:** `=VLOOKUP(SKU, 'Quản Lý Sản Phẩm Mẫu'!B:R, 17, FALSE)` | Tự động kéo link folder Drive ảnh/video gốc để Editor lấy ngay. |
| **6** | **Kênh Xuất Bản Mục Tiêu** | Dropdown liên kết từ `📱 Kênh Nền Tảng` | Chọn kênh phù hợp: TikTok Master, Kênh Bếp, Kênh Smarthome, Chanh Quất... |
| **7** | **Trụ Cột Nội Dung (Pillar)** | Dropdown: `1. Đời sống & Hài hước`, `2. Thực nghiệm KSP`, `3. Mẹo vặt How-To`, `4. So kèo giá trị` | Đảm bảo tỷ lệ phân bổ nội dung cân bằng (40-30-20-10). |
| **8** | **Insight & Nỗi Đau Khách Hàng (Pain Point)** | Text (VD: *"Đi làm về muộn, ngán ngẩm cảnh vừa đứng nấu vừa canh trào bọt"* hoặc *"Hay quên đóng cửa cuốn khi ra ngoài"*) | Điểm chạm tâm lý đắt giá nhất kích thích người xem dừng lại xem tiếp. |
| **9** | **Góc Tiếp Cận (Content Angle & Concept)** | Text (Ý tưởng cốt lõi của kịch bản, tình huống mở đầu, cốt truyện) | Định hình câu chuyện kịch bản trước khi viết chi tiết. |
| **10** | **Đề Xuất Hook 3 Giây Đầu** | Text (Câu giật tít thị giác & thính giác mở màn) | Quyết định tỷ lệ giữ chân người xem trong 3s đầu (Hook Rate > 60%). |
| **11** | **Định Dạng Sáng Tạo (Format)** | Dropdown: `Comedy Skit (Tiểu phẩm)`, `Split Screen (So sánh)`, `ASMR Cận cảnh`, `POV Trải nghiệm`, `Test dã man (Stress test)` | Định hướng phong cách quay dựng cho Media Editor. |
| **12** | **Mục Tiêu Điều Hướng (CTA Target)** | Dropdown: `Click Giỏ hàng Affiliate`, `Follow kênh nhận cẩm nang`, `Lưu clip để nấu sau`, `Inbox tư vấn giải pháp` | Định hướng câu chốt cuối video để đo lường chuyển đổi. |
| **13** | **Trạng Thái Kế Hoạch (Planning Status)** | Dropdown: `💡 Đang Brainstorm`, `⏳ Chờ TP duyệt Kế hoạch`, `✅ Đã duyệt Kế hoạch`, `🚀 Đã đẩy sang Content Calendar` | Vòng đời của một ý tưởng chiến lược. |
| **14** | **Người Phụ Trách Kịch Bản (PIC)** | Dropdown chọn từ `👥 Quản Lý Tài Khoản Nhân Sự` (Mỵ, Phụng...) | Giao nhân sự viết kịch bản chi tiết sau khi kế hoạch được duyệt. |

---

## III. DỮ LIỆU MẪU MÔ PHỎNG (MINH HỌA THỰC TẾ)

| Tuần | Chủ Đề Tuần | Mã SKU | KSP Tự Động Kéo Sang | Kênh Mục Tiêu | Insight / Nỗi Đau | Góc Tiếp Cận (Angle) | Hook 3s Đề Xuất | Format | CTA Target | Trạng Thái Kế Hoạch |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **T46** | *Đại tiệc lẩu nướng tại gia* | `MKT-MASUTO-MULTICOOK` | 2 khay lẩu nướng độc lập, 2 núm chỉnh nhiệt riêng, chống dính dễ rửa | Kênh Bếp Mẹ Bỉm Healthy | Cuối tuần muốn ăn cả lẩu lẫn nướng nhưng ngại bày bừa 2 bếp cồng kềnh | Thử thách làm bữa tiệc 2 in 1 trong 30 phút rảnh tay | *"Đừng rủ bạn bè về nhà ăn lẩu nếu chưa biết trợ thủ này!"* | POV Trải nghiệm + ASMR | Click Giỏ hàng Affiliate | `✅ Đã duyệt Kế hoạch` |
| **T46** | *An toàn điện thông minh* | `MKT-HUNONIC-DOOR` | Đóng mở cửa cuốn từ xa qua điện thoại, cảnh báo cửa mở | Kênh Smarthome Review | Nỗi sợ đãng trí ra ngoài quên đóng cửa cuốn hoặc trộm cạy cửa | Tình huống hú vía đi du lịch phát hiện cửa cuốn chưa đóng và xử lý 1 chạm | *"Cả nhà đi chơi xa nhưng hú vía vì chiếc cửa cuốn..."* | Comedy Skit + Demo App | Click Link Giỏ hàng | `✅ Đã duyệt Kế hoạch` |
| **T46** | *Kiểm chứng thực tế* | `MKT-MASUTO-PRIMEAIR12` | Dung tích 12L quay nướng gà nguyên con, kính cường lực quan sát | Kênh Chanh Quất Thông Minh | Nghi ngờ nồi chiên nướng gà bị sống bên trong, cháy bên ngoài | Đập hộp test nướng nguyên con gà 2.5kg kiểm chứng độ chín vàng | *"Bỏ hơn 2 củ mua nồi chiên 12L: Đáng tiền hay phí tiền?"* | Test dã man + Bóc phốt | Click Giỏ hàng Shop mẹ | `💡 Đang Brainstorm` |

---

## IV. CƠ CHẾ LIÊN KẾT 2 CHIỀU GIỮA BẢNG KẾ HOẠCH & FILE QUẢN LÝ HIỆN TẠI

```
                     ┌──────────────────────────────────────────────────────────┐
                     │     📦 BẢNG QUẢN LÝ SẢN PHẨM MẪU (DATABASE KHO)          │
                     │     (Mã SKU, Tên, KSP, Giá, Link Drive tư liệu...)       │
                     └────────────────────────────┬─────────────────────────────┘
                                                  │
                                                  │ (Tự động kéo KSP & Drive qua VLOOKUP)
                                                  ▼
                     ┌──────────────────────────────────────────────────────────┐
                     │     🎯 BẢNG CONTENT DIRECTION & PLANNING (KẾ HOẠCH)       │
                     │     • Lên chủ đề tuần, chọn góc Angle, chọn Hook 3s       │
                     │     • Định hình kịch bản & phân bổ kênh                   │
                     │     • Trưởng phòng duyệt Kế hoạch: "ĐÃ DUYỆT"             │
                     └────────────────────────────┬─────────────────────────────┘
                                                  │
                                                  │ (Kích hoạt chuyển giao sang Vận hành)
                                                  ▼
                     ┌──────────────────────────────────────────────────────────┐
                     │     ✍️ BẢNG CONTENT CALENDAR (VẬN HÀNH TÁC VỤ HÀNG NGÀY) │
                     │     • Sinh ra Task mới: Lịch đăng, PIC viết kịch bản      │
                     │     • Quy trình duyệt kịch bản, quay dựng, nghiệm thu     │
                     └──────────────────────────────────────────────────────────┘
```

---

## V. ĐỀ XUẤT LỰA CHỌN TRIỂN KHAI

Bạn muốn triển khai bảng này theo hình thức nào:

- **Lựa chọn 1 (Tất cả trong 1 - Khuyên dùng):** Tạo thêm 1 Tab mới có tên là **`🎯 Content Direction & Planning`** ngay bên trong file Google Sheets hiện tại (`1dI_z3TzLBmMgPmRICya6aVyqyw18qdgPitmsw2in5ac`).  
  *Ưu điểm:* Dễ dàng dùng công thức Excel liên kết trực tiếp giữa các tab, không bị giới hạn phân quyền.
- **Lựa chọn 2 (File Kế hoạch độc lập):** Tạo hẳn một Google Spreadsheet mới chuyên biệt về **`Content Direction & Chiến Lược Nội Dung 3AE`**, sau đó đồng bộ dữ liệu với file Quản Lý Vận Hành.  
  *Ưu điểm:* Tách bạch 100% không gian làm việc giữa cấp Quản lý (Lên kế hoạch) và cấp Nhân viên (Vận hành tác vụ).
