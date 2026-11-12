param (
    [string]$ChatId = "fe4d0d0d2659cf079648",
    [switch]$NoSend = $false,
    [Nullable[DateTime]]$Date = $null,
    [ValidateSet("16:9", "9:16", "mobile")]
    [string]$Layout = "16:9"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$token = "3153359854443286675:xjllrOtuEwnyHLRibfGqWaQIuOrZfmnPMdjdftkkOZsZlkBnbWfCNHdfUpuGpRbc"
$baseUrl = "https://bot-api.zapps.me/bot$token"
$configPath = Join-Path $PSScriptRoot "zalo_bot_config.json"

if (Test-Path $configPath) {
    try {
        $cfgJson = [System.IO.File]::ReadAllText($configPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
        if (-not [string]::IsNullOrWhiteSpace($cfgJson.zalo_connection.bot_token)) {
            $token = $cfgJson.zalo_connection.bot_token
            $baseUrl = "https://bot-api.zapps.me/bot$token"
        }
        if (-not $PSBoundParameters.ContainsKey('ChatId') -or $ChatId -eq "fe4d0d0d2659cf079648") {
            if ($cfgJson.zalo_connection.send_to_group -and -not [string]::IsNullOrWhiteSpace($cfgJson.zalo_connection.group_chat_id)) {
                $ChatId = $cfgJson.zalo_connection.group_chat_id
            } elseif (-not [string]::IsNullOrWhiteSpace($cfgJson.zalo_connection.chat_id)) {
                $ChatId = $cfgJson.zalo_connection.chat_id
            }
        }
    } catch {}
}
$dbPath = Join-Path $PSScriptRoot "marcom_rust\static\database.json"
$filterRulesPath = Join-Path $PSScriptRoot "TaskFilterRules.ps1"

if (-not (Test-Path $dbPath)) {
    Write-Error "Không tìm thấy cơ sở dữ liệu tại: $dbPath"
    exit 1
}
if (-not (Test-Path $filterRulesPath)) {
    Write-Error "Không tìm thấy file quy tắc lọc: $filterRulesPath"
    exit 1
}

$uploadHelperPath = Join-Path $PSScriptRoot "UploadImageHelper.ps1"
if (Test-Path $uploadHelperPath) { . $uploadHelperPath }

. $filterRulesPath

$rawJson = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
$db = $rawJson | ConvertFrom-Json

# Ngày phân tích (Mặc định hôm nay)
$currentDate = if ($null -ne $Date -and $Date -ne [DateTime]::MinValue) { $Date } else { [DateTime]::Today }
$tomorrowDate = $currentDate.AddDays(1)

function Get-VnDayOfWeek([DateTime]$d) {
    switch ($d.DayOfWeek) {
        ([DayOfWeek]::Monday)    { return "Thứ Hai" }
        ([DayOfWeek]::Tuesday)   { return "Thứ Ba" }
        ([DayOfWeek]::Wednesday) { return "Thứ Tư" }
        ([DayOfWeek]::Thursday)  { return "Thứ Năm" }
        ([DayOfWeek]::Friday)    { return "Thứ Sáu" }
        ([DayOfWeek]::Saturday)  { return "Thứ Bảy" }
        ([DayOfWeek]::Sunday)    { return "Chủ Nhật" }
    }
}

function Safe-Html([string]$text) {
    if ([string]::IsNullOrWhiteSpace($text)) { return "" }
    return $text.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}

$todayDayName = Get-VnDayOfWeek $currentDate
$tomorrowDayName = Get-VnDayOfWeek $tomorrowDate
$todayStr = "$todayDayName, $($currentDate.ToString('dd/MM/yyyy'))"
$tomorrowStr = "$tomorrowDayName, $($tomorrowDate.ToString('dd/MM/yyyy'))"
$todayShort = $currentDate.ToString("dd/MM")
$tomorrowShort = $tomorrowDate.ToString("dd/MM")

# Thu thập và lọc công việc đa sheet
$allTasks = Get-AllDepartmentTasks -Database $db
$filtered = Get-FilteredAndPrioritizedTasks -RawTasks $allTasks -ReferenceDate $currentDate

$overdueList = $filtered.Tier1_Overdue | Sort-Object -Property OverdueDays -Descending
$todayList = $filtered.Tier2_Today | Sort-Object -Property Priority
$tomorrowList = $filtered.Tier3_In48h
if ($tomorrowList.Count -lt 4) {
    # Nếu ít hơn 4 task trong 48h, bổ sung task còn lại trong tuần
    $needed = 4 - $tomorrowList.Count
    $extra = $filtered.Tier4_RestOfWeek | Select-Object -First $needed
    if ($extra) { $tomorrowList = @($tomorrowList) + @($extra) }
}

Write-Host "=========================================================="
Write-Host "📊 TỔNG HỢP CÔNG VIỆC NGÀY $todayStr" -ForegroundColor Cyan
Write-Host " - Quá hạn: $($overdueList.Count) việc"
Write-Host " - Hôm nay: $($todayList.Count) việc"
Write-Host " - 48h tới / Trong tuần: $($tomorrowList.Count) việc"
Write-Host "=========================================================="

# 1. RENDER HTML CỘT 1: QUÁ HẠN
$overdueHtml = ""
$topOverdue = $overdueList | Select-Object -First 4
if ($topOverdue.Count -eq 0) {
    $overdueHtml = @"
    <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <div class="empty-title">Không có việc quá hạn!</div>
        <div class="empty-desc">Toàn bộ deadline đều đang được kiểm soát tốt.</div>
    </div>
"@
} else {
    foreach ($t in $topOverdue) {
        $days = if ($t.OverdueDays) { $t.OverdueDays } else { 1 }
        $dlText = if ($t.DeadlineStr) { $t.DeadlineStr } else { "Tuần trước" }
        $action = if ($t.Status) { $t.Status } else { "Cần xử lý dứt điểm ngay" }

        $overdueHtml += @"
        <div class="task-item" style="border-color: rgba(239,68,68,0.35);">
            <div class="task-item-top">
                <span class="task-item-badge badge-red">QUÁ HẠN $days NGÀY</span>
                <span class="task-item-dl">Hạn gốc: $dlText</span>
            </div>
            <div class="task-item-name">$((Safe-Html $t.Name))</div>
            <div class="task-item-person">👤 $((Safe-Html $t.Assignee)) <span class="src-pill">[$($t.SheetSource)]</span></div>
            <div class="task-item-action">👉 Trạng thái: $((Safe-Html $action))</div>
        </div>
"@
    }
}

# 2. RENDER HTML CỘT 2: HÔM NAY
$todayHtml = ""
$topToday = $todayList | Select-Object -First 4
if ($topToday.Count -eq 0) {
    # Nếu hôm nay không có task chốt hạn, hiển thị task trọng tâm đang thực hiện
    $inProgress = $filtered.Tier4_RestOfWeek | Select-Object -First 3
    if ($inProgress.Count -gt 0) {
        $todayHtml += @"
        <div class="task-item hero-brand">
            <div class="task-item-top">
                <span class="task-item-badge">⚡ ĐIỀU PHỐI TRỌNG TÂM</span>
                <span style="font-size: 13px; font-weight: 900; color: #000;">TRONG NGÀY</span>
            </div>
            <div class="task-item-name">Xử lý dứt điểm $($overdueList.Count) việc quá hạn & đẩy tiến độ tuần</div>
            <div class="task-item-person">👤 Toàn phòng ban Marcom 3AE</div>
            <div class="task-item-action">⚡ Tập trung hoàn thiện các đầu việc tồn đọng trước khi nhận task mới</div>
        </div>
"@
        foreach ($t in $inProgress) {
            $todayHtml += @"
            <div class="task-item">
                <div class="task-item-top">
                    <span class="task-item-badge badge-yellow">ĐANG THỰC HIỆN</span>
                    <span class="task-item-dl">Hạn: $($t.DeadlineStr)</span>
                </div>
                <div class="task-item-name">$((Safe-Html $t.Name))</div>
                <div class="task-item-person">👤 $((Safe-Html $t.Assignee)) <span class="src-pill">[$($t.SheetSource)]</span></div>
                <div class="task-item-action">👉 Trạng thái: $((Safe-Html $t.Status))</div>
            </div>
"@
        }
    } else {
        $todayHtml = @"
        <div class="empty-state">
            <div class="empty-icon">✅</div>
            <div class="empty-title">Không có task gấp hôm nay</div>
            <div class="empty-desc">Tiếp tục triển khai kế hoạch tuần đã phân bổ.</div>
        </div>
"@
    }
} else {
    $first = $true
    foreach ($t in $topToday) {
        if ($first) {
            # Hero card
            $todayHtml += @"
            <div class="task-item hero-brand">
                <div class="task-item-top">
                    <span class="task-item-badge">🔥 ƯU TIÊN SỐ 1</span>
                    <span style="font-size: 13px; font-weight: 900; color: #000;">HẠN: HÔM NAY</span>
                </div>
                <div class="task-item-name">$((Safe-Html $t.Name))</div>
                <div class="task-item-person">👤 $((Safe-Html $t.Assignee)) <span class="src-pill-hero">[$($t.SheetSource)]</span></div>
                <div class="task-item-action">⚡ Bắt buộc hoàn tất nộp duyệt trong ngày hôm nay!</div>
            </div>
"@
            $first = $false
        } else {
            $todayHtml += @"
            <div class="task-item">
                <div class="task-item-top">
                    <span class="task-item-badge badge-yellow">HẠN HÔM NAY</span>
                    <span class="task-item-dl">Trong ngày</span>
                </div>
                <div class="task-item-name">$((Safe-Html $t.Name))</div>
                <div class="task-item-person">👤 $((Safe-Html $t.Assignee)) <span class="src-pill">[$($t.SheetSource)]</span></div>
                <div class="task-item-action">👉 Trạng thái: $((Safe-Html $t.Status))</div>
            </div>
"@
        }
    }
}

# 3. RENDER HTML CỘT 3: NGÀY HÔM SAU & 48H TỚI
$tomorrowHtml = ""
$topTomorrow = $tomorrowList | Select-Object -First 4
if ($topTomorrow.Count -eq 0) {
    $tomorrowHtml = @"
    <div class="empty-state">
        <div class="empty-icon">📅</div>
        <div class="empty-title">Chưa có lịch chốt 48h tới</div>
        <div class="empty-desc">Sẵn sàng nhận brief hoặc chuẩn bị công việc giai đoạn tiếp theo.</div>
    </div>
"@
} else {
    foreach ($t in $topTomorrow) {
        $dlText = if ($t.DeadlineStr) { $t.DeadlineStr } else { "48h tới" }
        $tomorrowHtml += @"
        <div class="task-item" style="border-color: rgba(2,132,199,0.35);">
            <div class="task-item-top">
                <span class="task-item-badge badge-blue">HẠN: $dlText</span>
                <span class="task-item-dl">$($t.Priority)</span>
            </div>
            <div class="task-item-name">$((Safe-Html $t.Name))</div>
            <div class="task-item-person">👤 $((Safe-Html $t.Assignee)) <span class="src-pill">[$($t.SheetSource)]</span></div>
            <div class="task-item-action">👉 Trạng thái: $((Safe-Html $t.Status))</div>
        </div>
"@
    }
}

# Configuration based on layout
$isMobile = ($Layout -in @("9:16", "mobile"))
$viewportWidth = if ($isMobile) { 1080 } else { 1920 }
$viewportHeight = if ($isMobile) { 1920 } else { 1080 }
$outputFilename = if ($isMobile) { "Bao_Cao_Hang_Ngay_Va_Hom_Sau_Mobile.png" } else { "Bao_Cao_Hang_Ngay_Va_Hom_Sau_16_9.png" }

# Dynamic footer message
$footerMessage = if ($overdueList.Count -gt 0) {
    "Ưu tiên số 1: Xử lý dứt điểm <b>$($overdueList.Count) việc quá hạn</b> • Hoàn tất <b>$($todayList.Count) việc hôm nay</b> • Chuẩn bị <b>$($tomorrowList.Count) việc trong 48h tới</b>"
} else {
    "Tiến độ xuất sắc: <b>Không có việc quá hạn</b> • Tập trung hoàn thành <b>$($todayList.Count) việc hôm nay</b>"
}

# HTML Template
$htmlContent = @"
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Daily Work & Next-Day Horizon - Gia Dụng Thông Minh 3AE</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
        width: ${viewportWidth}px;
        height: ${viewportHeight}px;
        overflow: hidden;
        background: #090A0F;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #ffffff;
        -webkit-font-smoothing: antialiased;
    }

    .container {
        width: ${viewportWidth}px;
        height: ${viewportHeight}px;
        padding: $(if ($isMobile) { "28px 32px" } else { "30px 40px" });
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    /* HEADER */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid rgba(255,255,255,0.08);
        padding-bottom: 14px;
    }
    .header-left {
        display: flex;
        align-items: center;
        gap: 18px;
    }
    .logo-box {
        width: 58px;
        height: 58px;
        background: #000000;
        border: 2px solid #FCD10C;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px;
        box-shadow: 0 4px 20px rgba(252,209,12,0.3);
    }
    .logo-box svg {
        width: 100%;
        height: 100%;
    }
    .title-group h1 {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: $(if ($isMobile) { "25px" } else { "29px" });
        font-weight: 900;
        text-transform: uppercase;
        color: #ffffff;
        letter-spacing: 0.5px;
        line-height: 1.2;
    }
    .title-group p {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: $(if ($isMobile) { "13px" } else { "14.5px" });
        color: #FCD10C;
        margin-top: 4px;
        font-weight: 800;
        letter-spacing: 0.6px;
        text-transform: uppercase;
    }
    .header-right {
        display: flex;
        gap: 12px;
    }
    .capsule {
        background: rgba(255,255,255,0.06);
        border: 1.5px solid rgba(255,255,255,0.14);
        padding: 8px 18px;
        border-radius: 999px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 14.5px;
        font-weight: 800;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .capsule.yellow {
        background: rgba(252,209,12,0.15);
        border-color: rgba(252,209,12,0.55);
        color: #FCD10C;
    }
    .capsule.red {
        background: rgba(239,68,68,0.15);
        border-color: rgba(239,68,68,0.55);
        color: #EF4444;
    }

    /* 3 CỘT CHÍNH */
    .columns-grid {
        display: grid;
        grid-template-columns: $(if ($isMobile) { "1fr" } else { "1.05fr 1fr 1fr" });
        gap: $(if ($isMobile) { "14px" } else { "20px" });
        flex: 1;
        margin: 16px 0;
        min-height: 0;
    }

    .column-panel {
        background: #111218;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: $(if ($isMobile) { "14px 16px" } else { "18px 20px" });
        display: flex;
        flex-direction: column;
    }
    .column-panel.overdue-col {
        border-color: rgba(239,68,68,0.45);
        background: linear-gradient(180deg, rgba(239,68,68,0.08) 0%, #111218 100%);
    }
    .column-panel.today-col {
        border-color: rgba(252,209,12,0.45);
        background: linear-gradient(180deg, rgba(252,209,12,0.08) 0%, #111218 100%);
    }
    .column-panel.tomorrow-col {
        border-color: rgba(2,132,199,0.45);
        background: linear-gradient(180deg, rgba(2,132,199,0.08) 0%, #111218 100%);
    }

    .col-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        padding-bottom: 10px;
        border-bottom: 1.5px solid rgba(255,255,255,0.08);
    }
    .col-title {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 18px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .col-badge {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12.5px;
        font-weight: 900;
        padding: 4px 10px;
        border-radius: 8px;
        text-transform: uppercase;
    }
    .badge-red {
        background: rgba(239,68,68,0.22);
        color: #EF4444;
        border: 1px solid rgba(239,68,68,0.55);
    }
    .badge-yellow {
        background: rgba(252,209,12,0.22);
        color: #FCD10C;
        border: 1px solid rgba(252,209,12,0.55);
    }
    .badge-blue {
        background: rgba(2,132,199,0.22);
        color: #38BDF8;
        border: 1px solid rgba(2,132,199,0.55);
    }

    .cards-stack {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
        justify-content: flex-start;
    }

    .task-item {
        background: #171822;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .task-item-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .task-item-badge {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11px;
        font-weight: 900;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
    }
    .task-item-dl {
        font-size: 13px;
        font-weight: 700;
        color: #94A3B8;
    }
    .task-item-name {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.3;
    }
    .task-item-person {
        font-size: 13.5px;
        font-weight: 600;
        color: #CBD5E1;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .src-pill {
        font-size: 11px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(255,255,255,0.1);
        color: #94A3B8;
    }
    .src-pill-hero {
        font-size: 11px;
        font-weight: 900;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(0,0,0,0.18);
        color: #000000;
    }
    .task-item-action {
        font-size: 12.5px;
        font-weight: 500;
        color: #94A3B8;
        background: rgba(0,0,0,0.3);
        padding: 5px 9px;
        border-radius: 6px;
        border-left: 3px solid rgba(255,255,255,0.25);
    }

    /* HERO BRAND YELLOW CARD (3AE Tech Gold) */
    .task-item.hero-brand {
        background: #FCD10C;
        border: none;
        color: #000000;
        box-shadow: 0 10px 30px rgba(252,209,12,0.35);
    }
    .hero-brand .task-item-badge {
        background: #000000;
        color: #FCD10C;
        font-weight: 900;
    }
    .hero-brand .task-item-name {
        font-size: 17.5px;
        color: #000000;
        font-weight: 900;
    }
    .hero-brand .task-item-person {
        color: #18181B;
        font-weight: 800;
    }
    .hero-brand .task-item-action {
        background: rgba(0,0,0,0.12);
        color: #000000;
        font-weight: 800;
        border-left: 3px solid #000000;
    }

    /* EMPTY STATE */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px 20px;
        text-align: center;
        background: rgba(255,255,255,0.02);
        border: 1px dashed rgba(255,255,255,0.1);
        border-radius: 14px;
        margin: auto 0;
    }
    .empty-icon { font-size: 36px; margin-bottom: 8px; }
    .empty-title { font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .empty-desc { font-size: 13px; color: #64748B; font-weight: 500; }

    /* FOOTER BAR */
    .footer-bar {
        background: #111218;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 12px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
    }
    .footer-action {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
    }
    .footer-action span.icon { font-size: 20px; }
    .footer-action b { color: #FCD10C; font-weight: 900; }
    .footer-brand {
        font-size: 13.5px;
        font-weight: 600;
        color: #94A3B8;
    }
    .footer-brand b {
        color: #FCD10C;
        font-weight: 800;
    }
</style>
</head>
<body>

<div class="container">
    <!-- HEADER -->
    <div class="header">
        <div class="header-left">
            <div class="logo-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
                    <path d="M6 18L24 6L42 18" stroke="#FCD10C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M34 11.5V9H38V14.5" stroke="#FCD10C" stroke-width="2.5" stroke-linecap="round"/>
                    <rect x="9" y="18" width="30" height="24" rx="3" stroke="#FCD10C" stroke-width="3" fill="#000000"/>
                    <text x="13" y="29" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="900" fill="#FCD10C" letter-spacing="1">GĐ</text>
                    <text x="13" y="38" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="900" fill="#FCD10C" letter-spacing="1">TM</text>
                </svg>
            </div>
            <div class="title-group">
                <h1>VIỆC HÔM NAY & TẦM NHÌN NGÀY HÔM SAU</h1>
                <p>GIA DỤNG THÔNG MINH 3AE • NHẸ GÁNH VIỆC NHÀ, NHỜ NHÀ THÔNG MINH</p>
            </div>
        </div>
        <div class="header-right">
            <div class="capsule">🤖 AI Agent Tự Động Phân Tích</div>
            <div class="capsule yellow">📅 Hôm nay: $todayStr</div>
            <div class="capsule red">🚨 $($overdueList.Count) Quá hạn</div>
        </div>
    </div>

    <!-- 3 CỘT CHÍNH -->
    <div class="columns-grid">

        <!-- CỘT 1: CÔNG VIỆC ĐÃ TRỄ DEADLINE (ƯU TIÊN SỐ 1) -->
        <div class="column-panel overdue-col">
            <div class="col-header">
                <div class="col-title" style="color: #EF4444;">
                    <span>🚨</span> 1. ĐÃ TRỄ DEADLINE
                </div>
                <span class="col-badge badge-red">$($overdueList.Count) VIỆC QUÁ HẠN</span>
            </div>
            <div class="cards-stack">
                $overdueHtml
            </div>
        </div>

        <!-- CỘT 2: CÔNG VIỆC HÔM NAY (ƯU TIÊN SỐ 2) -->
        <div class="column-panel today-col">
            <div class="col-header">
                <div class="col-title" style="color: #FCD10C;">
                    <span>🔥</span> 2. VIỆC HÔM NAY ($todayShort)
                </div>
                <span class="col-badge badge-yellow">HẠN CHÓT TRONG NGÀY</span>
            </div>
            <div class="cards-stack">
                $todayHtml
            </div>
        </div>

        <!-- CỘT 3: CÔNG VIỆC NGÀY HÔM SAU & 48H TỚI (ƯU TIÊN SỐ 3) -->
        <div class="column-panel tomorrow-col">
            <div class="col-header">
                <div class="col-title" style="color: #38BDF8;">
                    <span>⚡</span> 3. NGÀY HÔM SAU & 48H TỚI
                </div>
                <span class="col-badge badge-blue">CHUẨN BỊ TRƯỚC</span>
            </div>
            <div class="cards-stack">
                $tomorrowHtml
            </div>
        </div>

    </div>

    <!-- FOOTER ACTION BAR -->
    <div class="footer-bar">
        <div class="footer-action">
            <span class="icon">🎯</span>
            <span>CHỈ ĐẠO HÀNG NGÀY: $footerMessage</span>
        </div>
        <div class="footer-brand">
            <b>GIA DỤNG THÔNG MINH 3AE</b> • Sản phẩm chính hãng — Xuất VAT đầy đủ — Bảo hành toàn diện
        </div>
    </div>
</div>

</body>
</html>
"@

$htmlPath = Join-Path $PSScriptRoot "daily_tasks_visual.html"
[System.IO.File]::WriteAllText($htmlPath, $htmlContent, [System.Text.Encoding]::UTF8)
Write-Host "✅ Đã tạo file HTML CSS Báo Cáo Hàng Ngày & Hôm Sau: $htmlPath" -ForegroundColor Green

# Chụp ảnh bằng Headless Edge hoặc Chrome
$browserPath = if (Test-Path "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe") {
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
} elseif (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
} else {
    Write-Error "Không tìm thấy Edge hoặc Chrome!"
    exit 1
}

$outputImage = Join-Path $PSScriptRoot $outputFilename
$tmpUserData = Join-Path $env:TEMP "edge_headless_tmp"
Write-Host "Đang render ảnh báo cáo hàng ngày ($Layout - ${viewportWidth}x${viewportHeight})..." -ForegroundColor Yellow

$proc = Start-Process -FilePath $browserPath -ArgumentList `
    "--headless=new", `
    "--disable-gpu", `
    "--no-sandbox", `
    "--hide-scrollbars", `
    "--user-data-dir=""$tmpUserData""", `
    "--force-device-scale-factor=1.5", `
    "--window-size=${viewportWidth},${viewportHeight}", `
    "--screenshot=""$outputImage""", `
    """$htmlPath""" -Wait -PassThru

if (-not (Test-Path $outputImage)) {
    Write-Error "Render ảnh thất bại!"
    exit 1
}

Write-Host "✅ Đã render thành công ảnh: $outputImage" -ForegroundColor Green

if ($NoSend) {
    Write-Host "[NO SEND] Đã lưu ảnh thành công: $outputImage" -ForegroundColor Yellow
    exit 0
}

# Upload CDN & Bắn Zalo
$photoUrl = Upload-ImageToCDN -filePath $outputImage

if ([string]::IsNullOrWhiteSpace($photoUrl)) {
    Write-Error "Upload thất bại!"
    exit 1
}

Write-Host "Đang bắn ảnh Báo Cáo Hàng Ngày vào Zalo ($ChatId)..." -ForegroundColor Yellow
$sent = Send-ZaloPhotoMessage -botToken $token -chatId $ChatId -photoUrl $photoUrl
if ($sent) {
    Write-Host "`n🎉 [THÀNH CÔNG] ĐÃ GỬI ẢNH BÁO CÁO HÀNG NGÀY & HÔM SAU VÀO ZALO!" -ForegroundColor Green
}
