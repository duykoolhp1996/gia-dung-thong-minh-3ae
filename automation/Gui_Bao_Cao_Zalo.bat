@echo off
chcp 65001 >nul
title Gia Dụng Thông Minh 3AE - Hệ Thống Báo Cáo & Zalo Bot
:MENU
cls
echo =========================================================================
echo    HỆ THỐNG XUẤT BÁO CÁO INFOGRAPHIC & ZALO BOT - GIA DỤNG THÔNG MINH 3AE
echo    "Nhẹ gánh việc nhà, Nhờ nhà thông minh"
echo =========================================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Join-Path '%~dp0' 'zalo_bot_config.json'; if (Test-Path $p) { $c = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8) | ConvertFrom-Json; if ($c.zalo_connection.send_to_group) { Write-Host '🔥 CHẾ ĐỘ HIỆN TẠI: GỬI VÀO GROUP (NHÓM)' -ForegroundColor Green; if ($c.zalo_connection.group_chat_id) { Write-Host ('   ↳ Group ID: ' + $c.zalo_connection.group_chat_id) -ForegroundColor Yellow } else { Write-Host '   ↳ (Tự động nhận diện ID khi có tin nhắn từ nhóm)' -ForegroundColor DarkGray } } else { Write-Host '👤 CHẾ ĐỘ HIỆN TẠI: GỬI CÁ NHÂN (TEST)' -ForegroundColor Yellow } } else { Write-Host '⚠️ Chưa tìm thấy file config' -ForegroundColor Red }"
echo =========================================================================
echo.
echo  1.  Gửi Báo Cáo Hàng Ngày (16:9 - Việc Hôm Nay, Ngày Mai, Quá Hạn)
echo  1m. Gửi Báo Cáo Hàng Ngày (Mobile 9:16 - Xem dọc trên điện thoại)
echo  2.  Gửi Báo Cáo Tuần (16:9 - Tổng Quan Phòng Ban & 4 Vị Trí)
echo  2m. Gửi Báo Cáo Tuần (Mobile 9:16 - Xem dọc trên điện thoại)
echo  3.  Gửi Báo Cáo Cá Nhân (Tất Cả Nhân Sự: Loan, Mỵ, Phụng, Toàn)
echo  4.  Gửi Trọn Bộ Nhắc Nhở (Hàng Ngày + Cá Nhân)
echo  5.  Đồng Bộ Dữ Liệu Mới Nhất Từ Google Sheets
echo  6.  Bật Zalo Bot Gateway (Chạy ngầm tự động 08:30 & nhận lệnh chat)
echo  7.  Bật / Tắt Chế Độ Gửi Group (Chuyển đổi giữa Group ^& Cá Nhân)
echo  8.  🚀 Kích Hoạt GitHub Cloud 24/7 (Tự Động Báo Cáo Không Cần Bật Máy)
echo  0.  Thoát
echo.
set /p opt="👉 Chọn chức năng (1, 1m, 2, 2m, 3, 4, 5, 6, 7, 8, 0): "

if "%opt%"=="1" (
    echo.
    echo [RUNNING] Đang tạo và gửi Báo Cáo Hàng Ngày (16:9)...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_daily_tasks_img.ps1"
    pause
    goto MENU
)

if "%opt%"=="1m" (
    echo.
    echo [RUNNING] Đang tạo và gửi Báo Cáo Hàng Ngày (Mobile 9:16)...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_daily_tasks_img.ps1" -Layout mobile
    pause
    goto MENU
)

if "%opt%"=="2" (
    echo.
    echo [RUNNING] Đang tạo và gửi Báo Cáo Tuần (16:9)...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_weekly_report_img.ps1"
    pause
    goto MENU
)

if "%opt%"=="2m" (
    echo.
    echo [RUNNING] Đang tạo và gửi Báo Cáo Tuần (Mobile 9:16)...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_weekly_report_img.ps1" -Layout mobile
    pause
    goto MENU
)

if "%opt%"=="3" (
    echo.
    echo [RUNNING] Đang tạo và gửi Báo Cáo Cá Nhân...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_personal_reports_img.ps1"
    pause
    goto MENU
)

if "%opt%"=="4" (
    echo.
    echo [RUNNING] Đang gửi trọn bộ gói nhắc nhở...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_daily_tasks_img.ps1"
    timeout /t 2 >nul
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_personal_reports_img.ps1"
    pause
    goto MENU
)

if "%opt%"=="5" (
    echo.
    echo [RUNNING] Đang đồng bộ dữ liệu từ Google Sheets...
    gsheets --version >nul 2>&1
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync_sheets_to_app.ps1"
    pause
    goto MENU
)

if "%opt%"=="6" (
    echo.
    echo [STARTING] Đang khởi chạy Zalo Bot Gateway...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0zalo_gateway.ps1"
    pause
    goto MENU
)

if "%opt%"=="7" (
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Join-Path '%~dp0' 'zalo_bot_config.json'; if (Test-Path $p) { $c = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8) | ConvertFrom-Json; $c.zalo_connection.send_to_group = -not $c.zalo_connection.send_to_group; [System.IO.File]::WriteAllText($p, ($c | ConvertTo-Json -Depth 10), [System.Text.Encoding]::UTF8); Write-Host ('[THÀNH CÔNG] Đã đổi chế độ gửi: ' + $(if ($c.zalo_connection.send_to_group) { '🔥 GỬI VÀO NHÓM (GROUP)' } else { '👤 GỬI CÁ NHÂN (TEST)' })) -ForegroundColor Green } else { Write-Host 'Không tìm thấy file config' -ForegroundColor Red }"
    pause
    goto MENU
)

if "%opt%"=="8" (
    call "%~dp0Ket_Noi_GitHub_Tu_Dong.bat"
    goto MENU
)

if "%opt%"=="0" exit /b 0

goto MENU
