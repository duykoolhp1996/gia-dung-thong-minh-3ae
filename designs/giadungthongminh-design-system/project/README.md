# Gia Dụng Thông Minh — Design System & Brand Book

**Gia Dụng Thông Minh (GĐTM)** là hệ thống nhận diện và ngôn ngữ thiết kế giao diện số dành riêng cho nền tảng thương mại điện tử thiết bị gia dụng công nghệ cao tại Việt Nam.

Hệ thống thiết kế kết hợp sự **sang trọng, hiện đại của tông đen công nghệ** với **sự nổi bật, năng lượng và nhiệt huyết của sắc vàng thương hiệu**, mang lại trải nghiệm mua sắm đáng tin cậy, thông minh và thân thiện cho hàng triệu gia đình.

---

## 1. Giá trị Cốt lõi & Tính cách Thương hiệu (Brand Values & Voice)

| Giá trị | Ý nghĩa | Ứng dụng trong Giao diện |
|---|---|---|
| **Thông minh (Smart)** | Tối ưu hóa trải nghiệm tìm kiếm, so sánh thông số kỹ thuật và đặt hàng. | Thanh tìm kiếm pill bo tròn nổi bật, gợi ý thông minh, bộ lọc thông số trực quan. |
| **Minh bạch & Chính hãng** | Khẳng định 100% hàng chính hãng, đầy đủ hóa đơn VAT và bảo hành điện tử. | Banner trên cùng màu vàng thương hiệu với tag cam kết `● Sản phẩm chính hãng - Xuất VAT đầy đủ`. |
| **Độ tin cậy cao (Reliable)** | Giao dịch an toàn, thông tin rõ ràng, giá bán công khai minh bạch. | Tương phản màu sắc đạt chuẩn WCAG AA, số tiền và khuyến mãi định dạng rõ nét. |
| **Tiện lợi & Tốc độ** | Mua hàng nhanh chóng trong 3 bước, giỏ hàng luôn hiển thị sẵn sàng. | Nút kêu gọi hành động (CTA) vàng rực rỡ thu hút thị giác ngay từ cái nhìn đầu tiên. |

---

## 2. Bảng màu Nhận diện (Color Philosophy)

### Màu chủ đạo (Brand Core Colors)
- **Brand Primary (`#FCD10C`)**: Vàng công nghệ rực rỡ, biểu trưng cho ánh sáng tiện nghi của ngôi nhà thông minh và cam kết năng lượng. Sử dụng cho top announcement bar, logo thương hiệu, nút CTA chính và các điểm nhấn tương tác.
- **Brand Dark (`#000000`)**: Đen tuyền công nghệ, làm nền cho thanh điều hướng chính (Main Navbar), tạo chiều sâu tương phản tuyệt đối và cảm giác đẳng cấp.
- **Surface Canvas (`#F8FAFC`)**: Trắng xám dịu mắt, giúp người dùng lướt sản phẩm lâu mà không mỏi mắt.
- **Surface Raised (`#FFFFFF`)**: Nền thẻ sản phẩm, dropdown menu, thanh tìm kiếm bo tròn.

### Màu Trạng thái (Semantic Colors)
- **Chính hãng / In-stock (`#10B981`)**: Xanh ngọc lục bảo chứng thực hàng sẵn kho, chính hãng 100%.
- **Khuyến mãi / Giảm sốc (`#EF4444`)**: Đỏ tươi cho nhãn giảm giá %, flash sale và thông báo khẩn.
- **Hóa đơn VAT / Trợ giúp (`#0284C7`)**: Xanh dương thông tin kỹ thuật, xuất VAT doanh nghiệp.

---

## 3. Hệ thống Typography

Phông chữ định hướng: **Plus Jakarta Sans** kết hợp **Inter** (hỗ trợ tiếng Việt đầy đủ và tối ưu hiển thị số liệu):
- **Display (36px / 44px - Bold 700)**: Dành cho tiêu đề Banner chính, Hero section.
- **Heading XL (28px / 36px - Bold 700)**: Tiêu đề danh mục sản phẩm nổi bật.
- **Heading LG / MD (22px / 18px - SemiBold 600)**: Tên sản phẩm, tiêu đề widget.
- **Body & Controls (14px - Regular / Medium 500)**: Nội dung mô tả, thanh điều hướng, input tìm kiếm.
- **Caption & Badges (12px - Medium 500)**: Thông tin cam kết, tag chính hãng, VAT.
- **Price Large (20px - Bold 700)**: Giá bán khuyến mãi nổi bật.

---

## 4. Hệ thống Bo góc & Đổ bóng (Radius & Elevation)
- **Pill (radius-full: 9999px)**: Dành riêng cho ô tìm kiếm trung tâm `Bạn tìm gì hôm nay?`, các chip danh mục nhanh và nút gọi hotline.
- **Card & Container (radius-lg: 16px / radius-md: 10px)**: Bo góc mềm mại cho khung sản phẩm, banner phụ kiện.
- **Elevation**: Đổ bóng nhẹ nhàng nhiều lớp tạo cảm giác sản phẩm nổi bật nhẹ trên bề mặt nền canvas.

---

## 5. Quy chuẩn Thanh Header (Theo chuẩn tham chiếu)
1. **Dải Banner Vàng trên cùng (Top Announcement Bar)**:
   - Chiều cao: 28px – 32px.
   - Màu nền: `#FCD10C`.
   - Nội dung trung tâm: Chip tròn đen kèm thông điệp `● Sản phẩm chính hãng - Xuất VAT đầy đủ`.
2. **Thanh Điều hướng Đen (Main Navigation Bar)**:
   - Chiều cao: 56px – 64px.
   - Màu nền: `#000000`.
   - Bên trái: Logo GĐTM kèm chữ `giadungthongminh` màu vàng `#FCD10C` + Menu `☰ Danh mục`.
   - Ở giữa: Ô tìm kiếm bo tròn pill trắng `#FFFFFF`, placeholder `Bạn tìm gì hôm nay?` kèm icon kính lúp.
   - Bên phải: Các nút tiện ích văn bản + icon màu trắng gồm: `♡ Yêu thích`, `👤 Đăng nhập`, `🛒 Giỏ hàng`.
