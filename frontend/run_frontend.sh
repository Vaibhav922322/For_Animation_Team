#!/bin/bash
echo "==============================="
echo "  Frontend Server Starting..."
echo "==============================="
echo ""

# Find Python
if command -v python3 &>/dev/null; then
    PYTHON_CMD=python3
elif command -v python &>/dev/null; then
    PYTHON_CMD=python
else
    echo "[ERROR] Python is not installed."
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../server_connection.json"

# Read backend port from server_connection.json
if [ -f "$CONFIG_FILE" ]; then
    BACKEND_IP=$($PYTHON_CMD -c "import json; d=json.load(open('$CONFIG_FILE')); print(d.get('SERVER_IP','127.0.0.1'))")
    BACKEND_PORT=$($PYTHON_CMD -c "import json; d=json.load(open('$CONFIG_FILE')); print(d.get('PORT','8000'))")
    echo "[INFO] Backend is at http://$BACKEND_IP:$BACKEND_PORT"
else
    echo "[WARNING] server_connection.json not found. Make sure backend is running first!"
    echo "[INFO] Using default port 8000"
    BACKEND_IP="127.0.0.1"
    BACKEND_PORT="8000"
fi

# Generate config.js with the backend URL
echo "window.__CONFIG__ = { API_URL: \"http://$BACKEND_IP:$BACKEND_PORT\" };" > "$SCRIPT_DIR/dist/config.js"
echo "[INFO] Generated config.js with API_URL = http://$BACKEND_IP:$BACKEND_PORT"

echo "[INFO] Serving frontend on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

cd "$SCRIPT_DIR/dist"
$PYTHON_CMD -m http.server 5173
