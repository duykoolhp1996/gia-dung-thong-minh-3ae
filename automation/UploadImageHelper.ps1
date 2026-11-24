<#
.SYNOPSIS
    UploadImageHelper.ps1 - Module upload ảnh báo cáo lên CDN chuyên nghiệp cho Zalo Bot
.DESCRIPTION
    Hỗ trợ upload ảnh độ phân giải cao 16:9 với cơ chế đa CDN (Uguu.se + Litterbox)
    Đảm bảo trả về direct URL chuẩn Content-Type: image/png cho Zalo Bot API
#>

function Upload-ImageToCDN([string]$filePath) {
    if (-not (Test-Path $filePath)) {
        Write-Error "File không tồn tại: $filePath"
        return $null
    }

    Write-Host "Đang upload ảnh lên CDN..." -ForegroundColor Cyan

    # Phương án 1: uguu.se (nhanh, direct image/png, hỗ trợ file lớn)
    try {
        $raw = curl.exe -s --max-time 20 -F "files[]=@$filePath" https://uguu.se/upload.php
        if (-not [string]::IsNullOrWhiteSpace($raw)) {
            $json = $raw | ConvertFrom-Json
            if ($json.success -and $json.files -and $json.files.Count -gt 0 -and $json.files[0].url) {
                $cdnUrl = [string]$json.files[0].url
                Write-Host "✅ Upload CDN thành công: $cdnUrl" -ForegroundColor Green
                return $cdnUrl
            }
        }
    } catch {
        Write-Warning "uguu.se gặp sự cố: $_"
    }

    # Phương án 2: litterbox.catbox.moe (dự phòng 72 giờ)
    try {
        $raw2 = curl.exe -s --max-time 25 -F "reqtype=fileupload" -F "time=72h" -F "fileToUpload=@$filePath" https://litterbox.catbox.moe/resources/internals/api.php
        if (-not [string]::IsNullOrWhiteSpace($raw2) -and $raw2.Trim().StartsWith("http")) {
            $cdnUrl2 = $raw2.Trim()
            Write-Host "✅ Upload CDN dự phòng thành công (litterbox): $cdnUrl2" -ForegroundColor Green
            return $cdnUrl2
        }
    } catch {
        Write-Warning "litterbox gặp sự cố: $_"
    }

    Write-Error "❌ Tất cả các cổng CDN đều không phản hồi!"
    return $null
}

function Send-ZaloPhotoMessage([string]$botToken, [string]$chatId, [string]$photoUrl) {
    $baseUrl = "https://bot-api.zapps.me/bot$botToken"
    $payload = @{
        chat_id = $chatId
        photo = $photoUrl
    } | ConvertTo-Json -Compress

    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

    try {
        $sendRes = Invoke-RestMethod -Uri "$baseUrl/sendPhoto" -Method Post -Body $bodyBytes -ContentType "application/json; charset=utf-8" -TimeoutSec 15
        if ($sendRes.ok) {
            Write-Host "🎉 [THÀNH CÔNG] Đã bắn ảnh vào Zalo ($chatId)!" -ForegroundColor Green
            return $true
        } else {
            Write-Warning "Zalo báo lỗi: $($sendRes.description)"
            return $false
        }
    } catch {
        Write-Error "Lỗi khi gọi API sendPhoto: $_"
        return $false
    }
}
