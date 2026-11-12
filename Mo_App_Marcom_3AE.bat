@echo off
chcp 65001 >nul
title 3AE Marcom Hub - Khởi động Ứng dụng
echo ========================================================
echo   HE THONG QUAN LY CONG VIEC MARCOM - GIA DUNG THONG MINH 3AE
echo ========================================================
echo [1/2] Dang kiem tra may chu noi bo...

:: Chay server an trong background neu chua chay
powershell -WindowStyle Hidden -Command "if (-not (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue)) { Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File \"\"%~dp0server.ps1\"\"' -WindowStyle Hidden }"

timeout /t 1 /nobreak >nul

echo [2/2] Dang mo ung dung tren trinh duyet...
start http://localhost:8080/

echo ========================================================
echo Ung dung da mo tai dia chi: http://localhost:8080/
echo Ban co the bat dau lam viec ngay!
echo ========================================================
exit
