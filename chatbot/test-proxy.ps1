param(
    [string]$ServerUrl = 'http://127.0.0.1:8000'
)

Write-Host "Running chatbot proxy test against: $ServerUrl" -ForegroundColor Cyan

function Fail([string]$msg) {
    Write-Host "FAIL: $msg" -ForegroundColor Red
    exit 1
}

$uri = "$ServerUrl/chatbot/chat_proxy.php"
$body = @{ message = 'Please describe your services' }

try {
    $jsonBody = $body | ConvertTo-Json -Depth 5
    $res = Invoke-RestMethod -Uri $uri -Method Post -Body $jsonBody -ContentType 'application/json' -TimeoutSec 15 -ErrorAction Stop
}
catch {
    Write-Host "Could not reach $uri" -ForegroundColor Yellow
    Write-Host "Error: $_"
    Write-Host "If the server is not running, start it with the project's start-chat.ps1 or run: php -S 127.0.0.1:8000 -t 'c:\Users\Charl\Documents\GitHub\Fugo-Innovations'" -ForegroundColor Cyan
    exit 2
}

if (-not $res) { Fail "Empty response from proxy." }

if (-not ($res.ok -eq $true)) { Fail "Proxy returned ok!=true. Full response: $(ConvertTo-Json $res -Depth 5)" }

if (-not $res.reply -or $res.reply -eq '') { Fail "Reply is empty." }

if (-not $res.links) { Fail "Links field is missing or empty." }

$linksCount = 0
try { $linksCount = ($res.links | Measure-Object).Count } catch { $linksCount = 0 }
if ($linksCount -lt 1) { Fail "Expected at least one link; got $linksCount" }

Write-Host "PASS: Proxy replied and returned $linksCount link(s)." -ForegroundColor Green
Write-Host "Reply preview:" -ForegroundColor Cyan
Write-Host ($res.reply -split "\n")[0..4] -join " `n"
exit 0
