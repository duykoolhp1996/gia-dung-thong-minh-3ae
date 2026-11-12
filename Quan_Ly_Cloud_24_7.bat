@echo off
chcp 65001 >nul
title Gia Dụng Thông Minh 3AE - Quản Lý Chế Độ Online Cloud 24/7 (Miễn Phí)
:MENU
cls
echo ==============================================================================
echo    ☁️ QUẢN LÝ CHẾ ĐỘ ONLINE 24/7 (TẮT MÁY VẪN CHẠY) - MARCOM 3AE
echo    "Hoàn toàn miễn phí 100%% với Google Apps Script & GitHub Actions"
echo ==============================================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "$token='3153359854443286675:xjllrOtuEwnyHLRibfGqWaQIuOrZfmnPMdjdftkkOZsZlkBnbWfCNHdfUpuGpRbc'; try { $r = Invoke-RestMethod -Uri \"https://bot-api.zapps.me/bot$token/getWebhookInfo\" -TimeoutSec 5; if ($r.result.url) { Write-Host ('🟢 TRẠNG THÁI HIỆN TẠI: ĐANG CHẠY CLOUD 24/7 (Tắt máy tính vẫn hoạt động)') -ForegroundColor Green; Write-Host ('   ↳ Webhook URL: ' + $r.result.url) -ForegroundColor Yellow } else { Write-Host '💻 TRẠNG THÁI HIỆN TẠI: CHẾ ĐỘ MÁY TÍNH CÁ NHÂN (Local Gateway)' -ForegroundColor Cyan } } catch { Write-Host '⚠️ Không kiểm tra được trạng thái mạng' -ForegroundColor Red }"
echo ==============================================================================
echo.
echo  1. Mở Google Sheets ^& File Code để cài Google Apps Script (Chỉ mất 1 phút)
echo  2. Kích hoạt Chế Độ CLOUD 24/7 (Dán link Web App Google để tắt máy vẫn chạy)
echo  3. Chuyển về Chế Độ MÁY CÁ NHÂN (Tắt Webhook Cloud ^& chạy zalo_gateway.ps1)
echo  4. Xem Hướng Dẫn Chi Tiết Từng Bước (GitHub Actions + Google Cloud)
echo  0. Thoát
echo.
set /p opt="👉 Chọn chức năng (1, 2, 3, 4, 0): "

if "%opt%"=="1" (
    echo.
    echo [OPENING] Đang mở Google Sheets và file Google_Apps_Script_Zalo_Bot_24_7.gs...
    start https://docs.google.com/spreadsheets/d/1dI_z3TzLBmMgPmRICya6aVyqyw18qdgPitmsw2in5ac/edit
    notepad.exe "%~dp0Google_Apps_Script_Zalo_Bot_24_7.gs"
    echo.
    echo 💡 HƯỚNG DẪN NHANH:
    echo   B1: Trên Google Sheets vừa mở, bấm menu: Tiện ích mở rộng (Extensions) -^> Apps Script
    echo   B2: Copy toàn bộ nội dung trong Notepad vừa mở dán đè vào Apps Script rồi bấm Lưu (Ctrl+S)
    echo   B3: Bấm nút "Triển khai" (Deploy) góc phải trên -^> "Tùy chọn triển khai mới" (New deployment)
    echo   B4: Chọn loại "Ứng dụng web" (Web app), mục Quyền truy cập chọn "Bất kỳ ai" (Anyone) -^> Bấm Triển khai
    echo   B5: Copy đường link Web App (https://script.google.com/macros/s/.../exec) rồi chọn mục số 2 ở menu này!
    echo.
    pause
    goto MENU
)

if "%opt%"=="2" (
    echo.
    set /p weburl="👉 Dán link Web App Google (https://script.google.com/macros/s/.../exec): "
    if "%weburl%"=="" (
        echo ⚠️ Bạn chưa nhập link Web App!
        pause
        goto MENU
    )
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$token='3153359854443286675:xjllrOtuEwnyHLRibfGqWaQIuOrZfmnPMdjdftkkOZsZlkBnbWfCNHdfUpuGpRbc'; $u='%weburl%'.Trim(); $body = @{ url = $u } | ConvertTo-Json; $res = Invoke-RestMethod -Uri \"https://bot-api.zapps.me/bot$token/setWebhook\" -Method Post -Body $body -ContentType 'application/json'; if ($res.ok) { Write-Host '🎉 [THÀNH CÔNG] Đã kích hoạt Chế độ Cloud 24/7! Từ giờ bạn tắt máy tính Bot vẫn trả lời nhóm Zalo 24/24!' -ForegroundColor Green; $msg = @{ chat_id = 'zgr-323efe35775a9e04c74b'; text = '☁️ [ĐÃ BẬT CHẾ ĐỘ CLOUD 24/7]: Bot Marcom 3AE đã kết nối trực tiếp với Google Sheets Cloud. Hoạt động 24/24 ngay cả khi tắt máy tính!' } | ConvertTo-Json -Compress; Invoke-RestMethod -Uri \"https://bot-api.zapps.me/bot$token/sendMessage\" -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($msg)) -ContentType 'application/json; charset=utf-8' | Out-Null } else { Write-Host ('❌ Lỗi: ' + ($res | ConvertTo-Json)) -ForegroundColor Red }"
    pause
    goto MENU
)

if "%opt%"=="3" (
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$token='3153359854443286675:xjllrOtuEwnyHLRibfGqWaQIuOrZfmnPMdjdftkkOZsZlkBnbWfCNHdfUpuGpRbc'; $res = Invoke-RestMethod -Uri \"https://bot-api.zapps.me/bot$token/deleteWebhook\" -Method Post; if ($res.ok) { Write-Host '✅ Đã ngắt Webhook Cloud và chuyển về Chế độ Máy Cá Nhân!' -ForegroundColor Green }"
    echo Đang khởi động lại Zalo Gateway trên máy tính...
    start powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0zalo_gateway.ps1"
    pause
    goto MENU
)

if "%opt%"=="4" (
    notepad.exe "%~dp0Huong_Dan_Chay_Online_24_7_Mien_Phi.md"
    goto MENU
)

if "%opt%"=="0" exit /b 0
goto MENU
