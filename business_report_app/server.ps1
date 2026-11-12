<#
.SYNOPSIS
  3AE Operational Business Reporting Application - Native Windows PowerShell 5.1 REST & Static Server
.DESCRIPTION
  Zero-dependency HTTP server utilizing System.Net.HttpListener. Provides 100% route,
  calculation, and response parity with server.js.
.PARAMETER Port
  The HTTP port to bind to (Default: 3000)
.PARAMETER HostAddress
  The host interface to bind (Default: "localhost")
#>

param (
    [int]$Port = 3000,
    [string]$HostAddress = "localhost"
)

# --- Base Directory & Path Setup ---
$baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$publicDir = [System.IO.Path]::GetFullPath((Join-Path $baseDir "public"))
$dataDir = [System.IO.Path]::GetFullPath((Join-Path $baseDir "data"))
$seedFile = Join-Path $dataDir "seed.json"
$dbFile = Join-Path $dataDir "database.json"

$validDepartments = @("ecom", "digital", "marcom", "cskh")

# MIME Types Dictionary
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
    ".map"  = "application/json; charset=utf-8"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

# --- Database & Persistence Subsystem ---
function Ensure-Database {
    if (-not (Test-Path $dataDir)) {
        New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    }
    if (-not (Test-Path $dbFile)) {
        if (Test-Path $seedFile) {
            Copy-Item -Path $seedFile -Destination $dbFile -Force
        } else {
            $initialJson = '{"ecom":[],"digital":[],"marcom":[],"cskh":[]}'
            $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText($dbFile, $initialJson, $utf8NoBom)
        }
    }
}

function Read-Database {
    Ensure-Database
    try {
        $raw = [System.IO.File]::ReadAllText($dbFile, [System.Text.Encoding]::UTF8)
        $data = $raw | ConvertFrom-Json
        $res = @{}
        foreach ($d in $validDepartments) {
            $arr = @()
            if ($data.$d) {
                foreach ($item in $data.$d) { $arr += $item }
            }
            $res[$d] = $arr
        }
        return $res
    } catch {
        Write-Warning "[DB Error] Failed to read database: $_"
        return @{ ecom = @(); digital = @(); marcom = @(); cskh = @() }
    }
}

function Write-DatabaseAtomic($dataObj) {
    Ensure-Database
    $tmpFile = Join-Path $dataDir ".db_tmp_$([System.Guid]::NewGuid().ToString('N')).json"
    try {
        $jsonStr = $dataObj | ConvertTo-Json -Depth 20
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($tmpFile, $jsonStr, $utf8NoBom)
        [System.IO.File]::Copy($tmpFile, $dbFile, $true)
        [System.IO.File]::Delete($tmpFile)
        return $true
    } catch {
        if (Test-Path $tmpFile) {
            Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
        }
        throw $_
    }
}

function Reset-Database {
    Ensure-Database
    if (Test-Path $seedFile) {
        [System.IO.File]::Copy($seedFile, $dbFile, $true)
        return $true
    } else {
        $empty = @{ ecom = @(); digital = @(); marcom = @(); cskh = @() }
        Write-DatabaseAtomic $empty
        return $false
    }
}

# --- Safe Math Helpers ---
function Parse-Num($val, [double]$fallback = 0.0) {
    if ($val -eq $null) { return $fallback }
    if ($val -is [int] -or $val -is [long] -or $val -is [double] -or $val -is [decimal]) { return [double]$val }
    $str = [string]$val
    $cleaned = $str.Replace(',', '').Trim()
    if ([string]::IsNullOrWhiteSpace($cleaned)) { return $fallback }
    [double]$res = 0.0
    if ([double]::TryParse($cleaned, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$res)) {
        return $res
    }
    return $fallback
}

function Clamp-Val([double]$val, [double]$min, [double]$max) {
    return [Math]::Min($max, [Math]::Max($min, $val))
}

