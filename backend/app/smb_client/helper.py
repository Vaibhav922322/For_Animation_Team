from smb.SMBConnection import SMBConnection
from typing import List
from smb.base import NotReadyError, SMBTimeout
from fastapi import HTTPException
from model.fileMetaData import FileMetadata
from model.globalData import GlobalData

class SMBHelper:
    def list_shares(conn: SMBConnection) -> List[str]:
        shares = []
        for s in conn.listShares():
            # skip special/hidden/admin shares unless you want them
            if s.isSpecial or s.name.endswith("$"):
                continue
            shares.append(s.name)
        return shares

    def walk_share(conn: SMBConnection, share: str, hostname: str, start_path: str = "/", max_depth: int = 1) -> List[FileMetadata]:
        """
        Recursively lists files/folders up to max_depth to avoid huge scans.
        Returns a list of discovered file paths (formatted strings).
        """
        results = []
        def _walk(path: str, depth: int) -> int:
            total_size_bytes = 0
            if depth > max_depth:
                return 0
            try:
                for f in conn.listPath(share, path):
                    name = f.filename
                    if name in [".", ".."]:
                        continue

                    full = (path.rstrip("/") + "/" + name).replace("//", "/")
                    
                    # Create FileMetadata object
                    is_file = not f.isDirectory
                    full_unc_path = f"\\\\{conn.remote_name}\\{share}{full}"
                    
                    metadata = FileMetadata(
                        full_unc_path=full_unc_path,
                        file_path=full,
                        file_name=name,
                        shared_folder_name=share,
                        file_size=f.file_size,
                        is_file=is_file,
                        host= GlobalData.ip_to_author.get(conn.remote_name),
                        host_ip=conn.remote_name,
                        host_name=hostname
                    )

                    if f.isDirectory:
                        print(f"[DIR ] {full_unc_path}")
                        results.append(metadata)
                        # Recurse and add content size
                        content_size = _walk(full, depth + 1)
                        # Update folder size with its content size
                        metadata.file_size = content_size
                        total_size_bytes += content_size
                    else:
                        print(f"[FILE] {full_unc_path}  ({f.file_size} bytes)")
                        results.append(metadata)
                        total_size_bytes += f.file_size
                        
            except (NotReadyError, SMBTimeout, Exception) as e:
                print(f"  ! Could not read {share}:{path} -> {e}")
            
            return total_size_bytes

        _walk(start_path, 0)
        return results

    def smb_list_recursive(conn: SMBConnection, share: str, base_path: str):
        stack = [base_path.rstrip("/") or "/"]
        while stack:
            current = stack.pop()
            try:
                entries = conn.listPath(share, current)
            except Exception as e:
                raise HTTPException(status_code=403, detail=f"Cannot list SMB path {current}: {e}")

            for e in entries:
                name = e.filename
                if name in (".", ".."):
                    continue
                full = (current.rstrip("/") + "/" + name).replace("//", "/")
                if e.isDirectory:
                    stack.append(full)
                else:
                    yield full

    def smb_path_info(conn: SMBConnection, share: str, path: str):
        """
        Return (normalized_path, name, is_directory) for a given SMB path.
        normalized_path is the path to use with SMB calls (leading slash, forward slashes).
        """
        # Normalize separators and trailing slash
        normalized = path.replace("\\", "/").rstrip("/") or "/"

        # Root of the share is always a directory
        if normalized == "/":
            return normalized, "", True, 0

        # Split into parent folder and entry name
        if "/" in normalized:
            parent, name = normalized.rsplit("/", 1)
            parent = parent or "/"
        else:
            parent, name = "/", normalized

        try:
            entries = conn.listPath(share, parent)
        except Exception as e:
            raise HTTPException(
                status_code=403,
                detail=f"Cannot list SMB parent path {parent}: {e}",
            )

        for entry in entries:
            if entry.filename == name:
                return normalized, name, entry.isDirectory, entry.file_size

        raise HTTPException(
            status_code=404,
            detail=f"SMB path not found: {normalized}",
        )

