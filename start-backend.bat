@echo off
echo ========================================================
echo Starting Medisense Backend API Server (FastAPI + SQLite)
echo ========================================================
cd /d "%~dp0backend"
python run.py
pause
