(() => {
  'use strict';

  /**
   * 100% VERBATIM source cells from sheet_data.json ("Chọn Sạc dự phòng").
   * Every single character, punctuation mark, and newline is preserved untouched.
   */
  const SHEET_CELLS = {
    A2: "Lõi pin chiếm khoảng 40%–60% giá thành một cục sạc dự phòng",
    A4: "A. Chọn loại cell nào?",
    A5: "Cell Li-Polymer (Pin túi / 聚合物电芯 — VD mã phổ biến: 1260110, 955565):",
    A6: "Ưu điểm: Mỏng, nhẹ, dễ làm thiết kế đẹp (bắt buộc cho sạc MagSafe và sạc 10.000mAh mỏng).",
    A7: "Nhược điểm: Rất dễ bị phồng pin sau 6–12 tháng nếu là cell kém chất lượng hoặc sạc/xả ở nhiệt độ cao.",
    A9: "Cell Li-Ion hình trụ (18650 & 21700)",
    A10: "18650: Bền, giá rẻ, khó phồng, nhưng kích thước dày và nặng. Phù hợp phân khúc giá mềm, nồi đồng cối đá.\n21700: Mật độ năng lượng cao, xả dòng lớn, tuổi thọ chu kỳ sạc tốt. Là lựa chọn số 1 cho phân khúc trung – cao cấp và sạc nhanh 45W–140W (các hãng cell tốt: EVE, BAK, Lishen, Sunpower, ATL).",
    A12: "Cell bán rắn (Semi-solid state / 半固态电芯):",
    A13: "Xu hướng nổi lên mạnh từ 2025–2026 do tiêu chuẩn an toàn cháy nổ siết chặt. Ít sinh nhiệt, chống đâm thủng/cháy nổ tốt hơn, giá cao hơn 20–30%, rất tốt làm điểm nhấn marketing (USP).",
    A15: "3 cấp độ cell pin trong xưởng Trung Quốc (Cần biết để không bị tráo)",
    A17: "A品 (Hàng loại A mới 100%): Cell mới xuất xưởng từ nhà máy lớn (ATL, BYD, CosMX, EVE, Lishen, BAK, Sunwoda...), nội trở đồng đều, có mã QR/mã lô trên thân cell.\nB品 / 次品 (Loại B): Hàng lỗi ngoại quan nhẹ hoặc hụt dung lượng một chút, giá rẻ hơn 15–25%.\n拆机 / 梯次 (Cell tháo máy / tái chế): Xưởng nhỏ thu mua pin cũ về bọc lại vỏ nhựa mới. Dùng 1–2 tháng là tụt áp, phồng rộp. Nếu bạn ép giá quá sát sàn, 90% xưởng nhỏ sẽ nhét loại này vào.",
    A19: "B. Chọn bo mạch (PCBA) & Chip sạc",
    A21: "Bo mạch quyết định tốc độ sạc, mức độ tỏa nhiệt và tỷ lệ lỗi bảo hành (chết cổng sạc, báo phần trăm pin ảo).",
    A23: "Chip (IC) uy tín tại Thâm Quyến: Ưu tiên yêu cầu xưởng dùng chip từ các hãng lớn như Injoinic (英集芯 — dòng IP5328P, IP5356, IP5389...), IsSmartWare (智融 — dòng SW6206, SW6306...), hoặc Southchip (南芯 — cho dòng công suất cao 65W–140W).",
    A25: "4 chi tiết kỹ thuật buộc phải yêu cầu trên mạch:\nCảm biến nhiệt NTC (热敏电阻): Phải dán áp sát trực tiếp vào thân cell pin để tự ngắt/giảm dòng khi quá nhiệt. Xưởng giá rẻ cực hay cắt bỏ hoặc để hờ cho có.\nMạch bảo vệ độc lập (Bảo vệ quá sạc, quá xả, quá dòng, ngắn mạch).\nChân cắm & Dây tích hợp: Nếu bán dòng có dây tích hợp (Type-C / Lightning), bắt buộc hỏi rõ độ bền gập dây (nên chọn dây dù bện hoặc TPE dày) và cổng cắm chịu lực tốt.\nVới sạc không dây MagSafe: Bắt buộc yêu cầu cuộn dây đồng nguyên chất (纯铜线圈) (tránh dây nhôm mạ đồng gây cực nóng máy), tấm chắn từ tính dày, và vòng nam châm N52 lực hút mạnh (tối thiểu 10N–13N).",
    A27: "C. Chọn vỏ (Shell / Casing) & Bài toán khuôn mẫu",
    A29: "Chất liệu vỏ",
    A30: "Nhựa ABS + PC chống cháy chuẩn UL94 V-0 (防火V0级): Tiêu chuẩn bắt buộc nếu bạn muốn làm hàng bền, an toàn và đạt chuẩn xuất xưởng 3C. Không bắt lửa khi chập mạch.\nNhựa ABS thường / nhựa tái chế: Giá rẻ, cầm nhẹ tay, dễ vỡ giòn khi rơi và bắt lửa nhanh.\nVỏ hợp kim nhôm (铝合金): Sang trọng, tản nhiệt rất tốt (hợp dòng sạc laptop 65W–140W), nhưng giá thành và trọng lượng cao, dễ trầy và không làm được mặt lưng sạc không dây.\nVỏ trong suốt (PC chống ố vàng): Từng rất hot, nhưng vì lộ ruột nên yêu cầu cell pin và mối hàn bên trong phải làm đẹp, sạch sẽ (đẩy chi phí gia công lên)",
    A32: "Hoàn thiện bề mặt",
    A34: "Nhám sần tự nhiên từ khuôn (晒纹 / VDI texture): Bền, khó trầy, ít bám vân tay, chi phí tối ưu nhất.\nPhủ dầu cao su mềm (手感漆 / Rubber oil): Lúc mới sờ rất mịn và sang, nhưng loại sơn rẻ tiền sau 6–12 tháng ở khí hậu nóng ẩm Việt Nam rất dễ bị nhớp tay, dính bụi và bong tróc. Nếu chọn phải yêu cầu sơn cao cấp chống lão hóa.",
    A36: "Khuôn chung (公模) vs Khuôn riêng (私模)",
    A38: "Công mô (公模 - Khuôn có sẵn của xưởng): Không mất tiền làm khuôn, MOQ thấp (100–500 cái là nhận in logo OEM). Nhược điểm: Dễ đụng mẫu với shop khác trên sàn TMĐT. Cách khắc phục là phối màu vỏ lạ mắt, thiết kế bao bì đẹp và nâng cấp linh kiện bên trong.\nTư mô (私模 - Mở khuôn độc quyền): Chi phí thiết kế + làm khuôn nhựa từ 30.000 – 100.000+ NDT (~100–350 triệu VNĐ), MOQ lớn (3.000–10.000 cái). Chỉ nên làm khi đã có doanh số ổn định và muốn bảo vệ thiết kế độc quyền.",
    A40: "D. Làm việc với các cửa hàng & xưởng gia công Trung Quốc (OEM / ODM)",
    A41: "Hơn 80% chuỗi cung ứng sạc dự phòng toàn cầu nằm ở Thâm Quyến (Shenzhen) — tập trung tại các quận Bảo An (宝安), Long Hoa (龙华), Long Cương (龙岗) — và Đông Quản (Dongguan",
    A43: "Nhà máy OEM/ODM bài bản (源头实力工厂)",
    A45: "Đặc điểm: Có dây chuyền gắn chip SMT hoặc hợp tác trực tiếp nhà máy cell, có phòng lab test lão hóa (Aging test - 老化测试), test rơi rớt, chứng nhận đầy đủ. MOQ thường từ 500–3.000 cái/SKU.\nNên dùng khi: Xác định làm thương hiệu riêng lâu dài, bán số lượng ổn định.",
    A47: "E. Tiêu chuẩn vàng mới từ 2025–2026: Chứng nhận 3C (CCC)",
    A48: "Giữa năm 2025, sau làn sóng sự cố cháy nổ pin và thu hồi diện rộng, Trung Quốc đã siết cực chặt quy định chứng nhận bắt buộc 3C (CCC) đối với sạc dự phòng (thậm chí cấm mang sạc không có 3C rõ nét lên máy bay nội địa Trung Quốc).",
    A50: "Lợi ích khi chọn xưởng có 3C thật: Để có giấy 3C còn hiệu lực (không bị đình chỉ), model đó bắt buộc phải vượt qua kiểm định nhà nước TQ về vỏ chống cháy V0, mạch bảo vệ chuẩn và cell pin có nguồn gốc rõ ràng.\nMẹo lọc xưởng: Hãy yêu cầu xưởng gửi bản scan giấy chứng nhận 3C của model bạn định làm và kiểm tra mã số chứng nhận đó có đúng tên nhà máy và còn trạng thái \"Hiệu lực\" (有效) hay không. Tránh tuyệt đối các xưởng in logo 3C giả lên vỏ.",
    A52: "F. Quy trình 5 bước làm việc với xưởng gia công để KHÔNG bị lừa",
    A53: "Chốt bảng cấu hình (BOM) bằng văn bản trong hợp đồng/PO: Đừng chỉ nói \"làm cho tôi cục 10.000mAh sạc nhanh loại tốt\". Hãy ghi rõ:",
    A54: "\nCell pin: Loại gì (Li-Po / 21700), hãng nào, loại A mới 100%, dung lượng thực tế (mAh / Wh).\nPCBA: Mã IC chính (VD: IP5356), công suất thực Input/Output từng cổng, bắt buộc có NTC.\nVỏ: Chất liệu ABS+PC V0, hoàn thiện bề mặt, cách ghép vỏ (hàn siêu âm hay ngàm).",
    A56: "Đặt mẫu (Sample) và bắt buộc \"Mổ bụng\" (Teardown",
    A57: "Mua 2–3 mẫu về. Giữ 1 mẫu nguyên để test, cạy/đập mở 1 mẫu ra kiểm tra ruột: xem mã in trên cell pin có khớp cam kết không, cell có vết hàn cũ (dấu hiệu cell tháo máy) không, keo dán có gọn không, có cảm biến NTC không.\nChụp ảnh chi tiết toàn bộ ruột làm Mẫu chuẩn (Golden Sample) gửi lại xưởng xác nhận: \"Hàng đại trà sai khác linh kiện so với ảnh này tôi sẽ từ chối nhận hàng\"",
    A59: "Đo test thực tế bằng dụng cụ chuyên dụng:",
    A61: "Mua 1 đồng hồ đo dòng USB (như FNB58 hoặc Power-Z KM003C) + 1 cục tải giả (Electronic load) giá chỉ vài trăm nghìn đến hơn 1 triệu VNĐ để tự đo:\nCác giao thức sạc nhanh (PD, PPS, QC, SCP) có đúng công suất không?\nXả từ 100% về 0% được bao nhiêu Wh (nếu cell 37Wh thì xả 5V chuẩn phải ra tầm 22–25Wh trở lên).\nNhiệt độ vỏ khi sạc/xả liên tục ở công suất tối đa (an toàn thường dưới 48–52°C).",
    A63: "Đàm phán điều khoản bảo hành (RMA) ngay từ đầu",
    A65: "Pin dự phòng gần như không thể gửi ngược sang Trung Quốc để bảo hành vì chi phí cao và vướng quy định vận chuyển hàng nguy hiểm. Thông lệ dân trong nghề:\nYêu cầu xưởng tặng kèm 1%–3% máy dự phòng (备品 / FOC) ngay trong lô hàng để bạn tự đổi bảo hành cho khách VN.\nHoặc thỏa thuận nếu tỷ lệ lỗi vượt quá 2%, xưởng sẽ trừ tiền vào đơn hàng tiếp theo (bạn quay video cắt dây/đập bỏ máy lỗi làm bằng chứng).",
    A67: "Kiểm hàng trước khi thanh toán phần còn lại (QC / Pre-shipment Inspection):",
    A69: "Thanh toán theo chuẩn 30% cọc – 70% trước khi xuất xưởng. Với đơn hàng lớn (từ vài chục triệu trở lên), nên thuê dịch vụ QC bên thứ 3 tại Thâm Quyến đến xưởng kiểm tra ngẫu nhiên theo tiêu chuẩn AQL — bắt buộc mở ngẫu nhiên 1–2 cục trong lô đại trà để chắc chắn xưởng không tráo cell so với mẫu test.",
    A72: "G. Thủ tục nhập khẩu, Thuế & Vận chuyển về Việt Nam",
    A74: "Đặc thù vận chuyển (Hàng chứa pin Lithium)\n\nSạc dự phòng thuộc danh mục Hàng nguy hiểm (Dangerous Goods — mã UN 3480) do chứa pin Lithium.\n\nĐường bay: Rất đắt và ngặt nghèo (bắt buộc có MSDS và báo cáo thử nghiệm UN38.3), chỉ dùng khi cần gửi gấp vài mẫu test.\nĐường bộ / Đường biển: Phương án kinh tế nhất khi nhập về Việt Nam (đặc biệt đường bộ qua cửa khẩu Bằng Tường – Hữu Nghị hoặc Đông Hưng – Móng Cái). Phải đóng thùng carton 5 lớp chắc chắn, chèn chống sốc, báo rõ là hàng pin để đi line chuyên dụng.",
    A77: "H. Thông tin Hải quan & Thuế chính ngạch tại Việt Nam",
    A79: "Kiểm tra chất lượng (QCVN 101:2020/BTTTT):\nTin rất tốt cho người nhập hàng: Theo phạm vi điều chỉnh của QCVN 101:2020/BTTTT, pin lithium rời dạng sạc dự phòng KHÔNG thuộc diện bắt buộc kiểm tra chất lượng chuyên ngành và công bố hợp quy tại Bộ TT&TT. Thủ tục thông quan diễn ra như hàng hóa thông thường (chỉ yêu cầu là hàng mới 100%, cấm nhập hàng cũ/tân trang).\n\nMã HS Code & Thuế suất tham khảo:\nMã HS thường áp: Nhóm 8507.60 (phổ biến là 8507.60.90 hoặc 8507.60.39 tùy thiết kế/công suất — nên xác nhận lại với đơn vị forwarder trước khi mở tờ khai).\nThuế nhập khẩu ưu đãi (MFN): 0% (vì đã là 0% nên C/O form E chủ yếu dùng bổ sung chứng minh xuất xứ nếu cần).\nThuế VAT: 10% (hoặc áp dụng mức giảm thuế VAT theo chính sách hiện hành từng giai đoạn).\n\nBộ hồ sơ cần yêu cầu xưởng TQ cung cấp:\nCommercial Invoice (Hóa đơn thương mại), Packing List (Phiếu đóng gói), Sales Contract (Hợp đồng).\nTài liệu thông số kỹ thuật (Catalogue / Spec sheet).\nMSDS & UN38.3 (để đơn vị vận chuyển khai báo an toàn hàng pin)\n.\nQuy định Nhãn mác (Rất dễ bị phạt nếu bỏ qua):\nTrên thân sạc và vỏ hộp phải có nhãn gốc (tiếng Anh hoặc tiếng Trung): Tên sản phẩm, Model, thông số Input/Output, dung lượng (mAh & Wh), Made in China, tên/địa chỉ nhà sản xuất.\nKhi lưu thông bán tại Việt Nam bắt buộc phải dán tem nhãn phụ tiếng Việt đầy đủ (tên hàng, thông số, đơn vị nhập khẩu & chịu trách nhiệm, hướng dẫn sử dụng, cảnh báo an toàn)."
  };

  // Expose for verification / inspection
  window.SHEET_CELLS = SHEET_CELLS;

  const ICONS = {
    pouch: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2"/><path d="M15 4V2"/><path d="M13 10l-2 3h2l-1 3"/></svg>`,
    cylinder: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="7" height="15" rx="2"/><path d="M6.5 5V3.5h2V5"/><rect x="13" y="5" width="7" height="15" rx="2"/><path d="M15.5 5V3.5h2V5"/></svg>`,
    solid: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
    plus: `<svg class="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
    warn: `<svg class="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    bolt: `<svg class="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    chip: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>`,
    temp: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
    shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
    cable: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9a2 2 0 0 1 2-2h2v10H6a2 2 0 0 1-2-2V9z"/><path d="M8 12h8"/><path d="M16 7h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2V7z"/></svg>`,
    magnet: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15v-5a6 6 0 1 1 12 0v5"/><path d="M6 15h4v4H6z"/><path d="M14 15h4v4h-4z"/></svg>`,
    flame: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4-2 6-5.5 6-9.5 0-3-2-6-4-8.5-.5 2-2 3.5-3.5 4C11 5.5 10 3.5 8 2c-1 3-4 6-4 10.5C4 16.5 8 20 12 22z"/></svg>`,
    layers: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    factory: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>`,
    plane: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
    truck: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
    doc: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    tag: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
  };

  const state = {
    filter: 'all',
    query: '',
    doneSteps: new Set()
  };

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatText(str) {
    const safe = escapeHtml(str);
    if (!state.query) return safe;
    const escapedQuery = state.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return safe.replace(regex, '<mark class="hl">$1</mark>');
  }

  function linesOf(cellKey) {
    return SHEET_CELLS[cellKey].split('\n').filter(line => line.length > 0);
  }

  function sectionMatchesQuery(cellKeys) {
    if (!state.query) return true;
    const q = state.query.toLowerCase();
    return cellKeys.some(k => SHEET_CELLS[k].toLowerCase().includes(q));
  }

  function renderHeroCell() {
    const a2El = document.querySelector('[data-cell="A2"]');
    if (a2El) a2El.innerHTML = formatText(SHEET_CELLS.A2);
  }

  function renderSectionA() {
    const a10 = linesOf('A10');
    const a17 = linesOf('A17');
    return `
      <section id="sec-A" class="section-block" data-section="A">
        <div class="section-header">
          <span class="section-badge" aria-hidden="true">A</span>
          <h2 class="section-title">${formatText(SHEET_CELLS.A4)}</h2>
        </div>

        <div class="grid-3">
          <article class="card">
            <div class="card-head">
              <span class="icon-box icon-box--blue" aria-hidden="true">${ICONS.pouch}</span>
              <h3 class="card-title">${formatText(SHEET_CELLS.A5)}</h3>
            </div>
            <div class="spec-stack">
              <div class="spec-row spec-row--pro">${ICONS.plus}<span>${formatText(SHEET_CELLS.A6)}</span></div>
              <div class="spec-row spec-row--con">${ICONS.warn}<span>${formatText(SHEET_CELLS.A7)}</span></div>
            </div>
          </article>

          <article class="card">
            <div class="card-head">
              <span class="icon-box icon-box--yellow" aria-hidden="true">${ICONS.cylinder}</span>
              <h3 class="card-title">${formatText(SHEET_CELLS.A9)}</h3>
            </div>
            <div class="spec-stack">
              <div class="spec-row">${ICONS.bolt}<span>${formatText(a10[0])}</span></div>
              <div class="spec-row spec-row--pro">${ICONS.bolt}<span>${formatText(a10[1])}</span></div>
            </div>
          </article>

          <article class="card card--yellow-border">
            <div class="card-head">
              <span class="icon-box icon-box--green" aria-hidden="true">${ICONS.solid}</span>
              <h3 class="card-title">${formatText(SHEET_CELLS.A12)}</h3>
            </div>
            <div class="spec-stack">
              <div class="spec-row spec-row--info"><span>${formatText(SHEET_CELLS.A13)}</span></div>
            </div>
          </article>
        </div>

        <h3 class="subsection-title">${formatText(SHEET_CELLS.A15)}</h3>
        <div class="grid-3">
          <article class="card tier-card">
            <div class="tier-bar tier-bar--a" aria-hidden="true"></div>
            <span class="tier-tag tier-tag--a">A品 · 100%</span>
            <p>${formatText(a17[0])}</p>
          </article>
          <article class="card tier-card">
            <div class="tier-bar tier-bar--b" aria-hidden="true"></div>
            <span class="tier-tag tier-tag--b">B品 · -15–25%</span>
            <p>${formatText(a17[1])}</p>
          </article>
          <article class="card tier-card">
            <div class="tier-bar tier-bar--c" aria-hidden="true"></div>
            <span class="tier-tag tier-tag--c">拆机 · 90%</span>
            <p>${formatText(a17[2])}</p>
          </article>
        </div>
      </section>
    `;
  }

  function renderSectionB() {
    const a25 = linesOf('A25');
    const techIcons = [
      { icon: ICONS.temp, cls: 'icon-box--red' },
      { icon: ICONS.shield, cls: 'icon-box--green' },
      { icon: ICONS.cable, cls: 'icon-box--blue' },
      { icon: ICONS.magnet, cls: 'icon-box--yellow' }
    ];
    return `
      <section id="sec-B" class="section-block" data-section="B">
        <div class="section-header">
          <span class="section-badge" aria-hidden="true">B</span>
          <h2 class="section-title">${formatText(SHEET_CELLS.A19)}</h2>
        </div>

        <div class="grid-2">
          <article class="card">
            <div class="card-head">
              <span class="icon-box icon-box--yellow" aria-hidden="true">${ICONS.bolt}</span>
              <p>${formatText(SHEET_CELLS.A21)}</p>
            </div>
          </article>
          <article class="card card--dark">
            <div class="card-head">
              <span class="icon-box icon-box--dark" aria-hidden="true">${ICONS.chip}</span>
              <p>${formatText(SHEET_CELLS.A23)}</p>
            </div>
          </article>
        </div>

        <h3 class="subsection-title">${formatText(a25[0])}</h3>
        <div class="grid-4">
          ${a25.slice(1).map((line, i) => `
            <article class="card">
              <div class="card-head">
                <span class="icon-box ${techIcons[i].cls}" aria-hidden="true">${techIcons[i].icon}</span>
                <p>${formatText(line)}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderSectionC() {
    const a30 = linesOf('A30');
    const a34 = linesOf('A34');
    const a38 = linesOf('A38');
    const matStyles = [
      { cls: 'icon-box--green', icon: ICONS.shield, card: 'card--yellow-border' },
      { cls: 'icon-box--red', icon: ICONS.flame, card: '' },
      { cls: 'icon-box--blue', icon: ICONS.layers, card: '' },
      { cls: 'icon-box--yellow', icon: ICONS.layers, card: '' }
    ];
    return `
      <section id="sec-C" class="section-block" data-section="C">
        <div class="section-header">
          <span class="section-badge" aria-hidden="true">C</span>
          <h2 class="section-title">${formatText(SHEET_CELLS.A27)}</h2>
        </div>

        <h3 class="subsection-title">${formatText(SHEET_CELLS.A29)}</h3>
        <div class="grid-4">
          ${a30.map((line, i) => `
            <article class="card ${matStyles[i].card}">
              <div class="card-head">
                <span class="icon-box ${matStyles[i].cls}" aria-hidden="true">${matStyles[i].icon}</span>
                <p>${formatText(line)}</p>
              </div>
            </article>
          `).join('')}
        </div>

        <h3 class="subsection-title">${formatText(SHEET_CELLS.A32)}</h3>
        <div class="grid-2">
          <article class="card">
            <div class="spec-row spec-row--pro">${ICONS.plus}<span>${formatText(a34[0])}</span></div>
          </article>
          <article class="card">
            <div class="spec-row spec-row--warn">${ICONS.warn}<span>${formatText(a34[1])}</span></div>
          </article>
        </div>

        <h3 class="subsection-title">${formatText(SHEET_CELLS.A36)}</h3>
        <div class="grid-2">
          <article class="card">
            <div class="moq-bar-wrap">
              <span class="moq-badge moq-badge--yellow">公模</span>
              <span class="moq-badge">MOQ 100–500</span>
            </div>
            <p>${formatText(a38[0])}</p>
          </article>
          <article class="card">
            <div class="moq-bar-wrap">
              <span class="moq-badge">私模</span>
              <span class="moq-badge">MOQ 3.000–10.000</span>
            </div>
            <p>${formatText(a38[1])}</p>
          </article>
        </div>
      </section>
    `;
  }

  function renderSectionD() {
    const a45 = linesOf('A45');
    return `
      <section id="sec-D" class="section-block" data-section="D">
        <div class="section-header">
          <span class="section-badge" aria-hidden="true">D</span>
          <h2 class="section-title">${formatText(SHEET_CELLS.A40)}</h2>
        </div>

        <div class="grid-2">
          <article class="card card--dark stat-hero-card">
            <div class="big-metric">80%+</div>
            <p>${formatText(SHEET_CELLS.A41)}</p>
          </article>

          <article class="card">
            <div class="card-head">
              <span class="icon-box icon-box--yellow" aria-hidden="true">${ICONS.factory}</span>
              <h3 class="card-title">${formatText(SHEET_CELLS.A43)}</h3>
            </div>
            <div class="spec-stack">
              <div class="spec-row">${ICONS.bolt}<span>${formatText(a45[0])}</span></div>
              <div class="spec-row spec-row--pro">${ICONS.plus}<span>${formatText(a45[1])}</span></div>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderSectionE() {
    const a50 = linesOf('A50');
    return `
      <section id="sec-E" class="section-block" data-section="E">
        <div class="section-header">
          <span class="section-badge" aria-hidden="true">E</span>
          <h2 class="section-title">${formatText(SHEET_CELLS.A47)}</h2>
        </div>

        <article class="card card--dark" style="margin-bottom: 1rem;">
          <div class="card-head" style="margin-bottom: 0;">
            <span class="ccc-emblem" aria-hidden="true">CCC</span>
            <p>${formatText(SHEET_CELLS.A48)}</p>
          </div>
        </article>

        <div class="grid-2">
          <article class="card">
            <div class="spec-row spec-row--pro">${ICONS.plus}<span>${formatText(a50[0])}</span></div>
          </article>
          <article class="card card--yellow-border">
            <div class="spec-row spec-row--warn">${ICONS.warn}<span>${formatText(a50[1])}</span></div>
          </article>
        </div>
      </section>
    `;
  }

  function renderSectionF() {
    const a54 = linesOf('A54');
    const a57 = linesOf('A57');
    const a61 = linesOf('A61');
    const a65 = linesOf('A65');

    const steps = [
      {
        num: '01',
        title: SHEET_CELLS.A53,
        body: `<div class="spec-stack">${a54.map(l => `<div class="spec-row">${ICONS.bolt}<span>${formatText(l)}</span></div>`).join('')}</div>`
      },
      {
        num: '02',
        title: SHEET_CELLS.A56,
        body: `<div class="spec-stack">
          <div class="spec-row">${ICONS.warn}<span>${formatText(a57[0])}</span></div>
          <div class="spec-row spec-row--info"><span>${formatText(a57[1])}</span></div>
        </div>`
      },
      {
        num: '03',
        title: SHEET_CELLS.A59,
        body: `<p>${formatText(a61[0])}</p>
          <div class="spec-stack">
            ${a61.slice(1).map(l => `<div class="spec-row spec-row--pro">${ICONS.bolt}<span>${formatText(l)}</span></div>`).join('')}
          </div>`
      },
      {
        num: '04',
        title: SHEET_CELLS.A63,
        body: `<p>${formatText(a65[0])}</p>
          <div class="spec-stack">
            <div class="spec-row spec-row--pro">${ICONS.plus}<span>${formatText(a65[1])}</span></div>
            <div class="spec-row spec-row--warn">${ICONS.warn}<span>${formatText(a65[2])}</span></div>
          </div>`
      },
      {
        num: '05',
        title: SHEET_CELLS.A67,
        body: `<p>${formatText(SHEET_CELLS.A69)}</p>
          <div class="split-bar" aria-hidden="true">
            <div class="split-30">30%</div>
            <div class="split-70">70%</div>
          </div>`
      }
    ];

    const doneCount = state.doneSteps.size;
    const pct = Math.round((doneCount / 5) * 100);

    return `
      <section id="sec-F" class="section-block" data-section="F">
        <div class="steps-head-bar">
          <div class="section-header" style="margin-bottom: 0;">
            <span class="section-badge" aria-hidden="true">F</span>
            <h2 class="section-title">${formatText(SHEET_CELLS.A52)}</h2>
          </div>
          <div class="progress-pill" aria-live="polite">
            <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
            <span>${doneCount}/5</span>
          </div>
        </div>

        <div class="steps-list">
          ${steps.map((st, idx) => {
            const isDone = state.doneSteps.has(idx);
            return `
              <article class="card step-card ${isDone ? 'is-done' : ''}">
                <button type="button" class="check-btn" data-step="${idx}" aria-pressed="${isDone}" aria-label="${st.num}">
                  ${isDone ? ICONS.check : st.num}
                </button>
                <div class="step-body">
                  <h3 class="card-title">${formatText(st.title)}</h3>
                  ${st.body}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderSectionG() {
    const a74 = linesOf('A74');
    return `
      <section id="sec-G" class="section-block" data-section="G">
        <div class="section-header">
          <span class="section-badge" aria-hidden="true">G</span>
          <h2 class="section-title">${formatText(SHEET_CELLS.A72)}</h2>
        </div>

        <article class="card" style="margin-bottom: 1rem;">
          <div class="card-head">
            <span class="hazard-badge">UN 3480</span>
            <h3 class="card-title">${formatText(a74[0])}</h3>
          </div>
          <p>${formatText(a74[1])}</p>
        </article>

        <div class="grid-2">
          <article class="card">
            <div class="card-head" style="margin-bottom: 0;">
              <span class="icon-box icon-box--red" aria-hidden="true">${ICONS.plane}</span>
              <p>${formatText(a74[2])}</p>
            </div>
          </article>
          <article class="card card--yellow-border">
            <div class="card-head" style="margin-bottom: 0;">
              <span class="icon-box icon-box--green" aria-hidden="true">${ICONS.truck}</span>
              <p>${formatText(a74[3])}</p>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderSectionH() {
    const a79 = linesOf('A79');
    // Exact lines of A79:
    // 0: Kiểm tra chất lượng (QCVN 101:2020/BTTTT):
    // 1: Tin rất tốt...
    // 2: Mã HS Code & Thuế suất tham khảo:
    // 3: Mã HS thường áp...
    // 4: Thuế nhập khẩu ưu đãi (MFN): 0%...
    // 5: Thuế VAT: 10%...
    // 6: Bộ hồ sơ cần yêu cầu xưởng TQ cung cấp:
    // 7: Commercial Invoice...
    // 8: Tài liệu thông số kỹ thuật...
    // 9: MSDS & UN38.3...
    // 10: .
    // 11: Quy định Nhãn mác (Rất dễ bị phạt nếu bỏ qua):
    // 12: Trên thân sạc...
    // 13: Khi lưu thông...
    return `
      <section id="sec-H" class="section-block" data-section="H">
        <div class="section-header">
          <span class="section-badge" aria-hidden="true">H</span>
          <h2 class="section-title">${formatText(SHEET_CELLS.A77)}</h2>
        </div>

        <div class="grid-2">
          <article class="card">
            <div class="card-head">
              <span class="icon-box icon-box--green" aria-hidden="true">${ICONS.shield}</span>
              <h3 class="card-title">${formatText(a79[0])}</h3>
            </div>
            <div class="spec-row spec-row--pro">${ICONS.plus}<span>${formatText(a79[1])}</span></div>
          </article>

          <article class="card">
            <div class="card-head">
              <span class="icon-box icon-box--blue" aria-hidden="true">${ICONS.doc}</span>
              <h3 class="card-title">${formatText(a79[2])}</h3>
            </div>
            <div class="tax-row" aria-hidden="true">
              <div class="tax-pill"><span>HS</span><strong>8507.60</strong></div>
              <div class="tax-pill"><span>MFN</span><strong class="big-metric--green">0%</strong></div>
              <div class="tax-pill"><span>VAT</span><strong class="big-metric--blue">10%</strong></div>
            </div>
            <div class="spec-stack">
              <div class="spec-row"><span>${formatText(a79[3])}</span></div>
              <div class="spec-row spec-row--pro"><span>${formatText(a79[4])}</span></div>
              <div class="spec-row spec-row--info"><span>${formatText(a79[5])}</span></div>
            </div>
          </article>

          <article class="card">
            <div class="card-head">
              <span class="icon-box icon-box--yellow" aria-hidden="true">${ICONS.doc}</span>
              <h3 class="card-title">${formatText(a79[6])}</h3>
            </div>
            <div class="spec-stack">
              <div class="spec-row">${ICONS.bolt}<span>${formatText(a79[7])}</span></div>
              <div class="spec-row">${ICONS.bolt}<span>${formatText(a79[8])}</span></div>
              <div class="spec-row">${ICONS.bolt}<span>${formatText(a79[9])}${formatText(a79[10])}</span></div>
            </div>
          </article>

          <article class="card">
            <div class="card-head">
              <span class="icon-box icon-box--red" aria-hidden="true">${ICONS.tag}</span>
              <h3 class="card-title">${formatText(a79[11])}</h3>
            </div>
            <div class="spec-stack">
              <div class="spec-row spec-row--warn">${ICONS.warn}<span>${formatText(a79[12])}</span></div>
              <div class="spec-row spec-row--con">${ICONS.warn}<span>${formatText(a79[13])}</span></div>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  const SECTIONS = [
    { id: 'A', keys: ['A4', 'A5', 'A6', 'A7', 'A9', 'A10', 'A12', 'A13', 'A15', 'A17'], render: renderSectionA },
    { id: 'B', keys: ['A19', 'A21', 'A23', 'A25'], render: renderSectionB },
    { id: 'C', keys: ['A27', 'A29', 'A30', 'A32', 'A34', 'A36', 'A38'], render: renderSectionC },
    { id: 'D', keys: ['A40', 'A41', 'A43', 'A45'], render: renderSectionD },
    { id: 'E', keys: ['A47', 'A48', 'A50'], render: renderSectionE },
    { id: 'F', keys: ['A52', 'A53', 'A54', 'A56', 'A57', 'A59', 'A61', 'A63', 'A65', 'A67', 'A69'], render: renderSectionF },
    { id: 'G', keys: ['A72', 'A74'], render: renderSectionG },
    { id: 'H', keys: ['A77', 'A79'], render: renderSectionH }
  ];

  function renderAll() {
    renderHeroCell();
    const root = document.getElementById('contentRoot');
    const emptyState = document.getElementById('emptyState');

    const visibleSections = SECTIONS.filter(sec => {
      const filterOk = state.filter === 'all' || state.filter === sec.id;
      const queryOk = sectionMatchesQuery(sec.keys);
      return filterOk && queryOk;
    });

    root.innerHTML = visibleSections.map(sec => sec.render()).join('');
    emptyState.hidden = visibleSections.length > 0;

    // Bind step checklist buttons
    root.querySelectorAll('.check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.step);
        if (state.doneSteps.has(idx)) {
          state.doneSteps.delete(idx);
        } else {
          state.doneSteps.add(idx);
        }
        renderAll();
      });
    });
  }

  function setFilter(nextFilter) {
    state.filter = nextFilter;
    document.querySelectorAll('.nav-pill').forEach(pill => {
      const active = pill.dataset.filter === nextFilter;
      pill.classList.toggle('is-active', active);
      pill.setAttribute('aria-pressed', String(active));
    });
    renderAll();
  }

  function init() {
    document.querySelectorAll('.nav-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        setFilter(pill.dataset.filter);
        if (pill.dataset.filter !== 'all') {
          const target = document.getElementById(`sec-${pill.dataset.filter}`);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    document.querySelectorAll('[data-jump]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.dataset.jump;
        if (state.filter !== 'all' && state.filter !== id) {
          e.preventDefault();
          setFilter('all');
          requestAnimationFrame(() => {
            const target = document.getElementById(`sec-${id}`);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
      });
    });

    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    searchInput.addEventListener('input', () => {
      state.query = searchInput.value.trim();
      searchClear.hidden = !state.query;
      renderAll();
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      state.query = '';
      searchClear.hidden = true;
      renderAll();
      searchInput.focus();
    });

    document.getElementById('resetFiltersBtn').addEventListener('click', () => {
      searchInput.value = '';
      state.query = '';
      searchClear.hidden = true;
      setFilter('all');
    });

    const backTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      backTop.hidden = window.scrollY < 320;
    }, { passive: true });

    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
