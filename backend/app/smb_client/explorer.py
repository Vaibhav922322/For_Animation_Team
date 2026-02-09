from .connection import SMBConnector
from .helper import SMBHelper
from network.discovery import NetworkDiscovery
import json
class SBMFileExplorer:
    def get_all_files():
        myCdir = NetworkDiscovery.get_lan_cidr()

        print(f"My CDIR : {myCdir}")

        print(f"[*] Scanning {myCdir} for SMB (port 445)...")
        smb_hosts = NetworkDiscovery.discover_hosts_in_cidr(myCdir)
        print(f"[*] Found {len(smb_hosts)} SMB host(s). : {smb_hosts}")
        
        all_discovered_files = []

        for host_entry in smb_hosts:
            host = host_entry.get("ip")
            hostname = host_entry.get("hostname", host)
            conn = SMBConnector.get_smb_connection(host)
            print(f"\n=== Host: {host} ({hostname}) ===")
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
                        found = SMBHelper.walk_share(conn, share, start_path="/") #, max_depth=args.max_depth)
                        all_discovered_files.extend(found)

            finally:
                try:
                    conn.close()
                except Exception:
                    pass

        # Save all discovered file paths to a file
        if all_discovered_files:
            output_file = "smb_discovered_files.txt"
            try:
                # Convert FileMetadata objects to dictionaries
                data_to_save = [vars(f) for f in all_discovered_files]
                
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(data_to_save, f, indent=4)
                    
                print(f"\n[+] Successfully saved {len(all_discovered_files)} objects to {output_file}")
            except Exception as e:
                print(f"\n[-] Failed to save paths to file: {e}")
        else:
            print("\n[-] No files found to save.")

    def search_files(query: str):
        output_file = "smb_discovered_files.txt"
        try:
            with open(output_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Filter objects where file_name contains the query (case-insensitive)
            results = [obj for obj in data if query.lower() in obj.get("file_name", "").lower()]
            return results
        except FileNotFoundError:
            print(f"[-] File {output_file} not found.")
            return []
        except json.JSONDecodeError:
            print(f"[-] Error decoding JSON from {output_file}.")
            return []
        except Exception as e:
            print(f"[-] Error reading file: {e}")
            return []