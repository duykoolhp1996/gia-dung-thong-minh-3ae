[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$spreadsheetId = "1dI_z3TzLBmMgPmRICya6aVyqyw18qdgPitmsw2in5ac"
$dbPath = Join-Path $PSScriptRoot "marcom_rust\static\database.json"

Write-Host "Syncing Google Sheets data for 3AE Marcom System..."

function Parse-CsvText([string]$csvText) {
    $rows = New-Object System.Collections.Generic.List[object]
    if ([string]::IsNullOrWhiteSpace($csvText)) { return $rows }
    $currentRow = New-Object System.Collections.Generic.List[string]
    $currentCell = New-Object System.Text.StringBuilder
    $inQuotes = $false
    $len = $csvText.Length

    for ($i = 0; $i -lt $len; $i++) {
        $ch = $csvText[$i]
        if ($inQuotes) {
            if ($ch -eq '"') {
                if (($i + 1 -lt $len) -and ($csvText[$i + 1] -eq '"')) {
                    [void]$currentCell.Append('"')
                    $i++
                } else {
                    $inQuotes = $false
                }
            } else {
                [void]$currentCell.Append($ch)
            }
        } else {
            if ($ch -eq '"') {
                $inQuotes = $true
            } elseif ($ch -eq ',') {
                $currentRow.Add($currentCell.ToString())
                [void]$currentCell.Clear()
            } elseif ($ch -eq "`r") {
                continue
            } elseif ($ch -eq "`n") {
                $currentRow.Add($currentCell.ToString())
                [void]$currentCell.Clear()
                $rows.Add($currentRow.ToArray())
                $currentRow = New-Object System.Collections.Generic.List[string]
            } else {
                [void]$currentCell.Append($ch)
            }
        }
    }
    if ($currentCell.Length -gt 0 -or $currentRow.Count -gt 0) {
        $currentRow.Add($currentCell.ToString())
        $rows.Add($currentRow.ToArray())
    }
    return $rows
}

function Get-SheetData($tabName) {
    try {
        $rawRows = $null
        # 1. Thử dùng gsheets CLI nếu có sẵn trên máy local
        if (Get-Command gsheets -ErrorAction SilentlyContinue) {
            try {
                $jsonStr = gsheets readonly read $spreadsheetId "'$tabName'!A1:Z100" --json 2>$null
                if ($jsonStr) {
                    $rawRows = $jsonStr | ConvertFrom-Json
                }
            } catch {}
        }

        # 2. Fallback tự động qua HTTP CSV trực tiếp (Chạy trên Cloud / GitHub Actions không cần đăng nhập)
        if (-not $rawRows -or $rawRows.Count -le 1) {
            $encodedTab = [uri]::EscapeDataString($tabName)
            $csvUrl = "https://docs.google.com/spreadsheets/d/$spreadsheetId/gviz/tq?tqx=out:csv&sheet=$encodedTab"
            $csvRaw = curl.exe -sL --max-time 20 "$csvUrl"
            if (-not [string]::IsNullOrWhiteSpace($csvRaw)) {
                $rawRows = Parse-CsvText -csvText $csvRaw
            }
        }

        if (-not $rawRows -or $rawRows.Count -le 1) { return @() }

        $headers = $rawRows[0]
        $recs = @()

        for ($r = 1; $r -lt $rawRows.Count; $r++) {
            $row = $rawRows[$r]
            $hasAny = $false
            foreach ($cell in $row) {
                if ($cell -and [string]$cell -ne "") { $hasAny = $true; break }
            }
            if (-not $hasAny) { continue }

            $cleanTab = $tabName -replace '[^\w]', '_'
            $obj = [ordered]@{ "id" = "rec_${cleanTab}_$r" }
            for ($c = 0; $c -lt $headers.Count; $c++) {
                $h = [string]$headers[$c]
                if ([string]::IsNullOrWhiteSpace($h)) { continue }
                $val = if ($c -lt $row.Count) { [string]$row[$c] } else { "" }
                $obj[$h] = $val
            }
            $recs += [PSCustomObject]$obj
        }
        return $recs
    } catch {
        Write-Warning "Could not read sheet '$tabName': $_"
        return @()
    }
}

$personnel = Get-SheetData "👥 Quản Lý Tài Khoản Nhân Sự"
$masterTasks = Get-SheetData "Quản Lý Task Tổng"
$contentTasks = Get-SheetData "✍️ Content Calendar"
$designerTasks = Get-SheetData "Quản Lý Graphic Designer"
$editorTasks = Get-SheetData "Quản Lý Video Editor"
$channelsData = Get-SheetData "📱 Kênh Nền Tảng"
$sampleProducts = Get-SheetData "📦 Quản Lý Sản Phẩm Mẫu (MKT)"

Write-Host "Sync results:"
Write-Host " - Personnel (👥 Quản Lý Tài Khoản Nhân Sự): $($personnel.Count)"
Write-Host " - Master Tasks: $($masterTasks.Count)"
Write-Host " - Content: $($contentTasks.Count)"
Write-Host " - Designer: $($designerTasks.Count)"
Write-Host " - Editor: $($editorTasks.Count)"
Write-Host " - Channels: $($channelsData.Count)"
Write-Host " - Sample Products (📦 Quản Lý Sản Phẩm Mẫu): $($sampleProducts.Count)"

$totalFetched = $personnel.Count + $masterTasks.Count + $contentTasks.Count + $designerTasks.Count + $editorTasks.Count
if ($totalFetched -eq 0) {
    Write-Warning "⚠️ Đồng bộ thất bại: Toàn bộ bảng dữ liệu trả về 0 dòng! Giữ nguyên cơ sở dữ liệu hiện tại."
    exit 1
}

$managerTasks = @($masterTasks | Where-Object { $_.'Người phụ trách' -like "*Hải*" -or $_.'Bộ phận' -like "*Quản trị*" -or $_.'Mảng công việc' -like "*Chiến lược*" })

$db = [ordered]@{
    "syncedAt" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "spreadsheetId" = $spreadsheetId
    "spreadsheetUrl" = "https://docs.google.com/spreadsheets/d/$spreadsheetId/edit"
    "personnel" = @{
        "id" = "1081356969"
        "key" = "personnel"
        "name" = "👥 Quản Lý Tài Khoản Nhân Sự"
        "recordCount" = $personnel.Count
        "records" = $personnel
    }
    "master_tasks" = @{
        "id" = "429202796"
        "key" = "master_tasks"
        "name" = "Quản Lý Task Tổng"
        "recordCount" = $masterTasks.Count
        "records" = $masterTasks
    }
    "content" = @{
        "id" = "882471266"
        "key" = "content"
        "name" = "✍️ Content Calendar"
        "recordCount" = $contentTasks.Count
        "records" = $contentTasks
    }
    "designer" = @{
        "id" = "742919504"
        "key" = "designer"
        "name" = "Quản Lý Graphic Designer"
        "recordCount" = $designerTasks.Count
        "records" = $designerTasks
    }
    "editor" = @{
        "id" = "946716817"
        "key" = "editor"
        "name" = "Quản Lý Video Editor"
        "recordCount" = $editorTasks.Count
        "records" = $editorTasks
    }
    "manager" = @{
        "id" = "tblManager"
        "key" = "manager"
        "name" = "Quản Lý Marketing Manager (Trưởng Phòng)"
        "recordCount" = $managerTasks.Count
        "records" = $managerTasks
    }
    "channels" = @{
        "id" = "109"
        "key" = "channels"
        "name" = "📱 Kênh Nền Tảng"
        "recordCount" = $channelsData.Count
        "records" = $channelsData
    }
    "costs" = @{
        "id" = "tblCosts"
        "key" = "costs"
        "name" = "Quản Lý Chi Phí Marketing"
        "recordCount" = 0
        "records" = @()
    }
    "devices" = @{
        "id" = "tblDevices"
        "key" = "devices"
        "name" = "Thiết Bị & Bàn Giao"
        "recordCount" = 0
        "records" = @()
    }
    "kol_koc" = @{
        "id" = "tblKol"
        "key" = "kol_koc"
        "name" = "Danh Sách KOL & KOC"
        "recordCount" = 0
        "records" = @()
    }
    "sample_products" = @{
        "id" = "387098588"
        "key" = "sample_products"
        "name" = "📦 Quản Lý Sản Phẩm Mẫu (MKT)"
        "recordCount" = $sampleProducts.Count
        "records" = $sampleProducts
    }
}

$json = $db | ConvertTo-Json -Depth 10
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 1. Update marcom_rust/static/database.json & lark_tables_data.js
$rustStaticDir = Split-Path -Parent $dbPath
if (-not (Test-Path $rustStaticDir)) { New-Item -ItemType Directory -Path $rustStaticDir -Force | Out-Null }
[System.IO.File]::WriteAllText($dbPath, $json, $utf8NoBom)
$rustJsPath = Join-Path $PSScriptRoot "marcom_rust\static\lark_tables_data.js"
$jsContent = "// Auto-synced from Google Sheets Database: $spreadsheetId`n// Synced At: " + (Get-Date).ToString("dd/MM/yyyy HH:mm:ss") + "`nconst LARK_BASE_ALL_TABLES = " + $json + ";`n"
[System.IO.File]::WriteAllText($rustJsPath, $jsContent, $utf8NoBom)

# 2. Update root database.json & lark_tables_data.js
$rootDbPath = Join-Path $PSScriptRoot "database.json"
[System.IO.File]::WriteAllText($rootDbPath, $json, $utf8NoBom)
$rootJsPath = Join-Path $PSScriptRoot "lark_tables_data.js"
[System.IO.File]::WriteAllText($rootJsPath, $jsContent, $utf8NoBom)

# 3. Update marketing-dashboard-webapp/database.json
$mktDbPath = Join-Path $PSScriptRoot "marketing-dashboard-webapp\database.json"
$mktDir = Split-Path -Parent $mktDbPath
if (Test-Path $mktDir) {
    [System.IO.File]::WriteAllText($mktDbPath, $json, $utf8NoBom)
}

# 4. Embed fresh database.json directly into index.html
$indexHtmlPath = Join-Path $PSScriptRoot "index.html"
if (Test-Path $indexHtmlPath) {
    $htmlContent = [System.IO.File]::ReadAllText($indexHtmlPath, [System.Text.Encoding]::UTF8)
    $startMarker = "    const DB = {"
    $startPos = $htmlContent.IndexOf($startMarker)
    if ($startPos -lt 0) {
        $startMarker = "const DB = {"
        $startPos = $htmlContent.IndexOf($startMarker)
    }
    $endMarker = "    let currentCategory = 'dashboard';"
    $endPos = $htmlContent.IndexOf($endMarker)
    if ($startPos -ge 0 -and $endPos -gt $startPos) {
        $replacement = "    const DB = " + $json.Trim() + ";`n`n"
        $newHtml = $htmlContent.Substring(0, $startPos) + $replacement + $htmlContent.Substring($endPos)
        [System.IO.File]::WriteAllText($indexHtmlPath, $newHtml, $utf8NoBom)
        Write-Host " - index.html: Updated embedded database (100% Real Live Google Sheets Data)"
    }
}

Write-Host "✅ Database successfully updated and synchronized across all applications!" -ForegroundColor Green
