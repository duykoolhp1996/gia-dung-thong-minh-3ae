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
$rootDir = Split-Path -Parent $PSScriptRoot
$dbPath = Join-Path $rootDir "marcom_rust\static\database.json"
if (-not (Test-Path $dbPath)) { $dbPath = Join-Path $rootDir "database.json" }
$filterRulesPath = Join-Path $PSScriptRoot "TaskFilterRules.ps1"

if (-not (Test-Path $dbPath)) {
    Write-Error "Không tìm thấy cơ sở dữ liệu tại: $dbPath"
    exit 1
}
if (-not (Test-Path $filterRulesPath)) {
    Write-Error "Không tìm thấy file quy tắc: $filterRulesPath"
    exit 1
}

$uploadHelperPath = Join-Path $PSScriptRoot "UploadImageHelper.ps1"
if (Test-Path $uploadHelperPath) { . $uploadHelperPath }

. $filterRulesPath

function Safe-Html([string]$text) {
    if ([string]::IsNullOrWhiteSpace($text)) { return "" }
    return $text.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}

$rawJson = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
$db = $rawJson | ConvertFrom-Json

$currentDate = if ($null -ne $Date -and $Date -ne [DateTime]::MinValue) { $Date } else { [DateTime]::Today }

# Xác định ngày đầu tuần (Thứ Hai) và cuối tuần (Chủ Nhật)
$deltaToMonday = (([int]$currentDate.DayOfWeek + 6) % 7)
$startOfWeek = $currentDate.AddDays(-$deltaToMonday).Date
$endOfWeek = $startOfWeek.AddDays(6).Date.AddHours(23).AddMinutes(59).AddSeconds(59)
$weekStr = "$($startOfWeek.ToString('dd/MM')) – $($endOfWeek.ToString('dd/MM/yyyy'))"

# Thu thập và phân tích dữ liệu đa sheet
$allTasks = Get-AllDepartmentTasks -Database $db
$filtered = Get-FilteredAndPrioritizedTasks -RawTasks $allTasks -ReferenceDate $currentDate -EndOfWeekDate $endOfWeek

# 4 CHỈ SỐ TỔNG QUAN
$totalTasksCount = $allTasks.Count
$doneCount = $filtered.Excluded_Completed.Count
$overdueCount = $filtered.Tier1_Overdue.Count
$inProgressCount = $filtered.TotalActive - $overdueCount

# THỐNG KÊ THEO 4 VỊ TRÍ
function Get-PersonWorkload($pName, $pRole, $pIcon) {
    $pTasks = @()
    foreach ($t in $allTasks) {
        $match = $false
        if ($t.Assignee -like "*$pName*") { $match = $true }
        elseif ($pName -eq "Toàn" -and ($t.Assignee -like "*Editor*" -or $t.SheetSource -eq "Video Editor")) { $match = $true }
        elseif ($pName -eq "Loan" -and $t.SheetSource -eq "Graphic Designer") { $match = $true }
        elseif ($pName -eq "Mỵ" -and $t.SheetSource -eq "Content Calendar" -and [string]::IsNullOrWhiteSpace($t.Assignee)) { $match = $true }

        if ($match) { $pTasks += $t }
    }

    $active = $pTasks | Where-Object { -not $_.IsDone -and -not $_.IsCancelled }
    $overdue = $active | Where-Object { $_.Deadline -and $_.Deadline.Date -lt $currentDate.Date }
    
    $loadDesc = "Bình thường"
    $badge = "badge-p2"
    $badgeText = "P2"
    if ($overdue.Count -gt 0) {
        $loadDesc = "Quá tải ($($overdue.Count) việc trễ)"
        $badge = "badge-p1"
        $badgeText = "P1"
    } elseif ($active.Count -ge 8) {
        $loadDesc = "Khối lượng cao ($($active.Count) task)"
        $badge = "badge-p1"
        $badgeText = "P1"
    }

    # Lấy thông báo hành động từ task gấp nhất
    $urgent = if ($overdue.Count -gt 0) { $overdue[0] } elseif ($active.Count -gt 0) { $active[0] } else { $null }
    $notice = if ($urgent) {
        "Ưu tiên: $($urgent.Name) ($($urgent.Status))."
    } else {
        "Đã hoàn thành toàn bộ các đầu việc trong tuần."
    }

    return [PSCustomObject]@{
        Role = $pRole
        Name = $pName
        Icon = $pIcon
        ActiveCount = $active.Count
        OverdueCount = $overdue.Count
        LoadDesc = $loadDesc
        BadgeClass = $badge
        BadgeText = $badgeText
        Notice = $notice
        TopUrgent = $urgent
    }
}

