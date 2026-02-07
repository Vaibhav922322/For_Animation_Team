from network.discovery import NetworkDiscovery
from smb_client.explorer import SBMFileExplorer

def get_files():
    SBMFileExplorer.get_files()

def main():
    get_files()
    
    

if __name__ == "__main__":
    main()
