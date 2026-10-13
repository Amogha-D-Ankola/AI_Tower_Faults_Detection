@echo off
echo ========================================================
echo Starting Nova Grid Vite Frontend Server...
echo Web UI: http://localhost:5173
echo ========================================================
set "PATH=C:\Users\Admin\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;%PATH%"
cd /d "%~dp0frontend"
call npm run dev
