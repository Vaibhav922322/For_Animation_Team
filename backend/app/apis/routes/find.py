from fastapi import APIRouter
from smb_client.downloader import SBMDownloader
from smb_client.connection import SMBConnector
from fastapi.background import BackgroundTasks
from fastapi.responses import FileResponse
from fastapi import HTTPException

router = APIRouter()

# @router.get("/download")
# def smb_download_folder():
    
# #     host: str,          # e.g. 192.168.1.20
# #     share: str,         # e.g. Shared
# #     path: str,        # e.g. /Movies or /MyFolder
# #     username: str,
# #     password: str,
# #     domain: str = ""
# # ):
#     # Host, share and target path for the SMB server.
#     # NOTE: `path` can point either to a folder or a single file.
#     host = "192.168.1.13"
#     share = "Image target"
#     path = "/sanskrit/class 9th sanskrit"

#     username = "vaibhav_admin"
#     password = "root"

#     # region agent log
#     try:
#         with open(r"c:\Users\vaibhav_admin\Desktop\AppCode\For_Animation_Team\Models_Share_karne_wala_app\Share Models\.cursor\debug.log", "a", encoding="utf-8") as _f:
#             import json, time
#             _f.write(
#                 json.dumps(
#                     {
#                         "sessionId": "debug-session",
#                         "runId": "initial",
#                         "hypothesisId": "H1",
#                         "location": "testConnection.py:smb_download_folder",
#                         "message": "Download request parameters",
#                         "data": {"host": host, "share": share, "path": path},
#                         "timestamp": int(time.time() * 1000),
#                     }
#                 )
#                 + "\n"
#             )
#     except Exception:
#         pass
#     # endregion

#     # Connect once and decide whether path is a file or folder

   
#     conn =  SMBConnector.get_smb_connection(host=host, username=username, password=password, domain="", timeout= 5)
#     try:
#         downloadData = SBMDownloader.download(conn=conn, sharedFolder=share, path=path, host=host, username="", password="")
        
        
#         if (downloadData.file_path is None) or (downloadData.file_name is None) or (downloadData.media_type is None):
#             raise HTTPException(status_code=500, detail="Failed to download file")

#         bg = BackgroundTasks()
#         bg.add_task(SBMDownloader.cleanup_file, downloadData.file_path)

#         return FileResponse(
#                 path=downloadData.file_path,
#                 status_code=200,
#                 media_type=downloadData.media_type,
#                 filename=downloadData.file_name,
#                 background=bg
#             )
    
#     finally:
#         try:
#             conn.close()
#         except Exception:
#             pass