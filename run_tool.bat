@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ===== CONFIG =====
set "PYTHON_DIR=backend\runtime\python_for_windows"
set "VENV_DIR=backend\runtime\backend_env_window"
set "REQ_FILE=backend\requirements.txt"
set "APP_FILE=backend\app\run_server.py"
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

REM 2. Create venv if missing
if exist "%VENV_PY%" (
    echo [INFO] Virtual environment already exists. Skipping creation.
) else (
    echo [INFO] Creating virtual environment: %VENV_DIR%
    "%BASE_PY%" -m venv "%VENV_DIR%"
    if errorlevel 1 goto :VENV_FAIL

    REM 2.5 Install dependencies
    if exist "%REQ_FILE%" (
        echo [INFO] Installing dependencies from %REQ_FILE%
        "%VENV_PY%" -m pip install --upgrade pip
        if errorlevel 1 goto :VENV_FAIL

        "%VENV_PY%" -m pip install -r "%REQ_FILE%"
        if errorlevel 1 goto :VENV_FAIL
    ) else (
        echo [WARN] requirements.txt not found. Skipping dependency install.
    )
)



REM 3. Run launch.py
echo [INFO] Running launch.py...
"%VENV_PY%" "start_services.py"

echo.
echo Services exited with code %errorlevel%
pause
exit /b %errorlevel%



REM ===== ERROR HANDLER =====
:VENV_FAIL
echo.
echo [ERROR] Venv setup failed. Cleaning up %VENV_DIR% ...
if exist "%VENV_DIR%" (
    rmdir /s /q "%VENV_DIR%"
)
echo [INFO] Venv folder deleted.
pause
exit /b 1