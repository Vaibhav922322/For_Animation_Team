#!/usr/bin/env bash
set -e

# ===== CONFIG =====
PYTHON_DIR="python"
VENV_DIR="backend_env_unix"
REQ_FILE="requirements.txt"
APP_FILE="app/run_server.py"
# ==================

echo "==============================="
echo "Backend bootstrap starting..."
echo "==============================="

# 1. Check bundled Python
if [ ! -x "$PYTHON_DIR/bin/python3" ] && [ ! -x "$PYTHON_DIR/python" ]; then
    echo "[ERROR] Bundled Python not found in $PYTHON_DIR"
    exit 1
fi

# Prefer python3 if available
if [ -x "$PYTHON_DIR/bin/python3" ]; then
    BASE_PY="$PYTHON_DIR/bin/python3"
else
    BASE_PY="$PYTHON_DIR/python"
fi

VENV_PY="$VENV_DIR/bin/python"

# 2. Check venv
if [ -x "$VENV_PY" ]; then
    echo "[INFO] Virtual environment already exists. Skipping creation."
else
    echo "[INFO] Creating virtual environment: $VENV_DIR"
    "$BASE_PY" -m venv "$VENV_DIR"

    # 2.5 Install dependencies
    if [ -f "$REQ_FILE" ]; then
        echo "[INFO] Installing dependencies from $REQ_FILE"
        "$VENV_PY" -m pip install --upgrade pip
        "$VENV_PY" -m pip install -r "$REQ_FILE"
    else
        echo "[WARN] requirements.txt not found. Skipping dependency install."
    fi
fi

# 3. Run backend
if [ ! -f "$APP_FILE" ]; then
    echo "[ERROR] App file not found: $APP_FILE"
    exit 1
fi

echo "[INFO] Starting backend..."
"$VENV_PY" "$APP_FILE"

EXIT_CODE=$?
echo
echo "Backend exited with code $EXIT_CODE"
exit $EXIT_CODE
