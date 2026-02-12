from fastapi import APIRouter, HTTPException
from smb_client.downloader import SBMDownloader
from smb_client.connection import SMBConnector
from fastapi.background import BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from model.download import DownloadRequest
from utility import Utility

router = APIRouter()

@router.post("/")
def smb_download(request: DownloadRequest):
    # ... (validation checks same as before)
    if(Utility.is_null_or_white_space(request.file_path)):
        raise HTTPException(status_code=400, detail="Invalid file path")

    if(not Utility.is_valid_ipv4(request.host_ip)):
        raise HTTPException(status_code=400, detail="Invalid host ip")

    if(Utility.is_null_or_white_space(request.shared_folder_name)):
        raise HTTPException(status_code=400, detail="Invalid shared folder name")

    conn = SMBConnector.get_smb_connection(host=request.host_ip)
    downloadData = None
    try:
        downloadData = SBMDownloader.download(conn=conn, sharedFolder=request.shared_folder_name, path=request.file_path, host=request.host_ip)
        
        if downloadData is None:
             raise HTTPException(status_code=500, detail="Failed to download file")

        if downloadData.stream:
            # Serve as stream
            # Content-Length is crucial for progress bar
            headers = {"Content-Length": str(downloadData.file_size)}
            # We do NOT add background task to cleanup file because there is no local file!
            return StreamingResponse(
                downloadData.stream, 
                media_type=downloadData.media_type, 
                headers=headers
            )
        else:
            # Serve as local file (ZIP)
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
        # If we are streaming, the generator closes the connection. 
        # Only close here if NOT streaming (e.g. error or zip download).
        if not (downloadData and downloadData.stream):
            try:
                conn.close()
            except Exception:
                pass