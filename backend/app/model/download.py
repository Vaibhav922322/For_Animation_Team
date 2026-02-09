from pydantic import BaseModel

class FileDownloadData:
    def __init__(self, file_path, file_name, media_type):
            self.file_path = file_path
            self.file_name = file_name
            self.media_type = media_type

class DownloadRequest(BaseModel):
    def __init__(self, host_ip, shared_folder_name, file_path):
            self.host_ip = host_ip
            self.shared_folder_name = shared_folder_name
            self.file_path = file_path