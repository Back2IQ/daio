@echo off
title DAIO Suite - Back2IQ - All Applications
color 0A
cd /d "%~dp0"

echo ==========================================
echo   Back2IQ - Ahead by Design
echo   DAIO Application Suite - Master Starter
echo ==========================================
echo.
echo   [1] DAIO Value Explorer         - Port 3001
echo   [2] DAIO Interactive Blueprint   - Port 3002
echo   [3] DAIO Portfolio Continuity    - Port 3003
echo   [4] DAIO Strategic Platform      - Port 3004
echo   [5] DAIO Template Generator      - Port 3005
echo   [6] DAIO Pionierfall Pitch       - Port 3008
echo.
echo ==========================================
echo.

REM Check Node.js
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

REM --- App 1: DAIO Value Explorer (Port 3001) ---
echo [1/6] Starting DAIO Value Explorer (Port 3001)...
pushd "DAIO-Calculator"
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install >nul 2>&1
)
start "DAIO Value Explorer" cmd /c "npm run dev"
popd
echo       [OK] Started
echo.

REM --- App 2: DAIO Interactive Sales Blueprint (Port 3002) ---
echo [2/6] Starting DAIO Interactive Sales Blueprint (Port 3002)...
pushd "DAIO-Interactive Sales Blueprint\app"
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install >nul 2>&1
)
start "DAIO Interactive Blueprint" cmd /c "npm run dev"
popd
echo       [OK] Started
echo.

REM --- App 3: DAIO Portfolio Continuity Dashboard (Port 3003) ---
echo [3/6] Starting DAIO Portfolio Continuity Dashboard (Port 3003)...
pushd "DAIO Portfolio Continuity Dashboard"
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install >nul 2>&1
)
start "DAIO Portfolio Continuity" cmd /c "npm run dev"
popd
echo       [OK] Started
echo.

REM --- App 4: DAIO Strategic Platform (Port 3004) ---
echo [4/6] Starting DAIO Strategic Platform (Port 3004)...
pushd "DAIO-Strategic Plattform\app"
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install >nul 2>&1
)
start "DAIO Strategic Platform" cmd /c "npm run dev"
popd
echo       [OK] Started
echo.

REM --- App 5: DAIO Template Generator (Port 3005) ---
echo [5/6] Starting DAIO Template Generator (Port 3005)...
pushd "DAIO-Template-Generator\app"
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install >nul 2>&1
)
start "DAIO Template Generator" cmd /c "npm run dev"
popd
echo       [OK] Started
echo.

REM --- App 6: DAIO Pionierfall Pitch (Port 3008) ---
echo [6/6] Starting DAIO Pionierfall Pitch (Port 3008)...
pushd "DAIO-Pionierfall-Pitch\app"
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install >nul 2>&1
)
start "DAIO Pionierfall Pitch" cmd /c "npm run dev"
popd
echo       [OK] Started
echo.

echo ==========================================
echo   All 6 DAIO applications starting...
echo   Waiting for servers to be ready...
echo ==========================================
echo.

REM Wait for all servers to be ready
timeout /t 8 /nobreak >nul

REM Open all apps in browser tabs
echo [BROWSER] Opening all apps in browser...
echo.
start "" "http://localhost:3001"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3002"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3003"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3004"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3005"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3008"

echo ==========================================
echo   All DAIO apps are now running!
echo ==========================================
echo.
echo   DAIO Value Explorer         http://localhost:3001
echo   DAIO Interactive Blueprint   http://localhost:3002
echo   DAIO Portfolio Continuity    http://localhost:3003
echo   DAIO Strategic Platform      http://localhost:3004
echo   DAIO Template Generator      http://localhost:3005
echo   DAIO Pionierfall Pitch       http://localhost:3008
echo.
echo   Close this window to keep servers running.
echo   To stop all servers, close each server window
echo   individually or use Task Manager.
echo.
pause
