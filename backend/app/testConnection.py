import ipaddress
import socket
import argparse
from typing import List, Tuple, Optional

from smb.SMBConnection import SMBConnection
from smb.base import NotReadyError, SMBTimeout

import socket, zipfile, os, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
import psutil
import ipaddress
import socket
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.background import BackgroundTasks
from pathlib import Path
import os
import zipfile
import io
from fastapi.responses import FileResponse
app = FastAPI()
def get_lan_cidr():
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)

    for iface, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family.name == "AF_INET" and addr.address == local_ip:
                network = ipaddress.IPv4Network(
                    f"{addr.address}/{addr.netmask}",
                    strict=False
                )
                return str(network)

    return None

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't actually connect, just picks the right interface
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    finally:
        s.close()
    return ip

print(get_local_ip())

# ---------- Network helpers ----------

def is_port_open(ip: str, port: int = 445, timeout: float = 0.4) -> bool:
    try:
        with socket.create_connection((ip, port), timeout=timeout):
            return True
    except OSError:
        return False

def discover_smb_hosts(cidr: str, port: int = 445) -> List[str]:
    """
    Discover SMB hosts in parallel instead of scanning sequentially.
    This greatly reduces total scan time on larger subnets.
    """
    net = ipaddress.ip_network(cidr, strict=False)

    # Prepare list of all host IPs in the CIDR
    ip_list = [str(ip) for ip in net.hosts()]
    hosts: List[str] = []

    if not ip_list:
        return hosts

    # Limit concurrency to avoid overwhelming the network / OS
    max_workers = min(len(ip_list), 64)

    def _check(ip_str: str) -> Tuple[str, bool]:
        return ip_str, is_port_open(ip_str, port=port)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(_check, ip_str) for ip_str in ip_list]
        for fut in as_completed(futures):
            try:
                ip_str, open_ok = fut.result()
                if open_ok:
                    hosts.append(ip_str)
            except Exception:
                # Ignore individual probe errors; treat them as "closed"
                continue

    return hosts

# ---------- SMB helpers ----------

def smb_connect(host: str, username: str, password: str, domain: str = "", timeout: int = 5) -> Optional[SMBConnection]:
    """
    Creates an SMBConnection. `my_name` can be any label, `remote_name` is usually the host name,
    but we can pass the IP as well.
    """
    my_name = socket.gethostname()
    remote_name = host  # for many LANs, IP works; if not, try actual host name
    conn = SMBConnection(
        username=username,
        password=password,
        my_name=my_name,
        remote_name=remote_name,
        domain=domain,
        use_ntlm_v2=True,
        is_direct_tcp=True,  # uses port 445
    )
    try:
        ok = conn.connect(host, 445, timeout=timeout)
        return conn if ok else None
    except Exception:
        return None

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

# ---------- Main ----------

def get_files():
    user = "vaibhav_admin"
    password = "root"
    myCdir = get_lan_cidr()

    print(f"My CDIR : {myCdir}")

    print(f"[*] Scanning {myCdir} for SMB (port 445)...")
    smb_hosts = discover_smb_hosts(myCdir)
    print(f"[*] Found {len(smb_hosts)} SMB host(s). : {smb_hosts}")

    for host in smb_hosts:
        print(f"\n=== Host: {host} ===")
        conn = smb_connect(host, user, password) #, args.domain)
        if not conn:
            print("  ! SMB connect failed (bad creds / no access / SMB signing / firewall)")
            continue

        try:
            shares = list_shares(conn)
            if not shares:
                print("  (no non-special shares visible)")
            else:
                print("  Shares:", ", ".join(shares))
            
        # remove args.max_depth
            list_files = ["boat"]
            if list_files:
                for share in shares:
                    print(f"\n  --- Walking share: {share} ---")
                    walk_share(conn, share, start_path="/") #, max_depth=args.max_depth)

        finally:
            try:
                conn.close()
            except Exception:
                pass


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

def cleanup_file(path: str):
    try:
        os.remove(path)
    except Exception:
        pass

def smb_zip_to_tempfile(host: str, share: str, folder_path: str, username: str, password: str, domain: str = "") -> str:
    conn = smb_connect(host, username, password, domain)
    try:
        folder_path = folder_path.rstrip("/") or "/"

        # region agent log
        try:
            with open(r"c:\Users\vaibhav_admin\Desktop\AppCode\For_Animation_Team\Models_Share_karne_wala_app\Share Models\.cursor\debug.log", "a", encoding="utf-8") as _f:
                import json, time
                _f.write(
                    json.dumps(
                        {
                            "sessionId": "debug-session",
                            "runId": "initial",
                            "hypothesisId": "H1",
                            "location": "testConnection.py:smb_zip_to_tempfile",
                            "message": "Starting SMB zip to tempfile",
                            "data": {"host": host, "share": share, "folder_path": folder_path},
                            "timestamp": int(time.time() * 1000),
                        }
                    )
                    + "\n"
                )
        except Exception:
            pass
        # endregion

        fd, zip_path = tempfile.mkstemp(prefix="smb_", suffix=".zip")
        os.close(fd)

        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for remote_path in smb_list_recursive(conn, share, folder_path):
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

