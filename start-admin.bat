@echo off
echo Starting Pi Admin Dashboard...
echo.

echo Starting Admin Dashboard on http://localhost:3002
echo API Connection: http://localhost:3000
echo.

set PORT=3002
npm run dev

echo.
echo Admin Dashboard: http://localhost:3002
echo Press Ctrl+C to stop
pause
