from fastapi import APIRouter, Query
from smb_client.downloader import SBMDownloader
from smb_client.connection import SMBConnector
from fastapi.background import BackgroundTasks
from fastapi.responses import FileResponse
from fastapi import HTTPException

router = APIRouter()

def parseDownloadPath(downloadPath: str):
    
    # Normalize separators to '/' and strip leading/trailing slashes for easier splitting
    temp_path = downloadPath.replace("\\", "/").strip("/")
    parts = temp_path.split("/", 2) # Split into at most 3 parts: host, share, rest_of_path

    if len(parts) < 3:
         raise HTTPException(status_code=400, detail=f"Invalid SMB path format. Expected \\\\<host>\\<share>\\<path>, got: {downloadPath}")

    host = parts[0]
    share = parts[1]
    path = "/" + parts[2] # Ensure path starts with /

    return host, share, path

@router.get("/")
def smb_download(
    host: str,          # e.g. 192.168.1.20
    share: str,         # e.g. Shared
    path: str,        # e.g. /Movies or /MyFolder
):
    # Host, share and target path for the SMB server.
    # NOTE: `path` can point either to a folder or a single file.

    # Connect once and decide whether path is a file or folder
    conn =  SMBConnector.get_smb_connection(host=host)
    try:
        downloadData = SBMDownloader.download(conn=conn, sharedFolder=share, path=path, host=host)
        
        if (downloadData.file_path is None) or (downloadData.file_name is None) or (downloadData.media_type is None):
            raise HTTPException(status_code=500, detail="Failed to download file")

        bg = BackgroundTasks()
        bg.add_task(SBMDownloader.cleanup_file, downloadData.file_path)

        return FileResponse(
                path=downloadData.file_path,
                status_code=200,
                media_type=downloadData.media_type,
                filename=downloadData.file_name,
                background=bg
            )
    
    finally:
        try:
            conn.close()
        except Exception:
            pass