# --- Native Metric Calculations (100% engine.js Parity) ---
function Calculate-Ecom($records) {
    $recs = if ($records) { @($records) } else { @() }
    if ($recs.Count -eq 0) {
        return [PSCustomObject]@{
            total_revenue = 0
            total_orders = 0
            total_completed_orders = 0
            total_cancelled_orders = 0
            total_traffic = 0
            cvr = 0.0
            aov = 0.0
            cancellation_rate = 0.0
            channel_breakdown = @{}
        }
    }

    [double]$totalRevenue = 0
    [double]$totalOrders = 0
    [double]$totalCompleted = 0
    [double]$totalCancelled = 0
    [double]$totalTraffic = 0
    $channelMap = @{}

    foreach ($r in $recs) {
        $rev = Parse-Num $r.revenue
        $ord = if ($r.orders -ne $null) { Parse-Num $r.orders } else { Parse-Num $r.order_volume }
        $can = Parse-Num $r.cancelled_orders
        $comp = if ($r.completed_orders -ne $null) { Parse-Num $r.completed_orders } else { ($ord - $can) }
        $traf = if ($r.traffic -ne $null) { Parse-Num $r.traffic } else { Parse-Num $r.visitors }
        $ch = if ($r.channel) { [string]$r.channel.ToString().Trim() } else { "Other" }

        $totalRevenue += $rev
        $totalOrders += $ord
        $totalCompleted += $comp
        $totalCancelled += $can
        $totalTraffic += $traf

        if (-not $channelMap.ContainsKey($ch)) { $channelMap[$ch] = 0 }
        $channelMap[$ch] += $rev
    }

    $channelBreakdown = @{}
    foreach ($k in $channelMap.Keys) {
        $channelBreakdown[$k] = [Math]::Round([double]$channelMap[$k], 2)
    }

    $cvr = if ($totalTraffic -gt 0) { [Math]::Round(($totalOrders / $totalTraffic) * 100, 2) } else { 0.0 }
    $aov = if ($totalOrders -gt 0) { [Math]::Round($totalRevenue / $totalOrders, 2) } else { 0.0 }
    $cancellationRate = if ($totalOrders -gt 0) { [Math]::Round(($totalCancelled / $totalOrders) * 100, 2) } else { 0.0 }

    return [PSCustomObject]@{
        total_revenue = [Math]::Round($totalRevenue, 2)
        total_orders = [Math]::Round($totalOrders)
        total_completed_orders = [Math]::Round($totalCompleted)
        total_cancelled_orders = [Math]::Round($totalCancelled)
        total_traffic = [Math]::Round($totalTraffic)
        cvr = $cvr
        aov = $aov
        cancellation_rate = $cancellationRate
        channel_breakdown = $channelBreakdown
    }
}

