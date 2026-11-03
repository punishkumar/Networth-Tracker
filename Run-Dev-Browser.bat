@echo off
echo ========================================================
echo   Starting Networth Tracker in Live Web Dev Mode
echo   URL: http://localhost:5173 (Opening automatically...)
echo ========================================================
timeout /t 2 /nobreak >nul
start http://localhost:5173
npm run dev
