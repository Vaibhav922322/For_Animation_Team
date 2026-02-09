from fastapi import APIRouter
from smb_client.downloader import SBMDownloader
from smb_client.connection import SMBConnector
from fastapi.background import BackgroundTasks
from fastapi.responses import FileResponse
from fastapi import HTTPException
from model.download import DownloadRequest
from utility import Utility

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
    host_ip: str,
    shared_folder_name: str,
    file_path: str,
#   request: DownloadRequest
):
    # Host, share and target path for the SMB server.
    # NOTE: `path` can point either to a folder or a single file.
    
    request = DownloadRequest(host_ip=host_ip, shared_folder_name=shared_folder_name, file_path=file_path)

    # Connect once and decide whether path is a file or folder
    if(Utility.is_null_or_white_space(request.file_path)):
        raise HTTPException(status_code=400, detail="Invalid file path")

    if(not Utility.is_valid_ipv4(request.host_ip)):
        raise HTTPException(status_code=400, detail="Invalid host ip")

    if(Utility.is_null_or_white_space(request.shared_folder_name)):
        raise HTTPException(status_code=400, detail="Invalid shared folder name")

    conn =  SMBConnector.get_smb_connection(host=request.host_ip)
    try:
        downloadData = SBMDownloader.download(conn=conn, sharedFolder=request.shared_folder_name, path=request.file_path, host=request.host_ip)
        
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