$posManager = Get-PersonWorkload -pName "Duy" -pRole "Marketing Manager" -pIcon "👔"
$posDesigner = Get-PersonWorkload -pName "Loan" -pRole "Senior Graphic Designer" -pIcon "🎨"
$posContent = Get-PersonWorkload -pName "Mỵ" -pRole "Content Creator" -pIcon "✍️"
$posEditor = Get-PersonWorkload -pName "Toàn" -pRole "Media Video Editor" -pIcon "🎬"

$positions = @($posManager, $posDesigner, $posContent, $posEditor)

# 4 THẺ CÔNG VIỆC TRỌNG TÂM (1 Hero Solid Orange + 3 Overdue/Urgent)
$focusCards = @()

# Card 1: Hero card (Lấy task hôm nay hoặc task trễ nhiều nhất)
$heroTask = if ($filtered.Tier2_Today.Count -gt 0) {
    $filtered.Tier2_Today[0]
} elseif ($filtered.Tier1_Overdue.Count -gt 0) {
    $filtered.Tier1_Overdue[0]
} elseif ($filtered.Tier3_In48h.Count -gt 0) {
    $filtered.Tier3_In48h[0]
} else {
    $allTasks[0]
}

# Các task tiếp theo cho 3 thẻ dark
$remainingFocus = @()
foreach ($t in $filtered.Tier1_Overdue) {
    if ($t.Id -ne $heroTask.Id) { $remainingFocus += $t }
}
foreach ($t in $filtered.Tier2_Today) {
    if ($t.Id -ne $heroTask.Id -and -not ($remainingFocus.Id -contains $t.Id)) { $remainingFocus += $t }
}
foreach ($t in $filtered.Tier3_In48h) {
    if ($t.Id -ne $heroTask.Id -and -not ($remainingFocus.Id -contains $t.Id)) { $remainingFocus += $t }
}
$top3Remaining = $remainingFocus | Select-Object -First 3

# Render HTML Position Cards
$posHtml = ""
foreach ($p in $positions) {
    $posHtml += @"
    <div class="pos-card">
        <div class="pos-header">
            <div class="pos-title-block">
                <span class="pos-icon">$($p.Icon)</span>
                <div>
                    <div class="pos-role">$($p.Role)</div>
                    <div class="pos-person">$($p.Name)</div>
                </div>
            </div>
            <span class="pos-badge $($p.BadgeClass)">$($p.BadgeText)</span>
        </div>
        <div class="pos-status-bar">
            <span class="pos-tag">$($p.ActiveCount) Task</span>
            <span class="pos-desc">$($p.LoadDesc)</span>
        </div>
        <div class="pos-notice">
            $((Safe-Html $p.Notice))
        </div>
    </div>
"@
}

# Render HTML Focus Task Cards
$focusCardsHtml = ""

# Thẻ Hero
$heroDl = if ($heroTask.DeadlineStr) { $heroTask.DeadlineStr } else { "Trong ngày" }
$heroAction = if ($heroTask.PriorityTier -eq 1) { "QUÁ HẠN $($heroTask.OverdueDays) NGÀY" } elseif ($heroTask.PriorityTier -eq 2) { "HẠN HÔM NAY" } else { "GẤP P1" }

$focusCardsHtml += @"
<div class="task-card hero-brand">
    <div class="task-card-header">
        <span class="task-tag tag-hero">🔥 $heroAction</span>
        <span style="font-size: 18px; font-weight: 900; color: #000000;">$($heroTask.Priority)</span>
    </div>
    <div class="task-title">
        $((Safe-Html $heroTask.Name))
    </div>
    <div class="task-meta">
        <div>Phụ trách: <b>$((Safe-Html $heroTask.Assignee))</b> <span style="font-size: 12px; opacity: 0.85;">[$($heroTask.SheetSource)]</span></div>
        <div>Hạn chót: <b>$heroDl</b> • Trạng thái: <b>$((Safe-Html $heroTask.Status))</b></div>
    </div>
    <div class="task-btn">
        <span>ƯU TIÊN DỨT ĐIỂM HÀNG ĐẦU</span>
        <span>➔</span>
    </div>
