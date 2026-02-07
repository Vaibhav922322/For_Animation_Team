from .connection import SMBConnector
from .helper import SMBHelper
from network.discovery import NetworkDiscovery
class SBMFileExplorer:
    def get_files():
        user = "vaibhav_admin"
        password = "root"
        myCdir = NetworkDiscovery.get_lan_cidr()

        print(f"My CDIR : {myCdir}")

        print(f"[*] Scanning {myCdir} for SMB (port 445)...")
        smb_hosts = NetworkDiscovery.discover_hosts_in_cidr(myCdir)
        print(f"[*] Found {len(smb_hosts)} SMB host(s). : {smb_hosts}")

        for host_entry in smb_hosts:
            host = host_entry.get("ip")
            hostname = host_entry.get("hostname", host)
            print(f"\n=== Host: {host} ({hostname}) ===")
            conn = SMBConnector.get_smb_connection(host, user, password) #, args.domain)
            if not conn:
                print("  ! SMB connect failed (bad creds / no access / SMB signing / firewall)")
                continue

            try:
                shares = SMBHelper.list_shares(conn)
                if not shares:
                    print("  (no non-special shares visible)")
                else:
                    print("  Shares:", ", ".join(shares))
                
            # remove args.max_depth
                list_files = ["boat"]
                if list_files:
                    for share in shares:
                        print(f"\n  --- Walking share: {share} ---")
                        SMBHelper.walk_share(conn, share, start_path="/") #, max_depth=args.max_depth)

            finally:
                try:
                    conn.close()
                except Exception:
                    pass

