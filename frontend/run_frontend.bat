@echo off
echo ===============================
echo   Frontend Server Starting...
echo ===============================
echo.

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python
    goto :start
)
where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python3
    goto :start
)

echo [ERROR] Python is not installed or not in PATH.
echo Please install Python from https://www.python.org/downloads/
echo Or make sure the backend is set up first (it includes Python).
pause
exit /b 1

:start
echo [INFO] Serving frontend on http://localhost:5173
echo [INFO] Make sure the backend is running on port 8000
echo.
echo Press Ctrl+C to stop the server.
echo.

cd /d "%~dp0dist"
%PYTHON_CMD% -m http.server 5173
pause
