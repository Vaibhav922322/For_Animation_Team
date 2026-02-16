@echo off
echo ===================================================
echo   Building AnimationShare Single EXE
echo ===================================================

echo.
echo [1/3] Cleaning up previous builds...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist *.spec del *.spec

echo.
echo [2/3] Installing/Verifying Dependencies...
pip install -r requirements.txt
pip install pyinstaller

echo.
echo [3/3] Running PyInstaller...
python -m PyInstaller --noconfirm --onefile --console --name "AnimationShare" --add-data "app\static;app\static" --hidden-import=uvicorn.logging --hidden-import=uvicorn.loops --hidden-import=uvicorn.loops.auto --hidden-import=uvicorn.protocols --hidden-import=uvicorn.protocols.http --hidden-import=uvicorn.protocols.http.auto --hidden-import=uvicorn.lifespan --hidden-import=uvicorn.lifespan.on app\run_server.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] PyInstaller failed! Error code: %errorlevel%
    echo Please check the error messages above.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   BUILD COMPLETE!
echo   Your .exe is located in: backend\dist\AnimationShare.exe
echo ===================================================
pause