function Calculate-Digital($records) {
    $recs = if ($records) { @($records) } else { @() }
    if ($recs.Count -eq 0) {
        return [PSCustomObject]@{
            total_spend = 0
            total_attributed_revenue = 0
            roas = 0.0
            total_impressions = 0
            total_clicks = 0
            ctr = 0.0
            cpc = 0.0
            cpl = 0.0
            total_leads = 0
            channel_breakdown = @{}
        }
    }

    [double]$totalSpend = 0
    [double]$totalAttributedRev = 0
    [double]$totalImpressions = 0
    [double]$totalClicks = 0
    [double]$totalLeads = 0
    $channelMap = @{}

    foreach ($r in $recs) {
        $sp = if ($r.spend -ne $null) { Parse-Num $r.spend } else { Parse-Num $r.ad_spend }
        $ar = Parse-Num $r.attributed_revenue
        $im = Parse-Num $r.impressions
        $cl = Parse-Num $r.clicks
        $ld = Parse-Num $r.leads
        $ch = if ($r.channel) { [string]$r.channel.ToString().Trim() } else { "Other" }

        $totalSpend += $sp
        $totalAttributedRev += $ar
        $totalImpressions += $im
        $totalClicks += $cl
        $totalLeads += $ld

        if (-not $channelMap.ContainsKey($ch)) { $channelMap[$ch] = 0 }
        $channelMap[$ch] += $sp
    }

    $channelBreakdown = @{}
    foreach ($k in $channelMap.Keys) {
        $channelBreakdown[$k] = [Math]::Round([double]$channelMap[$k], 2)
    }

    $roas = if ($totalSpend -gt 0) { [Math]::Round($totalAttributedRev / $totalSpend, 2) } else { 0.0 }
    $ctr = if ($totalImpressions -gt 0) { [Math]::Round(($totalClicks / $totalImpressions) * 100, 2) } else { 0.0 }
    $cpc = if ($totalClicks -gt 0) { [Math]::Round($totalSpend / $totalClicks, 2) } else { 0.0 }
    $cpl = if ($totalLeads -gt 0) { [Math]::Round($totalSpend / $totalLeads, 2) } else { 0.0 }

    return [PSCustomObject]@{
        total_spend = [Math]::Round($totalSpend, 2)
        total_attributed_revenue = [Math]::Round($totalAttributedRev, 2)
        roas = $roas
        total_impressions = [Math]::Round($totalImpressions)
        total_clicks = [Math]::Round($totalClicks)
        ctr = $ctr
        cpc = $cpc
        cpl = $cpl
        total_leads = [Math]::Round($totalLeads)
        channel_breakdown = $channelBreakdown
    }
}

function Calculate-MarCom($records) {
    $recs = if ($records) { @($records) } else { @() }
    if ($recs.Count -eq 0) {
        return [PSCustomObject]@{
            total_reach = 0
            total_leads = 0
            avg_milestone = 0.0
            avg_sentiment = 0.0
            total_budget = 0
            total_spend = 0
            budget_utilization = 0.0
            active_campaigns = 0
            completed_campaigns = 0
            type_breakdown = @{}
        }
    }

    [double]$totalReach = 0
    [double]$totalLeads = 0
    [double]$totalBudget = 0
    [double]$totalSpend = 0
    [double]$milestoneSum = 0
    [double]$sentimentSum = 0
    [int]$activeCount = 0
    [int]$completedCount = 0
    $typeMap = @{}

    foreach ($r in $recs) {
        $rc = if ($r.reach -ne $null) { Parse-Num $r.reach } else { Parse-Num $r.campaign_reach }
        $ld = Parse-Num $r.leads
        $bg = Parse-Num $r.budget
        $sp = Parse-Num $r.spend
        $status = if ($r.status) { [string]$r.status.ToString().Trim() } else { "" }
        $type = if ($r.type) { [string]$r.type.ToString().Trim() } else { "Other" }

        $m = Parse-Num $r.milestone_progress
        if ($m -gt 0 -and $m -le 1.0) { $m = $m * 100 }
        $milestoneSum += (Clamp-Val $m 0 100)

        $s = Parse-Num $r.sentiment_score
        if ($s -gt 5.0) { $s = ($s / 100.0) * 5.0 }
        $sentimentSum += (Clamp-Val $s 0 5.0)

        $totalReach += $rc
        $totalLeads += $ld
        $totalBudget += $bg
        $totalSpend += $sp

        if ($status.ToLower() -eq "active") { $activeCount++ }
        if ($status.ToLower() -eq "completed") { $completedCount++ }

        if (-not $typeMap.ContainsKey($type)) { $typeMap[$type] = 0 }
        $typeMap[$type]++
    }

    $n = $recs.Count
    $avgMilestone = if ($n -gt 0) { [Math]::Round($milestoneSum / $n, 2) } else { 0.0 }
    $avgSentiment = if ($n -gt 0) { [Math]::Round($sentimentSum / $n, 2) } else { 0.0 }
    $budgetUtilization = if ($totalBudget -gt 0) { [Math]::Round(($totalSpend / $totalBudget) * 100, 2) } else { 0.0 }

    return [PSCustomObject]@{
        total_reach = [Math]::Round($totalReach)
        total_leads = [Math]::Round($totalLeads)
        avg_milestone = $avgMilestone
        avg_sentiment = $avgSentiment
        total_budget = [Math]::Round($totalBudget, 2)
        total_spend = [Math]::Round($totalSpend, 2)
        budget_utilization = $budgetUtilization
        active_campaigns = $activeCount
        completed_campaigns = $completedCount
        type_breakdown = $typeMap
    }
}

