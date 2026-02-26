@echo off
echo Starting WheelStock...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
start "WheelStock Backend" cmd /k "cd /d c:\vvsu_project\backend && python -m uvicorn main:app --reload"
timeout /t 2 /nobreak >nul
start "WheelStock Frontend" cmd /k "cd /d c:\vvsu_project\frontend && npm run dev"
