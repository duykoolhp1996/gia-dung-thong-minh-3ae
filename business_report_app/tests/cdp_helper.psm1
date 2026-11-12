# tests/cdp_helper.psm1
# Chrome DevTools Protocol (CDP) Automation Module for PowerShell 5.1+
# Native Windows automation via System.Net.WebSockets.ClientWebSocket (zero external dependencies).

function Get-BrowserExecutablePath {
    [CmdletBinding()]
    param()

    $paths = @(
        "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    )

    foreach ($p in $paths) {
        if (Test-Path $p) { return $p }
    }

    $cmd = Get-Command msedge, chrome -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cmd) { return $cmd.Source }

    throw "No Chromium browser (Edge or Chrome) found on this Windows system."
}

function Get-FreeTcpPort {
    [CmdletBinding()]
    param(
        [int]$StartPort = 9222,
        [int]$EndPort = 9299
    )

    for ($port = $StartPort; $port -le $EndPort; $port++) {
        try {
            $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
            $listener.Start()
            $listener.Stop()
            return $port
        } catch {
            continue
        }
    }
    return 9222
}

function Start-HeadlessBrowser {
    [CmdletBinding()]
    param(
        [string]$Url = "http://localhost:3000/",
        [int]$Port = 0,
        [switch]$Headless = $true,
        [int]$TimeoutSeconds = 15
    )

    $exePath = Get-BrowserExecutablePath
    if ($Port -le 0) {
        $Port = Get-FreeTcpPort
    }

    $tempProfile = Join-Path $env:TEMP "3ae_cdp_profile_$([System.Diagnostics.Process]::GetCurrentProcess().Id)_$(Get-Random)"
    New-Item -ItemType Directory -Path $tempProfile -Force | Out-Null

    $argList = @(
        "--remote-debugging-port=$Port",
        "--user-data-dir=`"$tempProfile`"",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-background-networking",
        "--disable-sync",
        "--disable-extensions",
        "--window-size=1440,900"
    )

    if ($Headless) {
        $argList += "--headless=new"
    }

    $argList += $Url

    $proc = Start-Process -FilePath $exePath -ArgumentList $argList -PassThru

    # Poll for CDP JSON target discovery
    $startTime = Get-Date
    $tab = $null
    while (((Get-Date) - $startTime).TotalSeconds -lt $TimeoutSeconds) {
        Start-Sleep -Milliseconds 300
        try {
            $tabs = Invoke-RestMethod -Uri "http://localhost:$Port/json" -TimeoutSec 2 -ErrorAction Stop
            $tab = $tabs | Where-Object { $_.url -like "*$Url*" -or $_.type -eq "page" } | Select-Object -First 1
            if ($tab -and $tab.webSocketDebuggerUrl) { break }
        } catch {}
    }

    if (-not $tab -or -not $tab.webSocketDebuggerUrl) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Remove-Item $tempProfile -Recurse -Force -ErrorAction SilentlyContinue
        throw "Failed to connect to CDP endpoint on port $Port within $TimeoutSeconds seconds."
    }

    # Connect native ClientWebSocket
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(15000)
    try {
        $ws.ConnectAsync([Uri]$tab.webSocketDebuggerUrl, $cts.Token).Wait()
    } catch {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Remove-Item $tempProfile -Recurse -Force -ErrorAction SilentlyContinue
        throw "Failed to establish WebSocket connection to $($tab.webSocketDebuggerUrl): $_"
    }

    $session = [PSCustomObject]@{
        Process     = $proc
        Port        = $Port
        UserDataDir = $tempProfile
        WebSocket   = $ws
        Tab         = $tab
        MessageId   = 0
        IsClosed    = $false
    }

    return $session
}

function Invoke-BrowserCdpMethod {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Session,
        [Parameter(Mandatory=$true)]
        [string]$Method,
        [hashtable]$Params = @{},
        [int]$TimeoutSeconds = 15
    )

    if ($Session.IsClosed -or $Session.WebSocket.State -ne [System.Net.WebSockets.WebSocketState]::Open) {
        throw "Browser WebSocket session is not open (State: $($Session.WebSocket.State))."
    }

    $Session.MessageId++
    $cmdObj = @{
        id     = $Session.MessageId
        method = $Method
        params = $Params
    }
    $cmdJson = $cmdObj | ConvertTo-Json -Compress -Depth 10
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($cmdJson)
    $seg = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)

    $cts = New-Object System.Threading.CancellationTokenSource($TimeoutSeconds * 1000)
    $Session.WebSocket.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

    # Receive response with multi-fragment support via MemoryStream
    $ms = New-Object System.IO.MemoryStream
    $buffer = New-Object byte[] 65536
    while ($true) {
        $rseg = New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)
        $recvTask = $Session.WebSocket.ReceiveAsync($rseg, $cts.Token)
        $recvTask.Wait()
        $recvResult = $recvTask.Result
        $ms.Write($buffer, 0, $recvResult.Count)
        if ($recvResult.EndOfMessage) { break }
    }

    $respJson = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
    $respObj = $respJson | ConvertFrom-Json

    if ($respObj.exceptionDetails) {
        $errText = $respObj.exceptionDetails.exception.description
        if (-not $errText) { $errText = $respObj.exceptionDetails.text }
        throw "JavaScript evaluation exception: $errText"
    }

    return $respObj
}

function Invoke-BrowserEvaluate {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Session,
        [Parameter(Mandatory=$true)]
        [string]$Expression,
        [switch]$AwaitPromise = $true,
        [int]$TimeoutSeconds = 15
    )

    $params = @{
        expression    = $Expression
        returnByValue = $true
        awaitPromise  = [bool]$AwaitPromise
    }

    $res = Invoke-BrowserCdpMethod -Session $Session -Method "Runtime.evaluate" -Params $params -TimeoutSeconds $TimeoutSeconds
    if ($res.result -and $res.result.result) {
        return $res.result.result.value
    }
    return $null
}

function Wait-BrowserCondition {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Session,
        [Parameter(Mandatory=$true)]
        [string]$ConditionJs,
        [int]$TimeoutSeconds = 10,
        [int]$IntervalMs = 200
    )

    $start = Get-Date
    while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSeconds) {
        try {
            $val = Invoke-BrowserEvaluate -Session $Session -Expression $ConditionJs -TimeoutSeconds 2
            if ($val -eq $true -or ($val -and $val -ne 0)) {
                return $true
            }
        } catch {}
        Start-Sleep -Milliseconds $IntervalMs
    }
    return $false
}

function Capture-BrowserScreenshot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Session,
        [Parameter(Mandatory=$true)]
        [string]$Path
    )

    $res = Invoke-BrowserCdpMethod -Session $Session -Method "Page.captureScreenshot" -Params @{ format = "png" }
    if ($res.result -and $res.result.data) {
        $bytes = [System.Convert]::FromBase64String($res.result.data)
        $dir = Split-Path -Parent $Path
        if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        [System.IO.File]::WriteAllBytes($Path, $bytes)
        return $Path
    }
    throw "Failed to capture screenshot from browser session."
}

function Invoke-BrowserClick {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Session,
        [Parameter(Mandatory=$true)]
        [string]$Selector
    )

    $js = @"
        (function() {
            const el = document.querySelector('$Selector');
            if (!el) throw new Error('Element not found for selector: $Selector');
            el.click();
            return true;
        })()
"@
    return Invoke-BrowserEvaluate -Session $Session -Expression $js
}

function Invoke-BrowserFillInput {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Session,
        [Parameter(Mandatory=$true)]
        [string]$Selector,
        [Parameter(Mandatory=$true)]
        [string]$Value
    )

    $escaped = $Value.Replace('\', '\\').Replace("'", "\'")
    $js = @"
        (function() {
            const el = document.querySelector('$Selector');
            if (!el) throw new Error('Input element not found: $Selector');
            el.value = '$escaped';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        })()
"@
    return Invoke-BrowserEvaluate -Session $Session -Expression $js
}

function Stop-HeadlessBrowser {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Session
    )

    if ($Session.IsClosed) { return }
    $Session.IsClosed = $true

    try {
        if ($Session.WebSocket -and $Session.WebSocket.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
            $cts = New-Object System.Threading.CancellationTokenSource(2000)
            $Session.WebSocket.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Closing", $cts.Token).Wait()
        }
    } catch {}

    try {
        if ($Session.Process -and -not $Session.Process.HasExited) {
            Stop-Process -Id $Session.Process.Id -Force -ErrorAction SilentlyContinue
        }
    } catch {}

    # Retry cleanup of UserDataDir to accommodate lingering file locks
    if ($Session.UserDataDir -and (Test-Path $Session.UserDataDir)) {
        for ($i = 0; $i -lt 5; $i++) {
            Start-Sleep -Milliseconds 200
            try {
                Remove-Item $Session.UserDataDir -Recurse -Force -ErrorAction Stop
                break
            } catch {
                if ($i -eq 4) {
                    Write-Warning "Could not completely remove temp profile: $($Session.UserDataDir)"
                }
            }
        }
    }
}

Export-ModuleMember -Function Get-BrowserExecutablePath, Get-FreeTcpPort, Start-HeadlessBrowser, `
    Invoke-BrowserCdpMethod, Invoke-BrowserEvaluate, Wait-BrowserCondition, `
    Capture-BrowserScreenshot, Invoke-BrowserClick, Invoke-BrowserFillInput, Stop-HeadlessBrowser
