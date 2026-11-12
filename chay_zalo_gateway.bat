@echo off
chcp 65001 >nul
title 3AE Marcom - Zalo Bot Gateway (Tu Dong Nhan Tin & Phuc Vu Chat)
echo ==============================================================
echo    ZALO BOT GATEWAY - PHONG MARCOM GIA DUNG THONG MINH 3AE
echo    - Tu dong gui bao cao cong viec luc 08:30 sang
echo    - Tu dong lang nghe va phan hoi lenh truc tiep tu Zalo
echo ==============================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0zalo_gateway.ps1"
pause