</div>
"@

# 3 Thẻ Dark
foreach ($t in $top3Remaining) {
    $tagClass = if ($t.PriorityTier -eq 1) { "tag-urgent" } else { "tag-blue" }
    $tagText = if ($t.PriorityTier -eq 1) { "⚠️ QUÁ HẠN $($t.OverdueDays) NGÀY" } elseif ($t.PriorityTier -eq 2) { "🔥 HẠN HÔM NAY" } else { "⚡ 48H TỚI" }
    $cardBorder = if ($t.PriorityTier -eq 1) { "overdue-task" } else { "" }
    $dl = if ($t.DeadlineStr) { $t.DeadlineStr } else { "Chưa có" }

    $focusCardsHtml += @"
    <div class="task-card $cardBorder">
        <div class="task-card-header">
            <span class="task-tag $tagClass">$tagText</span>
            <span style="font-size: 14px; font-weight: 800; color: #94A3B8;">Hạn: $dl</span>
        </div>
        <div class="task-title">
            $((Safe-Html $t.Name))
        </div>
        <div class="task-meta">
            <div>Phụ trách: <b>$((Safe-Html $t.Assignee))</b> <span style="color: #94A3B8;">[$($t.SheetSource)]</span></div>
            <div>Trạng thái: <b>$((Safe-Html $t.Status))</b></div>
        </div>
        <div class="task-btn">
            <span>Mức độ: $($t.Priority)</span>
            <span>⚡</span>
        </div>
    </div>
"@
}

# Configuration based on layout
$isMobile = ($Layout -in @("9:16", "mobile"))
$viewportWidth = if ($isMobile) { 1080 } else { 1920 }
$viewportHeight = if ($isMobile) { 1920 } else { 1080 }
$outputFilename = if ($isMobile) { "Bao_Cao_Tuan_Mobile.png" } else { "Bao_Cao_Tuan_16_9.png" }

# Footer recommendation
$footerAdvice = "Tập trung giải phóng <b>$overdueCount việc quá hạn</b> • Hoàn thành <b>$($filtered.Tier2_Today.Count) việc hôm nay</b> • Duy trì tiến độ toàn phòng Marcom 3AE"

