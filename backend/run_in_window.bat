@echo off
echo Starting FastAPI Server from Root...

:: 1. Navigate to the app directory so python finds your imports correctly
cd app

:: 2. Run python from the sibling env folder
"..\backend_env_window\Scripts\python.exe" run_server.py

pause