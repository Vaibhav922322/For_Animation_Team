import socket
from smb.SMBConnection import SMBConnection
from typing import Optional

class SMBConnector:
    def get_smb_connection(host: str, username: str = "", password: str = "", domain: str = "", timeout: int = 5) -> Optional[SMBConnection]:
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