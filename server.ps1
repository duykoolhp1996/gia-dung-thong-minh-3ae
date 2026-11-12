$port = 8080
$url = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
try {
    $listener.Start()
} catch {
    $port = 8888
    $url = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($url)
    $listener.Start()
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  3AE MARCOM HUB SERVER IS RUNNING AT: $url" -ForegroundColor Green
Write-Host "  CONNECTED DATABASE: GOOGLE SHEETS" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

$baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $path = $request.Url.LocalPath

            # Handle CORS Headers
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Close()
                continue
            }

            # API 1: /api/sync
            if ($path -eq "/api/sync") {
                Write-Host "[API] Triggering Google Sheets sync..." -ForegroundColor Cyan
                $syncScript = Join-Path $baseDir "sync_engine.ps1"
                if (Test-Path $syncScript) {
                    powershell -ExecutionPolicy Bypass -NoProfile -File $syncScript
                }
                $response.ContentType = "application/json; charset=utf-8"
                $dbPath = Join-Path $baseDir "database.json"
                $data = if (Test-Path $dbPath) { [System.IO.File]::ReadAllBytes($dbPath) } else { [System.Text.Encoding]::UTF8.GetBytes('{"status":"ok"}') }
                $response.ContentLength64 = $data.Length
                $response.OutputStream.Write($data, 0, $data.Length)
                $response.StatusCode = 200
                $response.Close()
                continue
            }

            # API 2: /api/data
            if ($path -eq "/api/data") {
                $dbPath = Join-Path $baseDir "database.json"
                if (Test-Path $dbPath) {
                    $response.ContentType = "application/json; charset=utf-8"
                    $data = [System.IO.File]::ReadAllBytes($dbPath)
                    $response.ContentLength64 = $data.Length
                    $response.OutputStream.Write($data, 0, $data.Length)
                    $response.StatusCode = 200
                } else {
                    $response.StatusCode = 404
                }
                $response.Close()
                continue
            }

            # API 3: /api/add-task (POST directly to Google Sheets)
            if ($path -eq "/api/add-task" -and $request.HttpMethod -eq "POST") {
                Write-Host "[API] Adding task directly to Google Sheets..." -ForegroundColor Yellow
                try {
                    $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                    $body = $reader.ReadToEnd()
                    $taskObj = $body | ConvertFrom-Json

                    $title = if ($taskObj.title) { [string]$taskObj.title } else { "Công việc mới" }
                    $dept = if ($taskObj.dept) { [string]$taskObj.dept } else { "Graphic Designer" }
                    $sku = if ($taskObj.sku) { [string]$taskObj.sku } else { "" }
                    $assignee = if ($taskObj.assignee) { [string]$taskObj.assignee } else { "3AE Team" }
                    $status = if ($taskObj.status) { [string]$taskObj.status } else { "1. Chờ Brief / Ý tưởng" }
                    $priority = if ($taskObj.priority) { [string]$taskObj.priority } else { "P3 - Trung bình" }
                    $category = if ($taskObj.category) { [string]$taskObj.category } else { "Branding & Thiết kế" }
                    $channel = if ($taskObj.channel) { [string]$taskObj.channel } else { "Facebook Fanpage" }
                    $format = if ($taskObj.format) { [string]$taskObj.format } else { "Banner / Ảnh" }
                    $deadline = if ($taskObj.deadline) { [string]$taskObj.deadline } else { (Get-Date).AddDays(3).ToString("dd/MM/yyyy") }
                    $startDate = (Get-Date).ToString("dd/MM/yyyy")
                    $progress = "0%"
                    $linkBrief = if ($taskObj.linkBrief) { [string]$taskObj.linkBrief } else { "" }

                    $cellVals = @(
                        @{ userEnteredValue = @{ stringValue = $title } },
                        @{ userEnteredValue = @{ stringValue = $dept } },
                        @{ userEnteredValue = @{ stringValue = $sku } },
                        @{ userEnteredValue = @{ stringValue = $assignee } },
                        @{ userEnteredValue = @{ stringValue = $status } },
                        @{ userEnteredValue = @{ stringValue = $priority } },
                        @{ userEnteredValue = @{ stringValue = $category } },
                        @{ userEnteredValue = @{ stringValue = $channel } },
                        @{ userEnteredValue = @{ stringValue = $format } },
                        @{ userEnteredValue = @{ stringValue = $deadline } },
                        @{ userEnteredValue = @{ stringValue = $startDate } },
                        @{ userEnteredValue = @{ stringValue = $progress } },
                        @{ userEnteredValue = @{ stringValue = $linkBrief } }
                    )

                    $batchReq = @{
                        requests = @(
                            @{
                                appendCells = @{
                                    sheetId = 429202796
                                    rows = @(
                                        @{ values = $cellVals }
                                    )
                                    fields = "userEnteredValue"
                                }
                            }
                        )
                    }

                    $batchJson = $batchReq | ConvertTo-Json -Depth 10
                    $tmpBatchFile = Join-Path $baseDir "tmp_append_task.json"
                    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
                    [System.IO.File]::WriteAllText($tmpBatchFile, $batchJson, $utf8NoBom)

                    # Mutate directly to Google Sheets Master Workbook
                    gsheets mutate raw-batch 1dI_z3TzLBmMgPmRICya6aVyqyw18qdgPitmsw2in5ac -f $tmpBatchFile
                    Remove-Item $tmpBatchFile -ErrorAction SilentlyContinue

                    # Trigger fresh sync
                    $syncScript = Join-Path $baseDir "sync_engine.ps1"
                    if (Test-Path $syncScript) {
                        powershell -ExecutionPolicy Bypass -NoProfile -File $syncScript
                    }

                    $response.ContentType = "application/json; charset=utf-8"
                    $dbPath = Join-Path $baseDir "database.json"
                    $data = if (Test-Path $dbPath) { [System.IO.File]::ReadAllBytes($dbPath) } else { [System.Text.Encoding]::UTF8.GetBytes('{"status":"ok"}') }
                    $response.ContentLength64 = $data.Length
                    $response.OutputStream.Write($data, 0, $data.Length)
                    $response.StatusCode = 200
                } catch {
                    $response.StatusCode = 500
                    $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Error: $_")
                    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                }
                $response.Close()
                continue
            }

            # API 4: /api/add-personnel (POST directly to Google Sheets sheet 1081356969)
            if ($path -eq "/api/add-personnel" -and $request.HttpMethod -eq "POST") {
                Write-Host "[API] Adding personnel directly to Google Sheets..." -ForegroundColor Yellow
                try {
                    $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                    $body = $reader.ReadToEnd()
                    $pObj = $body | ConvertFrom-Json

                    $code = if ($pObj.code) { [string]$pObj.code } else { "NV-3AE-" + (Get-Random -Minimum 100 -Maximum 999) }
                    $name = if ($pObj.name) { [string]$pObj.name } else { "Nhân sự mới" }
                    $dept = if ($pObj.dept) { [string]$pObj.dept } else { "Marketing" }
                    $role = if ($pObj.role) { [string]$pObj.role } else { "Chuyên viên" }
                    $email = if ($pObj.email) { [string]$pObj.email } else { "" }
                    $phone = if ($pObj.phone) { [string]$pObj.phone } else { "" }
                    $tools = if ($pObj.tools) { [string]$pObj.tools } else { "Tài khoản làm việc" }
                    $status = if ($pObj.status) { [string]$pObj.status } else { "Đang làm việc" }
                    $startDate = if ($pObj.startDate) { [string]$pObj.startDate } else { (Get-Date).ToString("dd/MM/yyyy") }

                    $cellVals = @(
                        @{ userEnteredValue = @{ stringValue = $code } },
                        @{ userEnteredValue = @{ stringValue = $name } },
                        @{ userEnteredValue = @{ stringValue = $dept } },
                        @{ userEnteredValue = @{ stringValue = $role } },
                        @{ userEnteredValue = @{ stringValue = $email } },
                        @{ userEnteredValue = @{ stringValue = $phone } },
                        @{ userEnteredValue = @{ stringValue = $tools } },
                        @{ userEnteredValue = @{ stringValue = $status } },
                        @{ userEnteredValue = @{ stringValue = $startDate } }
                    )

                    $batchReq = @{
                        requests = @(
                            @{
                                appendCells = @{
                                    sheetId = 1081356969
                                    rows = @(
                                        @{ values = $cellVals }
                                    )
                                    fields = "userEnteredValue"
                                }
                            }
                        )
                    }

                    $batchJson = $batchReq | ConvertTo-Json -Depth 10
                    $tmpBatchFile = Join-Path $baseDir "tmp_append_personnel.json"
                    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
                    [System.IO.File]::WriteAllText($tmpBatchFile, $batchJson, $utf8NoBom)

                    # Mutate directly to Google Sheets Master Workbook
                    gsheets mutate raw-batch 1dI_z3TzLBmMgPmRICya6aVyqyw18qdgPitmsw2in5ac -f $tmpBatchFile
                    Remove-Item $tmpBatchFile -ErrorAction SilentlyContinue

                    # Trigger fresh sync
                    $syncScript = Join-Path $baseDir "sync_engine.ps1"
                    if (Test-Path $syncScript) {
                        powershell -ExecutionPolicy Bypass -NoProfile -File $syncScript
                    }

                    $response.ContentType = "application/json; charset=utf-8"
                    $dbPath = Join-Path $baseDir "database.json"
                    $data = if (Test-Path $dbPath) { [System.IO.File]::ReadAllBytes($dbPath) } else { [System.Text.Encoding]::UTF8.GetBytes('{"status":"ok"}') }
                    $response.ContentLength64 = $data.Length
                    $response.OutputStream.Write($data, 0, $data.Length)
                    $response.StatusCode = 200
                } catch {
                    $response.StatusCode = 500
                    $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Error: $_")
                    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                }
                $response.Close()
                continue
            }

            # Static File Serving
            $localPath = $path.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($localPath) -or $localPath -eq "/") {
                $localPath = "index.html"
            }
            $localPath = [System.Uri]::UnescapeDataString($localPath)
            $filePath = Join-Path $baseDir $localPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = $mimeTypes[$ext]
                if (-not $mime) { $mime = "application/octet-stream" }
                $response.ContentType = $mime
                $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")

                $buffer = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.StatusCode = 200
            } else {
                $response.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            $response.Close()
        } catch {
            Write-Warning "Error processing request: $_"
        }
    }
} finally {
    $listener.Stop()
}