$htmlContent = @"
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Weekly Work Management Report - Gia Dụng Thông Minh 3AE</title>
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
        font-size: $(if ($isMobile) { "25px" } else { "30px" });
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: #ffffff;
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
    .capsule-pill {
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
    .capsule-pill.yellow {
        background: rgba(252,209,12,0.15);
        border-color: rgba(252,209,12,0.55);
        color: #FCD10C;
    }

    /* STATS ROW */
    .stats-row {
        display: grid;
        grid-template-columns: $(if ($isMobile) { "repeat(2, 1fr)" } else { "repeat(4, 1fr)" });
        gap: $(if ($isMobile) { "12px" } else { "18px" });
        margin: 14px 0;
    }
    .stat-card {
        background: #111218;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .stat-card.overdue-card {
        border-color: rgba(239,68,68,0.45);
        background: linear-gradient(180deg, rgba(239,68,68,0.08) 0%, #111218 100%);
    }
    .stat-info .stat-num {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 40px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -1px;
    }
    .stat-info .stat-label {
        font-size: 14px;
        color: #94A3B8;
        margin-top: 6px;
        font-weight: 600;
    }
    .stat-badge {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
    }

    /* SECTION TITLE */
    .section-title {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 16.5px;
        font-weight: 900;
        color: #ffffff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
    }

    /* SECTION 1: 4 VỊ TRÍ NHÂN SỰ */
    .pos-grid {
        display: grid;
        grid-template-columns: $(if ($isMobile) { "repeat(2, 1fr)" } else { "repeat(4, 1fr)" });
        gap: $(if ($isMobile) { "10px" } else { "14px" });
        margin-bottom: 14px;
    }
    .pos-card {
        background: #14151D;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .pos-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 6px;
    }
    .pos-title-block {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .pos-icon {
        font-size: 24px;
    }
    .pos-role {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.2;
    }
    .pos-person {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 14px;
        font-weight: 800;
        color: #FCD10C;
        margin-top: 2px;
    }
    .pos-badge {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11.5px;
        font-weight: 900;
        padding: 3px 7px;
        border-radius: 6px;
        text-transform: uppercase;
    }
    .badge-p1 {
        background: rgba(239,68,68,0.22);
        color: #EF4444;
        border: 1.5px solid rgba(239,68,68,0.55);
    }
    .badge-p2 {
        background: rgba(252,209,12,0.22);
        color: #FCD10C;
        border: 1.5px solid rgba(252,209,12,0.55);
    }
    .pos-status-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 6px 0;
    }
    .pos-tag {
        font-size: 13px;
        font-weight: 800;
        background: rgba(255,255,255,0.08);
        padding: 3px 8px;
        border-radius: 5px;
        color: #ffffff;
    }
    .pos-desc {
        font-size: 13px;
        font-weight: 600;
        color: #94A3B8;
    }
    .pos-notice {
        font-size: 12.5px;
        font-weight: 500;
        line-height: 1.35;
        color: #E2E8F0;
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px;
        padding: 6px 10px;
        flex: 1;
        display: flex;
        align-items: center;
    }

    /* SECTION 2: 4 THẺ CÔNG VIỆC TRỌNG TÂM */
    .task-grid {
        display: grid;
        grid-template-columns: $(if ($isMobile) { "1fr" } else { "repeat(4, 1fr)" });
        gap: $(if ($isMobile) { "10px" } else { "14px" });
        flex: 1;
    }
    .task-card {
        background: #14151D;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .task-card.hero-brand {
        background: #FCD10C;
        border: none;
        color: #000000;
        box-shadow: 0 10px 32px rgba(252,209,12,0.35);
    }
    .hero-brand .task-tag {
        background: #000000;
        color: #FCD10C;
        font-size: 12px;
        font-weight: 900;
    }
    .hero-brand .task-title {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 18px;
        font-weight: 900;
        color: #000000;
        line-height: 1.3;
    }
    .hero-brand .task-meta {
        font-size: 13.5px;
        font-weight: 700;
        color: #18181B;
    }
    .hero-brand .task-btn {
        background: #000000;
        color: #FCD10C;
        font-size: 12.5px;
        font-weight: 900;
    }

    .task-card.overdue-task {
        border: 1.5px solid rgba(239,68,68,0.55);
        background: linear-gradient(180deg, rgba(239,68,68,0.1) 0%, #14151D 100%);
    }
    .task-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .task-tag {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11px;
        font-weight: 900;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .tag-urgent {
        background: rgba(239,68,68,0.22);
        color: #EF4444;
        border: 1px solid rgba(239,68,68,0.55);
    }
    .tag-blue {
        background: rgba(2,132,199,0.22);
        color: #38BDF8;
        border: 1px solid rgba(2,132,199,0.55);
    }
    .tag-hero {
        background: #000000;
        color: #FCD10C;
    }
    .task-title {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 16.5px;
        font-weight: 800;
        line-height: 1.35;
        color: #ffffff;
        margin-bottom: 10px;
        min-height: 44px;
    }
    .task-meta {
        font-size: 13.5px;
        font-weight: 600;
        color: #94A3B8;
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 10px;
    }
    .task-meta span b {
        color: #ffffff;
    }
    .task-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        padding: 8px 12px;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 800;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

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
    .footer-action span.icon {
        font-size: 20px;
    }
    .footer-action b {
        color: #FCD10C;
        font-weight: 900;
    }
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
                <h1>BÁO CÁO CÔNG VIỆC PHÒNG BAN & THÔNG BÁO VỊ TRÍ</h1>
                <p>GIA DỤNG THÔNG MINH 3AE • NHẸ GÁNH VIỆC NHÀ, NHỜ NHÀ THÔNG MINH</p>
            </div>
        </div>
        <div class="header-right">
            <div class="capsule-pill">🤖 AI Agent Phân Tích</div>
            <div class="capsule-pill yellow">📅 Tuần: $weekStr</div>
            <div class="capsule-pill">👥 4 Vị trí nhân sự</div>
        </div>
    </div>

    <!-- I. 4 CHỈ SỐ TỔNG QUAN -->
    <div class="stats-row">
        <div class="stat-card">
            <div class="stat-info">
                <div class="stat-num" style="color: #ffffff;">$($totalTasksCount.ToString('00'))</div>
                <div class="stat-label">Tổng việc theo dõi</div>
            </div>
            <div class="stat-badge" style="background: rgba(255,255,255,0.08); color: #fff;">📋</div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <div class="stat-num" style="color: #10B981;">$($doneCount.ToString('00'))</div>
                <div class="stat-label">Đã hoàn thành</div>
            </div>
            <div class="stat-badge" style="background: rgba(16,185,129,0.18); color: #10B981;">✅</div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <div class="stat-num" style="color: #FCD10C;">$($inProgressCount.ToString('00'))</div>
                <div class="stat-label">Đang làm / Chờ duyệt</div>
            </div>
            <div class="stat-badge" style="background: rgba(252,209,12,0.18); color: #FCD10C;">⏳</div>
        </div>
        <div class="stat-card overdue-card">
            <div class="stat-info">
                <div class="stat-num" style="color: #EF4444;">$($overdueCount.ToString('00'))</div>
                <div class="stat-label" style="color: #EF4444;">Quá hạn (Cần xử lý)</div>
            </div>
            <div class="stat-badge" style="background: rgba(239,68,68,0.22); color: #EF4444;">🚨</div>
        </div>
    </div>

    <!-- SECTION 1: 4 VỊ TRÍ NHÂN SỰ & THÔNG BÁO HÀNH ĐỘNG -->
    <div class="section-title">
        <span>📢</span> THÔNG BÁO VẬN HÀNH 4 VỊ TRÍ PHÒNG MARKETING
    </div>
    <div class="pos-grid">
        $posHtml
    </div>

    <!-- SECTION 2: 4 THẺ CÔNG VIỆC TRỌNG TÂM -->
    <div class="section-title">
        <span>🚨</span> CÔNG VIỆC TRỌNG TÂM & QUÁ HẠN CẦN XỬ LÝ GẤP
    </div>
    <div class="task-grid">
        $focusCardsHtml
    </div>

    <!-- FOOTER ACTION BAR -->
    <div class="footer-bar">
        <div class="footer-action">
            <span class="icon">🎯</span>
            <span>CHỈ ĐẠO TUẦN: $footerAdvice</span>
        </div>
        <div class="footer-brand">
            <b>GIA DỤNG THÔNG MINH 3AE</b> • Sản phẩm chính hãng — Xuất VAT đầy đủ — Bảo hành toàn diện
        </div>
    </div>
</div>

</body>
</html>
"@

$htmlPath = Join-Path $PSScriptRoot "weekly_report_visual.html"
[System.IO.File]::WriteAllText($htmlPath, $htmlContent, [System.Text.Encoding]::UTF8)
Write-Host "✅ Đã tạo file HTML Báo Cáo Tuần: $htmlPath" -ForegroundColor Green

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
Write-Host "Đang render ảnh báo cáo tuần ($Layout - ${viewportWidth}x${viewportHeight})..." -ForegroundColor Yellow

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
    Write-Error "Render ảnh báo cáo tuần thất bại!"
    exit 1
}

Write-Host "✅ Đã render thành công ảnh: $outputImage" -ForegroundColor Green

if ($NoSend) {
    Write-Host "[NO SEND] Đã lưu ảnh báo cáo tuần thành công: $outputImage" -ForegroundColor Yellow
    exit 0
}

# Upload CDN & Bắn Zalo
$photoUrl = Upload-ImageToCDN -filePath $outputImage

if ([string]::IsNullOrWhiteSpace($photoUrl)) {
    Write-Error "Upload ảnh thất bại!"
    exit 1
}

Write-Host "Đang bắn ảnh Báo Cáo Tuần vào Zalo ($ChatId)..." -ForegroundColor Yellow
$sent = Send-ZaloPhotoMessage -botToken $token -chatId $ChatId -photoUrl $photoUrl
if ($sent) {
    Write-Host "`n🎉 [THÀNH CÔNG] ĐÃ GỬI ẢNH BÁO CÁO TUẦN VÀO ZALO!" -ForegroundColor Green
}
