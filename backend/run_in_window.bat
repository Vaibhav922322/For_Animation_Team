@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ===== CONFIG =====
set "PYTHON_DIR=python"
set "VENV_DIR=backend_env_window"
set "REQ_FILE=requirements.txt"
set "APP_FILE=app\run_server.py"
REM ==================

echo ===============================
echo Backend bootstrap starting...
echo ===============================

REM 1. Check bundled Python
if not exist "%PYTHON_DIR%\python.exe" (
    echo [ERROR] Bundled Python not found at %PYTHON_DIR%\python.exe
    pause
    exit /b 1
)

set "BASE_PY=%PYTHON_DIR%\python.exe"
set "VENV_PY=%VENV_DIR%\Scripts\python.exe"
REM 2. Check venv
if exist "%VENV_DIR%\Scripts\python.exe" (
    echo [INFO] Virtual environment already exists. Skipping creation.
) else (
    echo [INFO] Creating virtual environment: %VENV_DIR%
    "%BASE_PY%" -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    REM 2.5. Install dependencies
    if exist "%REQ_FILE%" (
        echo [INFO] Installing dependencies from %REQ_FILE%
        "%VENV_PY%" -m pip install --upgrade pip
        "%VENV_PY%" -m pip install -r "%REQ_FILE%"
        if errorlevel 1 (
            echo [ERROR] Dependency installation failed.
            pause
            exit /b 1
        )
    ) else (
        echo [WARN] requirements.txt not found. Skipping dependency install.
    )
)




REM 3. Run backend
if not exist "%APP_FILE%" (
    echo [ERROR] App file not found: %APP_FILE%
    pause
    exit /b 1
)

echo [INFO] Starting backend...
"%VENV_PY%" "%APP_FILE%"

echo.
echo Backend exited with code %errorlevel%
pause
exit /b %errorlevel%