from fastapi import FastAPI
from apis.routes import router as api_router

def create_app() -> FastAPI:
    app = FastAPI(title="My API", version="1.0.0")

    # add all routes from routes/ in one shot
    app.include_router(api_router)

    return app

app = create_app()