function Calculate-CSKH($records) {
    $recs = if ($records) { @($records) } else { @() }
    if ($recs.Count -eq 0) {
        return [PSCustomObject]@{
            total_tickets = 0
            resolved_tickets = 0
            resolution_rate = 0.0
            csat_percentage = 0.0
            avg_resolution_time = 0.0
            fcr_rate = 0.0
            total_escalations = 0
            channel_breakdown = @{}
        }
    }

    [double]$totalTickets = 0
    [double]$resolvedTickets = 0
    [double]$fcrTickets = 0
    [double]$totalEscalations = 0
    [double]$weightedCsatSum = 0
    [double]$weightedResTimeSum = 0
    [double]$resolvedTicketsForTime = 0
    $channelMap = @{}

    foreach ($r in $recs) {
        $tc = if ($r.ticket_count -ne $null) { Parse-Num $r.ticket_count } else { Parse-Num $r.tickets }
        $rc = if ($r.resolved_count -ne $null) { Parse-Num $r.resolved_count } else { Parse-Num $r.resolved_tickets }
        $fc = Parse-Num $r.fcr_count
        $esc = Parse-Num $r.escalation_count
        $rt = if ($r.avg_resolution_time_minutes -ne $null) { Parse-Num $r.avg_resolution_time_minutes } else { Parse-Num $r.avg_resolution_time }
        $ch = if ($r.channel) { [string]$r.channel.ToString().Trim() } else { "Other" }

        $rawCsat = Parse-Num $r.csat_score
        $csatPct = if ($rawCsat -gt 0 -and $rawCsat -le 5.0) { ($rawCsat / 5.0) * 100.0 } else { Clamp-Val $rawCsat 0 100 }

        $totalTickets += $tc
        $resolvedTickets += $rc
        $fcrTickets += $fc
        $totalEscalations += $esc

        $weightedCsatSum += ($csatPct * $tc)

        if ($rc -gt 0) {
            $weightedResTimeSum += ($rt * $rc)
            $resolvedTicketsForTime += $rc
        }

        if (-not $channelMap.ContainsKey($ch)) { $channelMap[$ch] = 0 }
        $channelMap[$ch] += $tc
    }

    $resolutionRate = if ($totalTickets -gt 0) { [Math]::Round(($resolvedTickets / $totalTickets) * 100, 2) } else { 0.0 }
    $csatPercentage = if ($totalTickets -gt 0) { [Math]::Round($weightedCsatSum / $totalTickets, 2) } else { 0.0 }
    $avgResolutionTime = if ($resolvedTicketsForTime -gt 0) { [Math]::Round($weightedResTimeSum / $resolvedTicketsForTime, 2) } else { 0.0 }
    $fcrRate = if ($totalTickets -gt 0) { [Math]::Round(($fcrTickets / $totalTickets) * 100, 2) } else { 0.0 }

    return [PSCustomObject]@{
        total_tickets = [Math]::Round($totalTickets)
        resolved_tickets = [Math]::Round($resolvedTickets)
        resolution_rate = $resolutionRate
        csat_percentage = $csatPercentage
        avg_resolution_time = $avgResolutionTime
        fcr_rate = $fcrRate
        total_escalations = [Math]::Round($totalEscalations)
        channel_breakdown = $channelMap
    }
}

