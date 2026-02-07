from smb.SMBConnection import SMBConnection
from typing import List
from smb.base import NotReadyError, SMBTimeout
from fastapi import HTTPException

class SMBHelper:
    def list_shares(conn: SMBConnection) -> List[str]:
        shares = []
        for s in conn.listShares():
            # skip special/hidden/admin shares unless you want them
            if s.isSpecial or s.name.endswith("$"):
                continue
            shares.append(s.name)
        return shares

    def walk_share(conn: SMBConnection, share: str, start_path: str = "/", max_depth: int = 1):
        """
        Recursively lists files/folders up to max_depth to avoid huge scans.
        """
        def _walk(path: str, depth: int):
            if depth > max_depth:
                return
            try:
                for f in conn.listPath(share, path):
                    name = f.filename
                    if name in [".", ".."]:
                        continue

                    full = (path.rstrip("/") + "/" + name).replace("//", "/")
                    if f.isDirectory:
                        print(f"[DIR ] \\\\{conn.remote_name}\\{share}{full}")
                        _walk(full, depth + 1)
                    else:
                        print(f"[FILE] \\\\{conn.remote_name}\\{share}{full}  ({f.file_size} bytes)")
            except (NotReadyError, SMBTimeout, Exception) as e:
                print(f"  ! Could not read {share}:{path} -> {e}")

        _walk(start_path, 0)

    def smb_list_recursive(conn: SMBConnection, share: str, base_path: str):
        stack = [base_path.rstrip("/") or "/"]
        while stack:
            current = stack.pop()
            try:
                entries = conn.listPath(share, current)
            except Exception as e:
                # region agent log
                try:
                    with open(r"c:\Users\vaibhav_admin\Desktop\AppCode\For_Animation_Team\Models_Share_karne_wala_app\Share Models\.cursor\debug.log", "a", encoding="utf-8") as _f:
                        import json, time
                        _f.write(
                            json.dumps(
                                {
                                    "sessionId": "debug-session",
                                    "runId": "initial",
                                    "hypothesisId": "H2",
                                    "location": "testConnection.py:smb_list_recursive",
                                    "message": "Error listing SMB path",
                                    "data": {"share": share, "current": current, "error": str(e)},
                                    "timestamp": int(time.time() * 1000),
                                }
                            )
                            + "\n"
                        )
                except Exception:
                    pass
                # endregion
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
            return normalized, "", True

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
                return normalized, name, entry.isDirectory

        raise HTTPException(
            status_code=404,
            detail=f"SMB path not found: {normalized}",
        )

