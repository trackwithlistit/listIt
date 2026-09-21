@echo off
echo ==============================================
echo       ListIt — Startup Launcher (2026)
echo ==============================================
echo.
echo [1/2] Starting Flask Backend Server in a new window...
start "ListIt Backend Server" cmd /k "cd backend && python run.py"

echo [2/2] Starting Vite Frontend Server in a new window...
start "ListIt Frontend Client" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================
echo  ListIt launched successfully!
echo  - Frontend: http://localhost:3000
echo  - Backend:  http://localhost:5000
echo ==============================================
echo.
pause
