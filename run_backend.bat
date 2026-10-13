@echo off
echo ========================================================
echo Starting Nova Grid FastAPI Backend Server...
echo API Docs: http://localhost:8000/docs
echo Health Check: http://localhost:8000/api/health
echo ========================================================
cd /d "%~dp0backend"
venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
