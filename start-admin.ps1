# Start Pi Admin Dashboard
Write-Host "Starting Pi Admin Dashboard..." -ForegroundColor Green
Write-Host ""

# Check if pi-onboarding is running
$onboardingRunning = netstat -an | Select-String ":3000"
if (-not $onboardingRunning) {
    Write-Host "Warning: Pi Onboarding app (localhost:3000) is not running!" -ForegroundColor Yellow
    Write-Host "The admin dashboard needs the onboarding app for API data." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting Admin Dashboard on http://localhost:3002" -ForegroundColor Blue
Write-Host "API Connection: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Set port and start
$env:PORT=3002
npm run dev

Write-Host ""
Write-Host "Admin Dashboard: http://localhost:3002" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
