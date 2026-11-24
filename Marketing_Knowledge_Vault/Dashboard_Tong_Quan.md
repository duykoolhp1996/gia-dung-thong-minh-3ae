---
type: dashboard
title: "Trung Tâm Điều Hành Tri Thức & Báo Cáo Marketing 3AE"
updated_at: 2026-11-24
tags:
  - marketing/dashboard
  - knowledge-base
---

# 🌟 TRUNG TÂM TRI THỨC & DỮ LIỆU MARKETING - GIA DỤNG 3AE

Chào mừng team Marketing đến với Kho Tri Thức Tập Trung! Đây là nơi lưu trữ toàn bộ tài liệu chiến lược, kịch bản nội dung, dữ liệu báo cáo và kết nối tự động giữa 4 phòng ban: **Ecom - Digital - MarCom - CSKH**.

---

## 📌 1. Lối Tắt Nhanh (Quick Links)
- 🏛️ [[01_Brand_DNA/Brand_Guidelines_3AE|Bộ Nhận Diện & Định Vị Thương Hiệu 3AE]]
- 👩 [[02_Personas/Chan_Dung_Khach_Hang_Gia_Dung|Chân Dung Khách Hàng (Persona - Chị Lan)]]
- 📑 [[99_Templates/Template_Campaign_Brief|Mẫu Lập Kế Hoạch Chiến Dịch (Campaign Brief)]]
- 🎬 [[99_Templates/Template_Content_Script|Mẫu Viết Kịch Bản Video TikTok/Reels]]
- 📈 [[99_Templates/Template_Weekly_Report|Mẫu Báo Cáo Hiệu Suất Tuần]]
- ⚙️ [[Huong_Dan_Ket_Noi_Trich_Xuat_Du_Lieu|Hướng Dẫn Kết Nối & Trích Xuất Dữ Liệu Tự Động]]

---

## 🚀 2. Bảng Theo Dõi Chiến Dịch Đang Chạy (Campaign Tracker)

*(Khi bạn cài plugin **Dataview**, bảng bên dưới sẽ tự động lấy dữ liệu từ các file trong thư mục `03_Campaigns/` mà không cần nhập tay)*

```dataview
TABLE status AS "Trạng Thái", department AS "Phòng Ban", budget_vnd AS "Ngân Sách (đ)", actual_revenue_vnd AS "Doanh Thu Đạt (đ)", target_roas AS "Target ROAS"
FROM "03_Campaigns"
WHERE type = "campaign"
SORT start_date DESC
```

### 📋 Bảng Dữ Liệu Tĩnh Dự Phòng (Static Fallback Table):
| Tên Chiến Dịch | Trạng Thái | Phòng Ban | Ngân Sách | Doanh Thu | ROAS | Link Chi Tiết |
|---|---|---|---|---|---|---|
| **Mega Sale Tết: Bếp Ấm Đoàn Viên** | 🟡 Đang chạy | MarCom | 120,000,000 đ | 265,000,000 đ | 5.88x | [[03_Campaigns/2026_Q4_Mega_Sale_Tet\|Xem]] |
| **Black Friday: Đổi Mới Căn Bếp** | 🟢 Hoàn thành | Digital | 80,000,000 đ | 412,000,000 đ | 5.25x | [[03_Campaigns/2026_Q4_Black_Friday\|Xem]] |

---

## 💡 3. Nguyên Tắc Quản Trị Tri Thức Của Team (Team Best Practices)
1. **Mọi file đều phải có Frontmatter**: Giúp các script Python / Dataview dễ dàng trích xuất dữ liệu tự động.
2. **Liên kết 2 chiều (`[[Tên_File]]`)**: Khi nhắc đến sản phẩm, chiến dịch hay nhân sự, hãy dùng cú pháp `[[...]]` để tạo mạng lưới đồ thị tri thức (Graph View).
3. **Đồng bộ qua Git**: Định kỳ Commit & Push lên GitHub/GitLab của công ty để cả team cùng cập nhật tri thức mới nhất.
