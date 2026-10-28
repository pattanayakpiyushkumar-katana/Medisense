# Medisense - All-in-One Startup Script for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   MEDISENSE — AI-Powered Healthcare Web Application" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Backend API on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python run.py"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Web App on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm.cmd run dev"

Write-Host ""
Write-Host "Both servers have been launched in separate terminal windows!" -ForegroundColor Green
Write-Host "API Documentation : http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend App      : http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

