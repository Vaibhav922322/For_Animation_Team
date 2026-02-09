from pydantic import BaseModel

class FileDownloadData:
    def __init__(self, file_path, file_name, media_type):
            self.file_path = file_path
            self.file_name = file_name
            self.media_type = media_type

class DownloadRequest(BaseModel):
    host_ip: str
    shared_folder_name: str
    file_path: str