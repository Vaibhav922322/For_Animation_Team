from fastapi import APIRouter
from typing import List, Dict, Any
from ...smb_client.explorer import SBMFileExplorer

router = APIRouter()

@router.get("/")
def smb_find(fileName: str) -> List[Dict[str, Any]]:
    """
    Search for files matching the fileName query in the locally cached discovery file.
    Returns a list of file metadata objects.
    """
    # Search for files using the explorer utility
    results = SBMFileExplorer.search_files(query=fileName)
    
    # Return directly; FastAPI handles JSON serialization
    return results