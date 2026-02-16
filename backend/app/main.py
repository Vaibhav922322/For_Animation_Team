from fastapi import FastAPI
from apis.routes import router as api_router
from smb_client.explorer import SBMFileExplorer
from fastapi.middleware.cors import CORSMiddleware

def create_app() -> FastAPI:
    app = FastAPI(title="My API", version="1.0.0")

    # add all routes from routes/ in one shot
    app.include_router(api_router)
    # Start the file scan synchronously to block server startup until complete
    print("Starting synchronous file scan. The server will not accept requests until this finishes...")
    SBMFileExplorer.get_all_files()
    print("File scan completed. Server is now ready.")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
        expose_headers=["Content-Length", "Content-Disposition"], # Expose Content-Length for progress bar
    )
    
    return app

app = create_app()
