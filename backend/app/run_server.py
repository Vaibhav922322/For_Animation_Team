import uvicorn
import socket
import json
from pathlib import Path

def get_server_connection_file_path():

    parent_dir = Path.cwd().parent
    file_path = parent_dir / "server_connection.json"
    return file_path    

def save_server_connection(server_ip : str, port: int):
    data = {
        "SERVER_IP": server_ip,
        "PORT": port
    }

    # Define your file path
    server_connection_file_path = get_server_connection_file_path()

    with open(server_connection_file_path, "w") as json_file:
        json.dump(data, json_file, indent=4)
        print(f"Successfully saved to {server_connection_file_path}")

def get_open_port():
    # This creates a temporary socket to find an available port
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def get_local_ip():
    try:
        # Create a dummy socket to connect to an external IP (doesn't actually connect)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def main():
    try:        
        # Use 0.0.0.0 to bind to all interfaces for remote access
        host = "0.0.0.0"
        port = get_open_port()
        
        # Get LAN IP for the frontend to connect to
        lan_ip = get_local_ip()
        print(f"[INFO] Backend will be available at http://{lan_ip}:{port}")
        
        # Save the LAN IP so frontend knows where to connect
        save_server_connection(server_ip=lan_ip, port=port)
        
        uvicorn.run("main:app", host=host, port=port, reload=False)

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        input("\nPress Enter to exit...") # This keeps the window open so you can read the error!

if __name__ == "__main__":
    main()