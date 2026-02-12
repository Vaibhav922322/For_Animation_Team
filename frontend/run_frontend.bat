@echo off
echo ===============================
echo   Frontend Server Starting...
echo ===============================
echo.

REM Try to find Python in order of preference:
REM 1. Bundled Python from backend runtime
REM 2. System Python

set BUNDLED_PYTHON=%~dp0..\backend\runtime\python_for_windows\python.exe

if exist "%BUNDLED_PYTHON%" (
    set PYTHON_CMD="%BUNDLED_PYTHON%"
    echo [INFO] Using bundled Python from backend runtime
    goto :findport
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python
    goto :findport
)
where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python3
    goto :findport
)
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=py
    goto :findport
)

echo [ERROR] Python is not installed and bundled Python not found.
pause
exit /b 1

:findport
REM Read the backend port from server_connection.json
set CONFIG_FILE=%~dp0..\server_connection.json

if not exist "%CONFIG_FILE%" (
    REM Also check inside backend folder
    set CONFIG_FILE=%~dp0..\backend\server_connection.json
)

if not exist "%CONFIG_FILE%" (
    echo [WARNING] server_connection.json not found!
    echo [WARNING] Make sure the backend is running first!
    echo [INFO] Using default port 8000
    set BACKEND_PORT=8000
    set BACKEND_IP=127.0.0.1
) else (
    echo [INFO] Reading backend connection from %CONFIG_FILE%
    for /f "tokens=2 delims=:, " %%a in ('findstr "PORT" "%CONFIG_FILE%"') do set BACKEND_PORT=%%a
    for /f "tokens=2 delims=:, " %%a in ('findstr "SERVER_IP" "%CONFIG_FILE%"') do (
        set BACKEND_IP=%%~a
    )
    if not defined BACKEND_IP set BACKEND_IP=127.0.0.1
)

echo [INFO] Backend is at http://%BACKEND_IP%:%BACKEND_PORT%

REM Generate config.js with the backend URL
echo window.__CONFIG__ = { API_URL: "http://%BACKEND_IP%:%BACKEND_PORT%" }; > "%~dp0dist\config.js"
echo [INFO] Generated config.js with API_URL = http://%BACKEND_IP%:%BACKEND_PORT%

echo [INFO] Serving frontend on http://localhost:5173
echo.
echo Press Ctrl+C to stop the server.
echo.

cd /d "%~dp0dist"
%PYTHON_CMD% -m http.server 5173
pause
