$host.UI.RawUI.WindowTitle = "Love Mail Server"

Write-Host "====================================================="
Write-Host "  [1/3] Starting Python server on port 8000..."
Write-Host "====================================================="

# Kill leftover processes
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    try { $_.MainWindowTitle -eq "" } catch { $false }
} | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start Python server
$py = Start-Process "python" -ArgumentList "server.py" -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2

# Check if python started ok
if ($py.HasExited) {
    Write-Host "[ERROR] Python server failed to start! Is Python installed?"
    Write-Host "Exit code: $($py.ExitCode)"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  [OK] Python server running (PID: $($py.Id))"

Write-Host ""
Write-Host "  [2/3] Starting Cloudflare tunnel..."

# Start cloudflared with log file
$logFile = Join-Path $PSScriptRoot "tunnel.log"
Remove-Item $logFile -Force -ErrorAction SilentlyContinue
$cf = Start-Process -FilePath (Join-Path $PSScriptRoot "cloudflared.exe") -ArgumentList "tunnel --url http://localhost:8000 --logfile `"$logFile`"" -WindowStyle Hidden -PassThru

Write-Host ""
Write-Host "  [3/3] Waiting for tunnel URL (up to 30s)..."

$url = $null
for ($i = 1; $i -le 60; $i++) {
    Start-Sleep -Milliseconds 500
    
    # Check cloudflared hasn't crashed
    if ($cf.HasExited) {
        Write-Host "[ERROR] cloudflared.exe stopped unexpectedly!"
        if (Test-Path $logFile) {
            Write-Host "--- Last log lines ---"
            Get-Content $logFile -Tail 10
        }
        break
    }

    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
        if ($content -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
            $url = $matches[0]
            break
        }
    }
    
    # Show progress every 5 seconds
    if ($i % 10 -eq 0) {
        Write-Host "  Still waiting... ($([int]($i*0.5))s elapsed)"
    }
}

if ($url) {
    Set-Clipboard -Value $url
    $host.UI.RawUI.WindowTitle = "Love Mail - READY"
    Clear-Host
    Write-Host ""
    Write-Host "  ========================================================"
    Write-Host "              LOVE MAIL IS READY!"
    Write-Host "  ========================================================"
    Write-Host ""
    Write-Host "  Share this link:"
    Write-Host "  >>  $url  <<"
    Write-Host ""
    Write-Host "  [!] Link has been COPIED to your clipboard. Paste & send!"
    Write-Host ""
    Write-Host "  Keep this window open while your partner is browsing."
    Write-Host "  Their response will be saved to: answers.txt"
    Write-Host ""
    Write-Host "  Press ENTER to STOP and close the server..."
    Write-Host "  ========================================================"
    Read-Host
} else {
    Write-Host ""
    Write-Host "[ERROR] Could not find tunnel URL after 30 seconds."
    if (Test-Path $logFile) {
        Write-Host "--- cloudflared log ---"
        Get-Content $logFile -Tail 20
    }
    Read-Host "Press Enter to exit"
}

# Cleanup
if ($py -and !$py.HasExited) { Stop-Process -Id $py.Id -Force -ErrorAction SilentlyContinue }
if ($cf -and !$cf.HasExited) { Stop-Process -Id $cf.Id -Force -ErrorAction SilentlyContinue }
Remove-Item $logFile -Force -ErrorAction SilentlyContinue