function Calculate-DivisionOverview($ecom, $dig, $marcom, $cskh) {
    $e = if ($ecom) { $ecom } else { @{} }
    $d = if ($dig) { $dig } else { @{} }
    $m = if ($marcom) { $marcom } else { @{} }
    $c = if ($cskh) { $cskh } else { @{} }

    [double]$totalRevenue = Parse-Num $e.total_revenue
    [double]$digitalSpend = Parse-Num $d.total_spend
    [double]$marcomSpend = Parse-Num $m.total_spend
    [double]$totalMarketingSpend = $digitalSpend + $marcomSpend
    [double]$totalLeads = (Parse-Num $d.total_leads) + (Parse-Num $m.total_leads)
    [double]$totalTickets = Parse-Num $c.total_tickets
    [double]$divisionCsat = Parse-Num $c.csat_percentage

    $blendedMer = if ($totalMarketingSpend -gt 0) { [Math]::Round($totalRevenue / $totalMarketingSpend, 2) } else { 0.0 }

    # Component Sub-scores (0 to 100)
    # 1. Ecom (35%)
    $cvrScore = Clamp-Val (((Parse-Num $e.cvr) / 4.0) * 100) 0 100
    $cancelScore = Clamp-Val (100 - ((Parse-Num $e.cancellation_rate) * 5)) 0 100
    $sEcom = if ((Parse-Num $e.total_orders) -gt 0) { (0.7 * $cvrScore + 0.3 * $cancelScore) } else { 0.0 }

    # 2. Digital (30%)
    $roasScore = Clamp-Val (((Parse-Num $d.roas) / 5.0) * 100) 0 100
    $ctrScore = Clamp-Val (((Parse-Num $d.ctr) / 4.0) * 100) 0 100
    $sDigital = if ((Parse-Num $d.total_spend) -gt 0) { (0.75 * $roasScore + 0.25 * $ctrScore) } else { 0.0 }

    # 3. MarCom (20%)
    $milestoneScore = Clamp-Val (Parse-Num $m.avg_milestone) 0 100
    $sentimentScore = Clamp-Val (((Parse-Num $m.avg_sentiment) / 5.0) * 100) 0 100
    $sMarCom = if ((Parse-Num $m.total_reach) -gt 0 -or (Parse-Num $m.total_budget) -gt 0) { (0.5 * $milestoneScore + 0.5 * $sentimentScore) } else { 0.0 }

    # 4. CSKH (15%)
    $csatScore = Clamp-Val (Parse-Num $c.csat_percentage) 0 100
    $resScore = Clamp-Val (Parse-Num $c.resolution_rate) 0 100
    $fcrScore = Clamp-Val (Parse-Num $c.fcr_rate) 0 100
    $sCSKH = if ((Parse-Num $c.total_tickets) -gt 0) {
        (0.5 * $csatScore + 0.3 * $resScore + 0.2 * $fcrScore)
    } else {
        if ($totalRevenue -gt 0) { 100.0 } else { 0.0 }
    }

    $healthScore = (0.35 * $sEcom) + (0.30 * $sDigital) + (0.20 * $sMarCom) + (0.15 * $sCSKH)
    $healthScore = Clamp-Val $healthScore 0 100
    $roundedHealth = [Math]::Round($healthScore, 1)

    $healthGrade = if ($roundedHealth -ge 90.0) {
        "Xuất sắc (Hạng A+)"
    } elseif ($roundedHealth -ge 80.0) {
        "Tốt (Hạng A)"
    } elseif ($roundedHealth -ge 70.0) {
        "Khá (Hạng B)"
    } elseif ($roundedHealth -ge 50.0) {
        "Trung bình (Hạng C)"
    } elseif ($roundedHealth -gt 0) {
        "Cần cải thiện (Hạng D)"
    } else {
        "Chưa có dữ liệu"
    }

    return [PSCustomObject]@{
        enterprise_health_score = $roundedHealth
        health_grade = $healthGrade
        total_revenue = [Math]::Round($totalRevenue, 2)
        total_marketing_spend = [Math]::Round($totalMarketingSpend, 2)
        digital_spend = [Math]::Round($digitalSpend, 2)
        marcom_spend = [Math]::Round($marcomSpend, 2)
        blended_mer = $blendedMer
        total_leads = [Math]::Round($totalLeads)
        division_csat = [Math]::Round($divisionCsat, 2)
        total_tickets = [Math]::Round($totalTickets)
        department_scores = [PSCustomObject]@{
            ecom = [Math]::Round($sEcom, 1)
            digital = [Math]::Round($sDigital, 1)
            marcom = [Math]::Round($sMarCom, 1)
            cskh = [Math]::Round($sCSKH, 1)
        }
    }
}

