@echo off
title Push Nova Grid to GitHub
echo ========================================================
echo   Pushing Nova Grid to GitHub
echo   Repo: https://github.com/nl600946-stack/AI_Tower_Faults_Detection.git
echo ========================================================
echo.
set "PATH=C:\Program Files\Git\cmd;%PATH%"

echo Running git push...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   SUCCESS: Nova Grid pushed to GitHub successfully!
    echo ========================================================
) else (
    echo ========================================================
    echo   If you were asked to sign in, please complete the
    echo   browser window or provide your GitHub Personal Access Token.
    echo ========================================================
)
echo.
pause
