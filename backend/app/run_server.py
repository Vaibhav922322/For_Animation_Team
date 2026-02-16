import uvicorn
import socket
import json
from pathlib import Path

def get_server_connection_file_path():
    # Robustly find path relative to this script (backend/app/run_server.py)
    # parent -> backend/app
    # parent.parent -> backend
    base_dir = Path(__file__).resolve().parent.parent
    file_path = base_dir / "server_connection.json"
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
def generate_frontend_config(server_ip: str, port: int):
    # Determine the frontend dist directory (where built files live)
    # parent -> backend/app
    # parent.parent -> backend
    # parent.parent.parent -> project root
    # project root/frontend/dist -> frontend build
    base_dir = Path(__file__).resolve().parent.parent.parent
    dist_dir = base_dir / "frontend" / "dist"
    config_path = dist_dir / "config.js"
    
    # Check if dist dir exists
    if not dist_dir.exists():
        print(f"[WARNING] Frontend dist directory not found at {dist_dir}. Config.js not generated.")
        return

    api_url = f"http://{server_ip}:{port}"
    config_content = f"window.env = {{ API_BASE_URL: '{api_url}' }};"
    
    try:
        with open(config_path, "w") as f:
            f.write(config_content)
        print(f"[INFO] Generated frontend config at {config_path} with API_URL={api_url}")
    except Exception as e:
        print(f"[ERROR] Failed to write config.js: {e}")

def main():
    try:        
        # Use 0.0.0.0 to bind to all interfaces for remote access
        host = "0.0.0.0"
        
        # Use dynamic port as requested by user
        port = get_open_port() 
        
        # Get LAN IP for the frontend to connect to
        lan_ip = get_local_ip()
        print(f"[INFO] Backend will be available at http://{lan_ip}:{port}")
        
        # Save the LAN IP so frontend knows where to connect
        save_server_connection(server_ip=lan_ip, port=port)
        
        # Generate config.js for the standalone frontend build
        generate_frontend_config(server_ip=lan_ip, port=port)
        
        uvicorn.run("main:app", host=host, port=port, reload=False)

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        input("\nPress Enter to exit...") # This keeps the window open so you can read the error!

if __name__ == "__main__":
    main()