# --- HTTP Helpers ---
function Send-JsonResponse($response, [int]$statusCode, [object]$data) {
    $jsonStr = if ($data -is [string]) { $data } else { $data | ConvertTo-Json -Depth 20 -Compress }
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
    $response.StatusCode = $statusCode
    $response.ContentType = "application/json; charset=utf-8"
    $response.ContentLength64 = $bytes.Length
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
    $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With")
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
}

function Send-ErrorResponse($response, [int]$statusCode, [string]$message) {
    $errObj = [PSCustomObject]@{ error = $message }
    Send-JsonResponse $response $statusCode $errObj
}

function Read-RequestBody($request) {
    if (-not $request.HasEntityBody) { return @{} }
    $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
    $raw = $reader.ReadToEnd()
    $reader.Close()
    if ([string]::IsNullOrWhiteSpace($raw)) { return @{} }
    try {
        return ($raw | ConvertFrom-Json)
    } catch {
        throw "Invalid JSON: $_"
    }
}

function Serve-StaticFile($request, $response, [string]$urlPath) {
    $cleanPath = $urlPath.Split('?')[0]
    if ([string]::IsNullOrWhiteSpace($cleanPath) -or $cleanPath -eq "/") {
        $cleanPath = "index.html"
    }
    $decoded = [System.Uri]::UnescapeDataString($cleanPath).TrimStart('/', '\')
    if ($decoded.Contains("`0")) {
        Send-ErrorResponse $response 400 "Bad Request: Null byte detected"
        return
    }

    $combined = [System.IO.Path]::Combine($publicDir, $decoded)
    $fullPath = [System.IO.Path]::GetFullPath($combined)
    $safePrefix = if ($publicDir.EndsWith([System.IO.Path]::DirectorySeparatorChar.ToString())) { $publicDir } else { $publicDir + [System.IO.Path]::DirectorySeparatorChar }

    if (-not ($fullPath.StartsWith($safePrefix, [System.StringComparison]::OrdinalIgnoreCase) -or $fullPath -eq $publicDir)) {
        Send-ErrorResponse $response 403 "Forbidden: Directory traversal denied"
        return
    }

    if (Test-Path $fullPath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
        $mime = $mimeTypes[$ext]
        if (-not $mime) { $mime = "application/octet-stream" }
        $response.ContentType = $mime
        $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("X-Content-Type-Options", "nosniff")

        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $response.ContentLength64 = $bytes.Length
        $response.StatusCode = 200
        if ($request.HttpMethod -ne "HEAD") {
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $response.Close()
    } else {
        Send-ErrorResponse $response 404 "Not Found: $urlPath"
    }
}

# --- Server Lifecycle & Execution ---
Ensure-Database

$url = "http://${HostAddress}:${Port}/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
if ($HostAddress -eq "localhost") {
    try { $listener.Prefixes.Add("http://127.0.0.1:${Port}/") } catch {}
}

try {
    $listener.Start()
} catch {
    Write-Error "Failed to bind HttpListener to ${url}: $_"
    exit 1
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  3AE BUSINESS REPORT APPLICATION - POWERSHELL SERVER" -ForegroundColor Green
Write-Host "  Listening at: $url" -ForegroundColor Green
Write-Host "  Base Directory: $baseDir" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            $method = $request.HttpMethod
            $path = $request.Url.LocalPath

            # CORS Preflight
            if ($method -eq "OPTIONS") {
                $response.StatusCode = 204
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
                $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With")
                $response.Close()
                continue
            }

            # --- API Routing ---
            if ($path.StartsWith("/api/")) {
                $apiSub = $path.Substring(5).TrimEnd('/')
                $segments = $apiSub.Split('/')

                # 1. GET /api/health
                if ($apiSub -eq "health" -and $method -eq "GET") {
                    $health = [PSCustomObject]@{
                        status = "ok"
                        timestamp = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                        version = "1.0.0"
                    }
                    Send-JsonResponse $response 200 $health
                    continue
                }

                # 2. GET /api/records
                if ($apiSub -eq "records" -and $method -eq "GET") {
                    $db = Read-Database
                    Send-JsonResponse $response 200 $db
                    continue
                }

                # 3. POST /api/records/reset
                if ($apiSub -eq "records/reset" -and $method -eq "POST") {
                    Reset-Database | Out-Null
                    Send-JsonResponse $response 200 ([PSCustomObject]@{ success = $true; message = "Reset to seed data" })
                    continue
                }

                # 4. GET /api/reports/overview
                if ($apiSub -eq "reports/overview" -and $method -eq "GET") {
                    $db = Read-Database
                    $ecom = Calculate-Ecom $db.ecom
                    $digital = Calculate-Digital $db.digital
                    $marcom = Calculate-MarCom $db.marcom
                    $cskh = Calculate-CSKH $db.cskh
                    $overview = Calculate-DivisionOverview $ecom $digital $marcom $cskh
                    $result = [PSCustomObject]@{
                        overview = $overview
                        departments = [PSCustomObject]@{
                            ecom = $ecom
                            digital = $digital
                            marcom = $marcom
                            cskh = $cskh
                        }
                    }
                    Send-JsonResponse $response 200 $result
                    continue
                }

                # 5. GET /api/reports/:department
                if ($segments.Length -eq 2 -and $segments[0] -eq "reports" -and $method -eq "GET") {
                    $dept = $segments[1].ToLower()
                    if ($validDepartments -notcontains $dept) {
                        Send-ErrorResponse $response 400 "Invalid department '$dept'. Allowed: $($validDepartments -join ', ')"
                        continue
                    }
                    $db = Read-Database
                    $records = $db[$dept]
                    $summary = switch ($dept) {
                        "ecom"    { Calculate-Ecom $records }
                        "digital" { Calculate-Digital $records }
                        "marcom"  { Calculate-MarCom $records }
                        "cskh"    { Calculate-CSKH $records }
                    }
                    $result = [PSCustomObject]@{
                        summary = $summary
                        records = $records
                    }
                    Send-JsonResponse $response 200 $result
                    continue
                }

                # 6. POST /api/records/:department
                if ($segments.Length -eq 2 -and $segments[0] -eq "records" -and $method -eq "POST") {
                    $dept = $segments[1].ToLower()
                    if ($validDepartments -notcontains $dept) {
                        Send-ErrorResponse $response 400 "Invalid department '$dept'. Allowed: $($validDepartments -join ', ')"
                        continue
                    }
                    try {
                        $body = Read-RequestBody $request
                    } catch {
                        Send-ErrorResponse $response 400 $_
                        continue
                    }
                    $db = Read-Database
                    $newRec = @{}
                    if ($body -is [PSCustomObject]) {
                        foreach ($prop in $body.PSObject.Properties) { $newRec[$prop.Name] = $prop.Value }
                    }
                    if (-not $newRec["id"]) {
                        $newRec["id"] = "$dept-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())-$((Get-Random -Minimum 1000 -Maximum 9999))"
                    }
                    $targetArr = [System.Collections.ArrayList]@($db[$dept])
                    $targetArr.Add([PSCustomObject]$newRec) | Out-Null
                    $db[$dept] = $targetArr
                    Write-DatabaseAtomic $db
                    Send-JsonResponse $response 201 ([PSCustomObject]@{ success = $true; record = [PSCustomObject]$newRec })
                    continue
                }

                # 7. PUT /api/records/:department/:id
                if ($segments.Length -eq 3 -and $segments[0] -eq "records" -and $method -eq "PUT") {
                    $dept = $segments[1].ToLower()
                    $recordId = $segments[2]
                    if ($validDepartments -notcontains $dept) {
                        Send-ErrorResponse $response 400 "Invalid department '$dept'. Allowed: $($validDepartments -join ', ')"
                        continue
                    }
                    try {
                        $body = Read-RequestBody $request
                    } catch {
                        Send-ErrorResponse $response 400 $_
                        continue
                    }
                    $db = Read-Database
                    $list = [System.Collections.ArrayList]@($db[$dept])
                    $foundIndex = -1
                    for ($i = 0; $i -lt $list.Count; $i++) {
                        if ([string]$list[$i].id -eq [string]$recordId) {
                            $foundIndex = $i
                            break
                        }
                    }
                    if ($foundIndex -eq -1) {
                        Send-ErrorResponse $response 404 "Record with id '$recordId' not found in department '$dept'"
                        continue
                    }
                    $existing = $list[$foundIndex]
                    $merged = @{}
                    foreach ($prop in $existing.PSObject.Properties) { $merged[$prop.Name] = $prop.Value }
                    if ($body -is [PSCustomObject]) {
                        foreach ($prop in $body.PSObject.Properties) { $merged[$prop.Name] = $prop.Value }
                    }
                    $merged["id"] = $recordId
                    $list[$foundIndex] = [PSCustomObject]$merged
                    $db[$dept] = $list
                    Write-DatabaseAtomic $db
                    Send-JsonResponse $response 200 ([PSCustomObject]@{ success = $true; record = [PSCustomObject]$merged })
                    continue
                }

                # 8. DELETE /api/records/:department/:id
                if ($segments.Length -eq 3 -and $segments[0] -eq "records" -and $method -eq "DELETE") {
                    $dept = $segments[1].ToLower()
                    $recordId = $segments[2]
                    if ($validDepartments -notcontains $dept) {
                        Send-ErrorResponse $response 400 "Invalid department '$dept'. Allowed: $($validDepartments -join ', ')"
                        continue
                    }
                    $db = Read-Database
                    $list = [System.Collections.ArrayList]@($db[$dept])
                    $foundIndex = -1
                    for ($i = 0; $i -lt $list.Count; $i++) {
                        if ([string]$list[$i].id -eq [string]$recordId) {
                            $foundIndex = $i
                            break
                        }
                    }
                    if ($foundIndex -eq -1) {
                        Send-ErrorResponse $response 404 "Record with id '$recordId' not found in department '$dept'"
                        continue
                    }
                    $list.RemoveAt($foundIndex)
                    $db[$dept] = $list
                    Write-DatabaseAtomic $db
                    Send-JsonResponse $response 200 ([PSCustomObject]@{ success = $true; id = $recordId })
                    continue
                }

                Send-ErrorResponse $response 404 "Not Found: $path"
                continue
            }

            # Static asset serving
            if ($method -eq "GET" -or $method -eq "HEAD") {
                Serve-StaticFile $request $response $path
                continue
            }

            Send-ErrorResponse $response 405 "Method Not Allowed"
        } catch [System.Net.HttpListenerException] {
            # Listener aborted
            break
        } catch {
            Write-Warning "Error processing request: $_"
        }
    }
} finally {
    if ($listener -ne $null -and $listener.IsListening) {
        $listener.Stop()
        $listener.Close()
        Write-Host "Server listener stopped." -ForegroundColor Yellow
    }
}
