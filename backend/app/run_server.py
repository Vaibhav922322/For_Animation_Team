import os
import uvicorn
from dotenv import load_dotenv
load_dotenv()

def main():
    host = os.getenv("HOST_IP", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    main()
