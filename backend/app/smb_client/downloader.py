import os
from .connection import SMBConnector
from .helper import SMBHelper
import zipfile, tempfile
from smb.SMBConnection import SMBConnection
from fastapi import HTTPException
from model.download import FileDownloadData

class SBMDownloader:

    def cleanup_file(path: str):
        try:
            os.remove(path)
        except Exception:
            pass

    def smb_zip_to_tempfile(host: str, share: str, folder_path: str, username: str, password: str, domain: str = "") -> str:
        conn = SMBConnector.get_smb_connection(host=host, username=username, password=password, domain=domain)
        try:
            folder_path = folder_path.rstrip("/") or "/"
            fd, zip_path = tempfile.mkstemp(prefix="smb_", suffix=".zip")
            os.close(fd)

            with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for remote_path in SMBHelper.smb_list_recursive(conn, share, folder_path):
                    # Write file to zip without loading full file into RAM
                    arcname = remote_path[len(folder_path):].lstrip("/")
                    arcname = arcname or remote_path.strip("/").split("/")[-1]

                    with tempfile.NamedTemporaryFile(delete=False) as tmp:
                        tmp_path = tmp.name

                    try:
                        with open(tmp_path, "wb") as f:
                            conn.retrieveFile(share, remote_path, f)
                        zf.write(tmp_path, arcname=arcname)
                    finally:
                        try:
                            os.remove(tmp_path)
                        except Exception:
                            pass

            return zip_path
        finally:
            try:
                conn.close()
            except Exception:
                pass

    def smb_download_file_to_tempfile(conn: SMBConnection, share: str, file_path: str, filename_hint: str = "") -> str:
        """
        Download a single SMB file to a temporary local file and return its path.
        """
        # Use the hint to preserve the extension when possible
        ext = os.path.splitext(filename_hint or file_path)[1]
        fd, tmp_path = tempfile.mkstemp(prefix="smb_file_", suffix=ext)
        try:
            with os.fdopen(fd, "wb") as f:
                conn.retrieveFile(share, file_path, f)
        except Exception as e:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
            raise HTTPException(
                status_code=403,
                detail=f"Cannot read SMB file {file_path}: {e}",
            )

        return tmp_path

    def download(conn: SMBConnection, sharedFolder: str, path: str, host: str, username: str = "", password: str = "") -> FileDownloadData | None:
        try:
            normalized_path, name, is_dir = SMBHelper.smb_path_info(conn, sharedFolder, path)
            final_file_path = None
            final_file_name = None
            final_media_type = None
            # If it's a directory, zip it and return the zip
            if is_dir:
                zip_name = (name or "folder") + ".zip"
                zip_path = SBMDownloader.smb_zip_to_tempfile(host, sharedFolder, normalized_path, username, password)
                final_file_path = zip_path
                final_file_name = zip_name
                final_media_type = "application/zip"

            else:
                # Otherwise, it's a file: download it directly
                file_path = SBMDownloader.smb_download_file_to_tempfile(conn, sharedFolder, normalized_path, filename_hint=name)
                final_file_path = file_path
                final_file_name = name or "download"
                final_media_type = "application/octet-stream"

            if (final_file_path is None) or (final_file_name is None) or (final_media_type is None):
                return None

            return FileDownloadData(file_name=final_file_name, 
                                    file_path=final_file_path, 
                                    media_type=final_media_type)
             

        finally:
            try:
                conn.close()
            except Exception:
                pass