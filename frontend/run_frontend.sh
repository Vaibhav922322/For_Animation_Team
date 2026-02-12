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
    echo "Please install Python: brew install python3 (Mac) or sudo apt install python3 (Linux)"
    exit 1
fi

echo "[INFO] Serving frontend on http://localhost:5173"
echo "[INFO] Make sure the backend is running on port 8000"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/dist"
$PYTHON_CMD -m http.server 5173
