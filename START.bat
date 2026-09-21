@echo off
title PKC University Portal - Starting...
color 0A

echo ============================================
echo    PKC UNIVERSITY PORTAL - STARTING
echo ============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is NOT installed on this computer!
    echo.
    echo Please install Node.js first:
    echo   1. Go to: https://nodejs.org
    echo   2. Download and install the LTS version
    echo   3. Restart your computer
    echo   4. Then run this file again
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found!
echo.

:: Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo [SETUP] Installing backend packages (first time only)...
    cd backend
    call npm install
    cd ..
    echo [OK] Backend packages installed!
    echo.
)

:: Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo [SETUP] Installing frontend packages (first time only)...
    cd frontend
    call npm install
    cd ..
    echo [OK] Frontend packages installed!
    echo.
)

:: Build frontend if dist not present
if not exist "frontend\dist" (
    echo [BUILD] Building frontend (first time only, takes ~30 seconds)...
    cd frontend
    call npm run build
    cd ..
    echo [OK] Frontend built successfully!
    echo.
)

:: Create data directory if needed
if not exist "backend\data" (
    mkdir "backend\data"
)

echo ============================================
echo  Starting PKC University Portal Server...
echo ============================================
echo.
echo  Website will open automatically in your browser.
echo  Portal URL: http://localhost:5000
echo.
echo  [IMPORTANT] Do NOT close this window while using the portal!
echo  To stop: Press Ctrl+C or close this window.
echo.

:: Start backend server (it also serves the frontend)
cd backend
start /B node server.js

:: Wait 2 seconds for server to start
timeout /t 2 /nobreak >nul

:: Open browser
start "" "http://localhost:5000"

echo  Server is running! Portal opened in browser.
echo  All data is saved permanently in: backend\data\database.json
echo.
echo  Press Ctrl+C to stop the server.
echo ============================================

:: Keep window open and server running
node server.js
