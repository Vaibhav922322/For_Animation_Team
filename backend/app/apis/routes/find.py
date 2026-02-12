from fastapi import APIRouter
from typing import List, Dict, Any
from smb_client.explorer import SBMFileExplorer

router = APIRouter()

@router.get("/")
def smb_find(fileName: str = None, directory_path: str = None) -> List[Dict[str, Any]]:
    """
    Search for files matching the fileName query OR list files in directory_path.
    Returns a list of file metadata objects.
    """
    # Search for files using the explorer utility
    results = SBMFileExplorer.search_files(query=fileName, directory_path=directory_path)
    
    # Return directly; FastAPI handles JSON serialization
    return results