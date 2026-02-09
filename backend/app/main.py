from fastapi import FastAPI
from apis.routes import router as api_router
from smb_client.explorer import SBMFileExplorer
def create_app() -> FastAPI:
    app = FastAPI(title="My API", version="1.0.0")

    # add all routes from routes/ in one shot
    app.include_router(api_router)

    # @app.on_event("startup")
    # async def startup_event():
    #     # Start the file scan synchronously to block server startup until complete
    #     print("Starting synchronous file scan. The server will not accept requests until this finishes...")
    #     SBMFileExplorer.get_all_files()
    #     print("File scan completed. Server is now ready.")
    # return app
    return app

app = create_app()