from fastapi import APIRouter
from smb_client.explorer import SBMFileExplorer

router = APIRouter()

@router.post("/")
def smb_refresh():
    SBMFileExplorer.get_all_files()
    return {"message": "Refresh completed successfully"}