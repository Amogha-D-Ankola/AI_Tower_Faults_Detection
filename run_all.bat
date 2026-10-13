@echo off
echo ========================================================
echo Starting Nova Grid Full-Stack Application...
echo ========================================================
start "Nova Grid Backend" cmd /k "%~dp0run_backend.bat"
start "Nova Grid Frontend" cmd /k "%~dp0run_frontend.bat"
echo.
echo Both servers are launching in separate windows!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================================
