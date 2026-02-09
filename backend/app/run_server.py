import os
import uvicorn
import socket
import json

def save_server_connection(server_ip : str, port: int):
    data = {
        "SERVER_IP": server_ip,
        "PORT": port
    }

    # Define your file path
    server_connection_file_path = "..\\..\\server_connection.json"

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


def main():
    try:        
        host = "127.0.0.1"
        port = get_open_port()
        save_server_connection(server_ip=host, port=port)
        uvicorn.run("main:app", host=host, port=port, reload=False)

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        input("\nPress Enter to exit...") # This keeps the window open so you can read the error!

if __name__ == "__main__":
    main()