from network.discovery import NetworkDiscovery
from smb_client.explorer import SBMFileExplorer

def get_files():
    SBMFileExplorer.get_all_files()
    print(SBMFileExplorer.search_files(query="10_hi"))

def main():
    #get_files()
    pass
    
    

if __name__ == "__main__":
    main()
