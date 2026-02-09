# app/routes/__init__.py
from fastapi import APIRouter
from .download import router as download_router
from .find import router as find_router
from .refresh import router as refresh_router

router = APIRouter()

router.include_router(download_router, prefix="/download", tags=["Download"])
router.include_router(find_router, prefix="/find", tags=["Find"])
router.include_router(refresh_router, prefix="/refresh", tags=["Refresh"])