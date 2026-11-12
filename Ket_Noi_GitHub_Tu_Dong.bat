@echo off
chcp 65001 >nul
title 1-Click Kích Hoạt GitHub Cloud 24/7 - Marcom 3AE
cls
echo ==============================================================================
echo    🚀 KÍCH HOẠT HỆ THỐNG ONLINE 24/7 QUA GITHUB ACTIONS (MIỄN PHÍ 100%%)
echo    Đơn vị: Phòng Marcom - Gia Dụng Thông Minh 3AE
echo ==============================================================================
echo.
echo ⏳ Đang kiểm tra trạng thái đăng nhập GitHub...

gh auth status >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Bạn đã đăng nhập GitHub sẵn trên máy!
    goto CREATE_REPO
)

echo.
echo 🔑 BƯỚC 1: ĐĂNG NHẬP GITHUB (Chỉ mất 10 giây)
echo ------------------------------------------------------------------------------
echo 👉 Hệ thống sẽ tự động sao chép mã số 8 ký tự vào máy tính của bạn
echo 👉 Trình duyệt web sẽ tự động mở trang xác nhận GitHub
echo 👉 Bạn chỉ cần nhấn: Ctrl + V (Dán) -^> Bấm nút màu xanh "Authorize github"
echo ------------------------------------------------------------------------------
echo.
pause
echo.
echo Đang mở trình duyệt xác thực...
gh auth login --web --clipboard -p https -s repo,workflow

gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Chưa hoàn tất đăng nhập GitHub! Vui lòng thử lại.
    pause
    exit /b 1
)

:CREATE_REPO
echo.
echo 📦 BƯỚC 2: TỰ ĐỘNG ĐẨY MÃ NGUỒN LÊN GITHUB CLOUD
echo ------------------------------------------------------------------------------
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Đang tạo kho lưu trữ riêng tư (Private Repository) trên GitHub...
    gh repo create marcom-3ae-bot --private --source=. --remote=origin --push
) else (
    echo Đang đồng bộ phiên bản mới nhất lên GitHub...
    git push -u origin main
)

echo.
echo 🤖 BƯỚC 3: KÍCH HOẠT TỰ ĐỘNG BẮN BÁO CÁO INFOGRAPHIC 08:30 SÁNG
echo ------------------------------------------------------------------------------
echo Đang kích hoạt thử nghiệm luồng chạy đầu tiên trên GitHub Actions...
gh workflow run zalo_marcom_bot.yml

echo.
echo ==============================================================================
echo 🎉🎉 CHÚC MỪNG BẠN! HỆ THỐNG ĐÃ KÍCH HOẠT THÀNH CÔNG LÊN CLOUD 24/7!
echo ==============================================================================
echo.
echo ✨ KẾT QUẢ ĐẠT ĐƯỢC:
echo  1. Đúng 08:30 sáng mỗi ngày, máy ảo GitHub sẽ tự động bật lên, chụp bộ ảnh
echo     Infographic 16:9 sắc nét và bắn thẳng vào Nhóm Zalo của phòng Marketing!
echo  2. BẠN CÓ THỂ TẮT MÁY TÍNH CÁ NHÂN HOÀN TOÀN từ thời điểm này!
echo  3. Chi phí duy trì: 0 ĐỒNG (Miễn phí vĩnh viễn trên GitHub).
echo.
echo 👉 Bạn có thể mở xem tiến trình máy ảo đang chạy tại:
gh browse --actions
echo.
pause
