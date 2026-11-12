param (
    [string]$ChatId = "fe4d0d0d2659cf079648",
    [switch]$NoSend = $false,
    [switch]$IncludeManager = $false,
    [string]$TargetPerson = ""
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
$assetsDir = Join-Path $PSScriptRoot "assets"

if (-not (Test-Path $dbPath)) {
    Write-Error "Không tìm thấy cơ sở dữ liệu tại: $dbPath"
    exit 1
}

$rawJson = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
$db = $rawJson | ConvertFrom-Json

$uploadHelperPath = Join-Path $PSScriptRoot "UploadImageHelper.ps1"
if (Test-Path $uploadHelperPath) { . $uploadHelperPath }

# Helper: Kiểm tra hoàn thành
function Is-Done([string]$status) {
    if ([string]::IsNullOrWhiteSpace($status)) { return $false }
    return ($status -like "*hoàn thành*" -or $status -like "*đã duyệt*" -or $status -like "*Đã đăng*" -or $status -like "*5.*" -or $status -like "*6.*" -or $status -like "*8.*")
}

# Helper: Parse Date
function Parse-Date([string]$dateStr) {
    if ([string]::IsNullOrWhiteSpace($dateStr)) { return $null }
    $clean = $dateStr.Trim()
    try {
        return [DateTime]::ParseExact($clean, "dd/MM/yyyy", $null)
    } catch {
        try {
            return [DateTime]::ParseExact($clean, "d/M/yyyy", $null)
        } catch {
            try { return [DateTime]::Parse($clean) } catch { return $null }
        }
    }
}

$refDate = [DateTime]::ParseExact("09/11/2026", "dd/MM/yyyy", $null)

# =========================================================================
# BƯỚC 1: LẤY DANH SÁCH NHÂN SỰ TỪ SHEET "👥 Quản Lý Tài Khoản Nhân Sự"
# =========================================================================
$personnelRecords = $db.personnel.records
if (-not $personnelRecords -or $personnelRecords.Count -eq 0) {
    Write-Error "Không tìm thấy dữ liệu từ Sheet 👥 Quản Lý Tài Khoản Nhân Sự!"
    exit 1
}

Write-Host "=========================================================="
Write-Host "🚀 ĐỌC NHÂN SỰ TỪ SHEET '👥 Quản Lý Tài Khoản Nhân Sự' & TỰ ĐỘNG LỌC ĐA SHEET"
Write-Host "=========================================================="

# Avatar mapping theo tên
$avatarMap = @{
    "Duy" = "avatar_duy_manager.jpg"
    "Loan" = "avatar_loan_huynh.jpg"
    "Mỵ" = "avatar_my_content.jpg"
    "Phụng" = "avatar_phung_content.jpg"
    "Toan" = "avatar_media_editor.jpg"
    "Toàn" = "avatar_media_editor.jpg"
}

# Browser screenshot engine
$browserPath = if (Test-Path "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe") {
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
} elseif (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
} else {
    Write-Error "Không tìm thấy Edge hoặc Chrome!"
    exit 1
}

$sentReports = @()

foreach ($p in $personnelRecords) {
    $pName = [string]$p.'Họ Và Tên'
    if ([string]::IsNullOrWhiteSpace($pName)) { continue }
    $pName = $pName.Trim()
    $displayName = if ($pName -eq "Toan" -or $pName -eq "Toàn") { "Toàn" } else { $pName }

    # Nếu có chỉ định nhân sự cụ thể
    if (-not [string]::IsNullOrWhiteSpace($TargetPerson)) {
        if ($pName -notlike "*$TargetPerson*" -and $displayName -notlike "*$TargetPerson*") {
            continue
        }
    }

    # Mặc định báo cáo cho các nhân sự chuyên môn thực thi: Loan, Mỵ, Phụng, Toan.
    # Nếu muốn cả Manager (Duy) thì bật -IncludeManager
    if ($pName -eq "Duy" -and -not $IncludeManager -and [string]::IsNullOrWhiteSpace($TargetPerson)) {
        Write-Host "⏭️ Bỏ qua Duy (Trưởng phòng đã có Báo cáo Tổng thể phòng ban riêng). Dùng -IncludeManager nếu muốn tạo riêng."
        continue
    }

    $pRole = [string]$p.'Chức Danh & Vị Trí'
    $pDept = [string]$p.'Phòng Ban / Bộ Phận'
    if ([string]::IsNullOrWhiteSpace($pRole)) {
        if ($pDept -like "*Editor*") { $pRole = "Media Producer & Video Editor" }
        elseif ($pDept -like "*Graphic*") { $pRole = "Graphic Designer" }
        elseif ($pDept -like "*Content*") { $pRole = "Content Creator" }
        else { $pRole = $pDept }
    }

    $fullDept = if ($pDept) { "Phòng Marketing ($pDept 3AE)" } else { "Phòng Marketing 3AE" }
    $avatarFile = if ($avatarMap.ContainsKey($pName)) { $avatarMap[$pName] } else { "avatar_my_content.jpg" }

    Write-Host "`n>>> Đang tự động lọc công việc qua các sheet cho nhân sự: $pName ($pRole)..."

    # =========================================================================
    # BƯỚC 2: TỰ ĐỘNG LỌC TẤT CẢ CÁC SHEET THEO TÊN NHÂN SỰ
    # =========================================================================
    $rawTasks = @()

    # 1. Quét Sheet Task Tổng (master_tasks)
    if ($db.master_tasks -and $db.master_tasks.records) {
        foreach ($t in $db.master_tasks.records) {
            $assignee = [string]$t.'Người phụ trách'
            $taskName = [string]$t.'Tên công việc / Task'
            if ([string]::IsNullOrWhiteSpace($taskName)) { continue }

            $isMatch = $false
            if ($assignee -like "*$pName*") {
                $isMatch = $true
            } elseif ($pName -eq "Toan" -and ($assignee -like "*Editor*" -or $t.'Bộ phận thực hiện' -like "*Editor*" -or $t.'Bộ phận' -like "*Editor*")) {
                $isMatch = $true
            }

            if ($isMatch) {
                $rawTasks += [PSCustomObject]@{
                    SheetSource = "Task Tổng"
                    Name = $taskName
                    Deadline = $t.'Hạn chót (Deadline)'
                    Status = $t.'Trạng thái'
                    Priority = if ($t.'Mức độ ưu tiên') { $t.'Mức độ ưu tiên' } else { "P2 - Cao" }
                }
            }
        }
    }

    # 2. Quét Sheet Content Calendar (content)
    if ($db.content -and $db.content.records) {
        foreach ($t in $db.content.records) {
            $assignee = [string]$t.'Người Thực Hiện'
            if ([string]::IsNullOrWhiteSpace($assignee)) { $assignee = [string]$t.'Người thực hiện' }
            $taskName = [string]$t.'Tiêu Đề Bài Viết / Kịch Bản'
            if ([string]::IsNullOrWhiteSpace($taskName)) { $taskName = [string]$t.'Tên bài viết' }
            if ([string]::IsNullOrWhiteSpace($taskName)) { continue }

            if ($assignee -like "*$pName*" -or ($pName -eq "Mỵ" -and [string]::IsNullOrWhiteSpace($assignee))) {
                $rawTasks += [PSCustomObject]@{
                    SheetSource = "Content Calendar"
                    Name = $taskName
                    Deadline = if ($t.'Lịch Đăng (Air Date)') { $t.'Lịch Đăng (Air Date)' } else { $t.'Hạn nộp bản thảo' }
                    Status = if ($t.'Trạng Thái Duyệt') { $t.'Trạng Thái Duyệt' } else { $t.'Trạng thái' }
                    Priority = "P2 - Cao"
                }
            }
        }
    }

    # 3. Quét Sheet Graphic Designer (designer)
    if ($db.designer -and $db.designer.records) {
        foreach ($t in $db.designer.records) {
            $assignee = [string]$t.'Người phụ trách'
            $taskName = [string]$t.'Tên ấn phẩm / Task Thiết Kế'
            if ([string]::IsNullOrWhiteSpace($taskName)) { $taskName = [string]$t.'Tên ấn phẩm / Task' }
            if ([string]::IsNullOrWhiteSpace($taskName)) { continue }

            if ($assignee -like "*$pName*" -or ($pName -eq "Loan" -and [string]::IsNullOrWhiteSpace($assignee))) {
                $rawTasks += [PSCustomObject]@{
                    SheetSource = "Graphic Designer"
                    Name = $taskName
                    Deadline = $t.'Hạn chót (Deadline)'
                    Status = if ($t.'Trạng thái thiết kế') { $t.'Trạng thái thiết kế' } else { $t.'Trạng thái' }
                    Priority = if ($t.'Mức độ ưu tiên') { $t.'Mức độ ưu tiên' } else { "P2 - Cao" }
                }
            }
        }
    }

    # 4. Quét Sheet Video Editor (editor)
    if ($db.editor -and $db.editor.records) {
        if ($pName -eq "Toan" -or $pDept -like "*Editor*") {
            foreach ($t in $db.editor.records) {
                $taskName = [string]$t.'Tên Video / Dự án dựng'
                if ([string]::IsNullOrWhiteSpace($taskName)) { continue }

                $rawTasks += [PSCustomObject]@{
                    SheetSource = "Video Editor"
                    Name = $taskName
                    Deadline = $t.'Hạn chót bàn giao (Deadline)'
                    Status = if ($t.'Trạng thái dựng') { $t.'Trạng thái dựng' } else { $t.'Trạng thái' }
                    Priority = if ($t.'Mức độ ưu tiên') { $t.'Mức độ ưu tiên' } else { "P1 - Khẩn cấp" }
                }
            }
        }
    }

    # Phân loại công việc
    $totalAssigned = $rawTasks.Count
    $completedCount = 0
    $pendingList = @()
    $overdueList = @()
    $inWeekList = @()

    foreach ($t in $rawTasks) {
        $done = Is-Done $t.Status
        if ($done) {
            $completedCount++
            continue
        }

        $pendingList += $t
        $d = Parse-Date $t.Deadline
        if ($d -and $d -lt $refDate) {
            $overdueList += [PSCustomObject]@{
                SheetSource = $t.SheetSource
                Name = $t.Name
                Deadline = $t.Deadline
                Status = $t.Status
                DaysOver = [Math]::Floor(($refDate - $d).TotalDays)
            }
        } else {
            $inWeekList += $t
        }
    }

    $totalPending = $pendingList.Count
    $overdueCount = $overdueList.Count

    Write-Host "   -> Tổng việc: $totalAssigned | Đã xong: $completedCount | Còn lại: $totalPending (Quá hạn: $overdueCount)"

    # Đọc file ảnh chân dung cục bộ và mã hóa Base64
    $avatarImgPath = Join-Path $assetsDir $avatarFile
    $avatarDataUri = ""
    if (Test-Path $avatarImgPath) {
        $imgBytes = [System.IO.File]::ReadAllBytes($avatarImgPath)
        $b64 = [Convert]::ToBase64String($imgBytes)
        $avatarDataUri = "data:image/jpeg;base64,$b64"
    } else {
        $avatarDataUri = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces"
    }

    # Xây dựng HTML Task Trong tuần
    $tasksHtml = ""
    $topInWeek = $inWeekList | Select-Object -First 4
    if ($topInWeek.Count -eq 0) {
        $tasksHtml = "<div class='task-card' style='text-align:center; padding: 40px; color:#94A3B8; font-size:16px;'>🎉 Chưa có task mới phát sinh trong tuần này. Tiếp tục theo dõi!</div>"
    } else {
        foreach ($t in $topInWeek) {
            $isHero = ($t.Priority -like "*P1*" -or $t.Name -like "*SHOWMATCH*" -or $t.Name -like "*POSM*" -or $t.Name -like "*AOE*")
            $cardClass = if ($isHero) { "task-card hero-brand" } else { "task-card" }
            $tagClass = if ($isHero) { "task-tag hero-tag" } else { "task-tag normal-tag" }
            $dlText = if ($t.Deadline) { $t.Deadline } else { "Trong tuần" }

            $tasksHtml += @"
            <div class="$cardClass">
                <div class="task-card-header">
                    <span class="$tagClass">📌 [$($t.SheetSource)]</span>
                    <span class="task-dl">📅 Hạn: $dlText</span>
                </div>
                <div class="task-name">$($t.Name)</div>
            </div>
"@
        }
    }

    # Xây dựng HTML Task Quá hạn
    $overdueHtml = ""
    if ($overdueCount -gt 0) {
        $topOverdue = $overdueList | Select-Object -First 3
        foreach ($o in $topOverdue) {
            $overdueHtml += @"
            <div class="overdue-card">
                <div class="overdue-card-header">
                    <div class="overdue-name">$($o.Name)</div>
                    <span class="overdue-badge">⚠️ Quá hạn $($o.DaysOver) ngày</span>
                </div>
                <div class="overdue-sub">Nguồn: <b>$($o.SheetSource)</b> • Trạng thái: $($o.Status)</div>
                <div class="overdue-action">👉 Yêu cầu: Đẩy nhanh xử lý dứt điểm trước 17:00 ngày 10/11.</div>
            </div>
"@
        }
    } else {
        $overdueHtml = @"
        <div class="safe-card">
            <span class="safe-icon">✅</span>
            <div class="safe-title">XUẤT SẮC - KHÔNG CÓ VIỆC QUÁ HẠN!</div>
            <div class="safe-desc">Nhân sự đang bám sát tiến độ cam kết trên toàn bộ các trang tính.</div>
        </div>
"@
    }

    # AI Reminders
    $remindersHtml = "<li>Tổng hợp thực tế: Bạn có <b>$totalAssigned công việc</b> được giao, hiện còn <b>$totalPending việc</b> chưa xong ($overdueCount việc quá hạn).</li>"
    if ($overdueCount -gt 0) {
        $remindersHtml += "<li>CẦN ƯU TIÊN SỐ 1: Xử lý dứt điểm các công việc trễ hạn từ Master & chuyên môn trước khi nhận nhiệm vụ mới.</li>"
    } else {
        $remindersHtml += "<li>Duy trì tiến độ hoàn thành các đầu việc trọng tâm trong tuần theo lịch phê duyệt.</li>"
    }
    $remindersHtml += "<li>Chủ động đồng bộ trạng thái thực tế lên Google Sheets cuối mỗi ngày làm việc.</li>"

    # HTML 16:9 TEMPLATE
    $htmlContent = @"
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        width: 1920px;
        height: 1080px;
        background: #090A0F;
        color: #f5f5f7;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        padding: 30px 44px;
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
    }
    .container {
        width: 100%;
        height: 100%;
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
        padding-bottom: 16px;
    }
    .header-left {
        display: flex;
        align-items: center;
        gap: 20px;
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
        flex-shrink: 0;
    }
    .logo-box svg {
        width: 100%;
        height: 100%;
    }
    .avatar-wrapper {
        position: relative;
        width: 104px;
        height: 104px;
        flex-shrink: 0;
    }
    .avatar-img-box {
        width: 104px;
        height: 104px;
        border-radius: 28px;
        overflow: hidden;
        border: 3.5px solid #FCD10C;
        box-shadow: 0 10px 30px rgba(252,209,12,0.35);
        background: #111218;
    }
    .avatar-img-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .avatar-status-dot {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        background: #10B981;
        border: 3px solid #090A0F;
        border-radius: 50%;
    }
    .title-box { display: flex; flex-direction: column; gap: 4px; }
    .report-badge {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #FCD10C;
        text-transform: uppercase;
    }
    .person-name {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 36px;
        font-weight: 900;
        color: #ffffff;
        letter-spacing: -0.5px;
        line-height: 1.1;
    }
    .person-role-dept {
        font-size: 15.5px;
        color: #94A3B8;
    }
    .person-role-dept b { color: #f5f5f7; font-weight: 700; }
    .header-right { display: flex; gap: 12px; }
    .pill {
        background: #111218;
        border: 1.5px solid rgba(255,255,255,0.12);
        padding: 9px 18px;
        border-radius: 999px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 14.5px;
        font-weight: 700;
        color: #f5f5f7;
    }
    .pill.yellow {
        border-color: rgba(252,209,12,0.55);
        color: #FCD10C;
        background: rgba(252,209,12,0.12);
    }

    /* STATS ROW */
    .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 16px;
    }
    .stat-card {
        background: #111218;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 18px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .stat-card.danger {
        border-color: rgba(239,68,68,0.45);
        background: rgba(239,68,68,0.06);
    }
    .stat-num {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 48px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -1.5px;
    }
    .stat-card.danger .stat-num { color: #EF4444; }
    .stat-card.success .stat-num { color: #10B981; }
    .stat-label {
        font-size: 13.5px;
        font-weight: 700;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 6px;
    }
    .stat-icon {
        width: 46px;
        height: 46px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        background: #1A1B24;
    }
    .stat-card.danger .stat-icon { background: rgba(239,68,68,0.18); }
    .stat-card.success .stat-icon { background: rgba(16,185,129,0.18); }

    /* CONTENT GRID */
    .main-grid {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 22px;
        flex: 1;
        margin-top: 16px;
        min-height: 0;
    }
    .col-box {
        background: #111218;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
    }
    .col-title {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 16px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .col-title.yellow { color: #FCD10C; }
    .col-title.red { color: #EF4444; }

    .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
    }
    .task-card {
        background: #171822;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .task-card.hero-brand {
        background: #FCD10C;
        border: none;
        color: #000000;
        box-shadow: 0 10px 28px rgba(252,209,12,0.35);
    }
    .hero-brand .task-name {
        color: #000000;
        font-weight: 900;
    }
    .hero-brand .task-dl {
        color: #18181B;
        font-weight: 800;
    }
    .hero-brand .task-tag.hero-tag {
        background: #000000;
        color: #FCD10C;
        font-weight: 900;
    }
    .task-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .task-tag {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        padding: 3px 9px;
        border-radius: 6px;
    }
    .task-tag.normal-tag {
        background: rgba(255,255,255,0.08);
        color: #FCD10C;
    }
    .task-tag.hero-tag {
        background: #000000;
        color: #FCD10C;
    }
    .task-dl {
        font-size: 13.5px;
        font-weight: 700;
        color: #94A3B8;
    }
    .task-name {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 16.5px;
        font-weight: 700;
        line-height: 1.35;
        color: #ffffff;
    }

    /* OVERDUE / SAFE */
    .overdue-card {
        background: rgba(239,68,68,0.08);
        border: 1.5px solid rgba(239,68,68,0.4);
        border-radius: 14px;
        padding: 14px 18px;
        margin-bottom: 10px;
    }
    .overdue-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }
    .overdue-name {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
    }
    .overdue-badge {
        background: #EF4444;
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11.5px;
        font-weight: 900;
        padding: 3px 8px;
        border-radius: 5px;
        text-transform: uppercase;
    }
    .overdue-sub { font-size: 13.5px; color: #94A3B8; margin-bottom: 3px; }
    .overdue-action { font-size: 13px; color: #FCD10C; font-weight: 700; }

    .safe-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(16,185,129,0.06);
        border: 1.5px dashed rgba(16,185,129,0.35);
        border-radius: 14px;
        padding: 24px;
        text-align: center;
    }
    .safe-icon { font-size: 44px; margin-bottom: 10px; }
    .safe-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 800; color: #10B981; margin-bottom: 4px; }
    .safe-desc { font-size: 14px; color: #94A3B8; }

    /* FOOTER */
    .footer-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 16px;
    }
    .footer-box {
        background: #111218;
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 14px 20px;
    }
    .footer-title {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 13.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .footer-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .footer-list li {
        font-size: 13.5px;
        color: #CBD5E1;
        line-height: 1.4;
        position: relative;
        padding-left: 16px;
    }
    .footer-list li::before {
        content: "•";
        position: absolute;
        left: 0;
        color: #FCD10C;
        font-size: 16px;
        line-height: 14px;
    }
    .footer-list b { color: #ffffff; }
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
            <div class="avatar-wrapper">
                <div class="avatar-img-box">
                    <img src="$avatarDataUri" alt="$pName">
                </div>
                <div class="avatar-status-dot"></div>
            </div>
            <div class="title-box">
                <span class="report-badge">GIA DỤNG THÔNG MINH 3AE • BÁO CÁO CÔNG VIỆC CÁ NHÂN</span>
                <h1 class="person-name">$displayName</h1>
                <p class="person-role-dept"><b>$pRole</b> • $fullDept</p>
            </div>
        </div>
        <div class="header-right">
            <div class="pill yellow">📅 Tuần: 09/11 – 15/11/2026</div>
            <div class="pill">👔 Quản lý: Duy (Marketing Manager)</div>
        </div>
    </div>

    <!-- STATS ROW -->
    <div class="stats-row">
        <div class="stat-card">
            <div>
                <div class="stat-num">$totalAssigned</div>
                <div class="stat-label">Tổng việc (Tất cả các Sheet)</div>
            </div>
            <div class="stat-icon">📑</div>
        </div>
        <div class="stat-card success">
            <div>
                <div class="stat-num">$completedCount</div>
                <div class="stat-label">Đã hoàn thành</div>
            </div>
            <div class="stat-icon">✅</div>
        </div>
        <div class="stat-card $(if ($overdueCount -gt 0) { 'danger' } else { '' })">
            <div>
                <div class="stat-num">$totalPending</div>
                <div class="stat-label">Chưa xong $(if ($overdueCount -gt 0) { "($overdueCount quá hạn)" } else { '' })</div>
            </div>
            <div class="stat-icon">⚠️</div>
        </div>
    </div>

    <!-- MAIN GRID -->
    <div class="main-grid">
        <!-- CỘT 1: CÔNG VIỆC TRỌNG TÂM -->
        <div class="col-box">
            <div class="col-title yellow">🎯 II. CÔNG VIỆC TRONG TUẦN (PHÂN BỔ THEO TỪNG SHEET)</div>
            <div class="tasks-list">
                $tasksHtml
            </div>
        </div>

        <!-- CỘT 2: CÔNG VIỆC QUÁ HẠN -->
        <div class="col-box">
            <div class="col-title red">🚨 III. CÔNG VIỆC CHƯA HOÀN THÀNH TỪ TRƯỚC (QUÁ HẠN)</div>
            $overdueHtml
        </div>
    </div>

    <!-- FOOTER -->
    <div class="footer-grid">
        <div class="footer-box">
            <div class="footer-title" style="color: #FCD10C;">🤖 IV. NHẮC NHỞ TỪ AI AGENT</div>
            <ul class="footer-list">
                $remindersHtml
            </ul>
        </div>
        <div class="footer-box">
            <div class="footer-title" style="color: #10B981;">📑 V. YÊU CẦU CẬP NHẬT TRANG TÍNH</div>
            <ul class="footer-list">
                <li>Cập nhật tiến độ trên các bảng tính (Quản Lý Task Tổng & Sheet chuyên môn).</li>
                <li>Nêu rõ khó khăn, vướng mắc hoặc đề xuất dời deadline nếu cần thiết.</li>
                <li>Xác nhận các đầu việc đã bàn giao cho phòng ban khác.</li>
            </ul>
        </div>
    </div>
</div>
</body>
</html>
"@

    # Lưu file HTML
    $cleanName = ($pName -replace '[^\w]', '_').ToLower()
    $htmlPath = Join-Path $PSScriptRoot "Bao_Cao_Ca_Nhan_$cleanName.html"
    $pngPath = Join-Path $PSScriptRoot "Bao_Cao_Ca_Nhan_${cleanName}_16_9.png"
    [System.IO.File]::WriteAllText($htmlPath, $htmlContent, [System.Text.Encoding]::UTF8)

    # Render ảnh 16:9 bằng Headless Edge/Chrome
    $fileUrl = "file:///" + ($htmlPath.Replace("\", "/"))
    $edgeUserData = Join-Path $env:TEMP "EdgeShot_$cleanName"
    $process = Start-Process -FilePath $browserPath -ArgumentList @(
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1920,1080",
        "--screenshot=""$pngPath""",
        "--user-data-dir=""$edgeUserData""",
        "--no-sandbox",
        """$fileUrl"""
    ) -NoNewWindow -PassThru

    $process.WaitForExit()
    Write-Host "✅ Đã render ảnh: $pngPath"

    # Upload và gửi Zalo
    if (-not $NoSend -and (Test-Path $pngPath)) {
        $cdnUrl = Upload-ImageToCDN -filePath $pngPath
        if ($cdnUrl) {
            Write-Host "Đang bắn ảnh cá nhân của $pName vào Zalo ($ChatId)..."
            $sent = Send-ZaloPhotoMessage -botToken $token -chatId $ChatId -photoUrl $cdnUrl
            if ($sent) {
                Write-Host "🎉 Đã gửi ảnh báo cáo của $pName vào Zalo!"
                $sentReports += [PSCustomObject]@{
                    Name = $pName
                    Role = $pRole
                    Tasks = $totalAssigned
                    Pending = $totalPending
                    Overdue = $overdueCount
                    Url = $cdnUrl
                }
            }
        }
    }
}

Write-Host "`n🎉 [HOÀN TẤT] ĐÃ GỬI BÁO CÁO CÁ NHÂN THEO ĐÚNG SHEET 👥 Quản Lý Tài Khoản Nhân Sự VÀO ZALO!"