def make_smb_zip_stream(host: str, share: str, folder_path: str, username: str, password: str, domain: str = ""):
    """
    Creates ZIP in memory and streams it.
    NOTE: This buffers the whole zip in RAM. Good for small/medium folders.
    For very large folders, you'd implement a disk temp zip or true streaming zip.
    """
    conn = smb_connect(host, username, password, domain)
    try:
        buf = io.BytesIO()
        folder_path = folder_path.rstrip("/") or "/"

        with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for remote_path, is_dir in smb_list_recursive(conn, share, folder_path):
                if is_dir:
                    continue

                # Download the file bytes into memory, then write into zip
                file_buf = io.BytesIO()
                try:
                    conn.retrieveFile(share, remote_path, file_buf)
                except Exception as e:
                    raise HTTPException(status_code=403, detail=f"Cannot read file {remote_path}: {e}")

                file_buf.seek(0)

                # ZIP path should be relative to folder_path
                arcname = remote_path[len(folder_path):].lstrip("/")
                arcname = arcname or remote_path.strip("/").split("/")[-1]
                zf.writestr(arcname, file_buf.read())

        buf.seek(0)
        chunk = 1024 * 1024
        while True:
            data = buf.read(chunk)
            if not data:
                break
            yield data
    finally:
        try:
            conn.close()
        except Exception:
            pass

@app.get("/download-folder")
def smb_download_folder():
    
#     host: str,          # e.g. 192.168.1.20
#     share: str,         # e.g. Shared
#     path: str,        # e.g. /Movies or /MyFolder
#     username: str,
#     password: str,
#     domain: str = ""
# ):
    # Host, share and target path for the SMB server.
    # NOTE: `path` can point either to a folder or a single file.
    host = "192.168.1.13"
    share = "Image target"
    path = "/sanskrit/class 9th sanskrit"

    username = "vaibhav_admin"
    password = "root"

    # region agent log
    try:
        with open(r"c:\Users\vaibhav_admin\Desktop\AppCode\For_Animation_Team\Models_Share_karne_wala_app\Share Models\.cursor\debug.log", "a", encoding="utf-8") as _f:
            import json, time
            _f.write(
                json.dumps(
                    {
                        "sessionId": "debug-session",
                        "runId": "initial",
                        "hypothesisId": "H1",
                        "location": "testConnection.py:smb_download_folder",
                        "message": "Download request parameters",
                        "data": {"host": host, "share": share, "path": path},
                        "timestamp": int(time.time() * 1000),
                    }
                )
                + "\n"
            )
    except Exception:
        pass
    # endregion

    # Connect once and decide whether path is a file or folder
    conn = smb_connect(host, username, password)
    try:
        normalized_path, name, is_dir = smb_path_info(conn, share, path)

        # If it's a directory, zip it and return the zip
        if is_dir:
            zip_name = (name or "folder") + ".zip"
            zip_path = smb_zip_to_tempfile(host, share, normalized_path, username, password)

            bg = BackgroundTasks()
            bg.add_task(cleanup_file, zip_path)

            return FileResponse(
                zip_path,
                media_type="application/zip",
                filename=zip_name,
                background=bg,
            )

        # Otherwise, it's a file: download it directly
        file_path = smb_download_file_to_tempfile(conn, share, normalized_path, filename_hint=name)

        bg = BackgroundTasks()
        bg.add_task(cleanup_file, file_path)

        return FileResponse(
            file_path,
            media_type="application/octet-stream",
            filename=name or "download",
            background=bg,
        )
    finally:
        try:
            conn.close()
        except Exception:
            pass

    


def main():
    #parser = argparse.ArgumentParser(description="Discover SMB hosts and list their shares/files.")
    # parser.add_argument("--cidr", required=True, help="LAN CIDR, e.g. 192.168.1.0/24")
    #parser.add_argument("--user", required=True, help="SMB Your username")
    #parser.add_argument("--passw", required=True, help="SMB Your password")
    #parser.add_argument("--domain", default="", help="Domain/Workgroup (optional)")
    #parser.add_argument("--list-files", action="store_true", help="Also walk files inside each share")
    #parser.add_argument("--max-depth", type=int, default=3, help="Max folder depth to scan per share")
    #args = parser.parse_args()
    
    get_files()
    pass
    
    

if __name__ == "__main__":
    main()
