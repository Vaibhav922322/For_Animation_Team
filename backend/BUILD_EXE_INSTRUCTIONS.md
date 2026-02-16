# How to Build the Single EXE File

Follow these steps on your **Windows** machine to package the app into a single executable.

## 1. Prerequisites
Ensure you have Python installed and the backend dependencies.
```cmd
cd backend
pip install -r requirements.txt
```

## 2. Install PyInstaller
```cmd
pip install pyinstaller
```

## 3. Build the EXE
Run the following command from the `backend` directory. 
**Note:** This command bundles the `app/static` folder (frontend) into the EXE.

```cmd
pyinstaller --noconfirm --onefile --console --name "AnimationShare" --add-data "app/static;app/static" --hidden-import=uvicorn.logging --hidden-import=uvicorn.loops --hidden-import=uvicorn.loops.auto --hidden-import=uvicorn.protocols --hidden-import=uvicorn.protocols.http --hidden-import=uvicorn.protocols.http.auto --hidden-import=uvicorn.lifespan --hidden-import=uvicorn.lifespan.on app/run_server.py
```

*   `--onefile`: Create a single `.exe` file.
*   `--console`: Show a console window (useful for seeing logs/status). If you want it completely silent, use `--windowed` instead (but debugging will be harder).
*   `--add-data "app/static;app/static"`: Include the frontend files.

## 4. Run it!
The executable will be created in the `dist` folder:
`backend\dist\AnimationShare.exe`

Just double-click it! It will:
1.  Start the server.
2.  Open your default browser to the app.
