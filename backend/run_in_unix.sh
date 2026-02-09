#!/usr/bin/env bash

# ==============================
# Backend bootstrap (Unix)
# ==============================

set -u   # error on undefined vars

# ===== CONFIG =====
PYTHON_DIR="python"
VENV_DIR="backend_env_window"
REQ_FILE="requirements.txt"
APP_FILE="app/run_server.py"
# ==================

echo "==============================="
echo "Backend bootstrap starting..."
echo "==============================="

# -------- error handler ----------
venv_fail() {
    echo
    echo "[ERROR] Venv setup failed. Cleaning up ${VENV_DIR} ..."
    if [ -d "$VENV_DIR" ]; then
        rm -rf "$VENV_DIR"
    fi
    echo "[INFO] Venv folder deleted."
    exit 1
}
# ---------------------------------

# 1. Check bundled Python
if [ -x "$PYTHON_DIR/bin/python3" ]; then
    BASE_PY="$PYTHON_DIR/bin/python3"
elif [ -x "$PYTHON_DIR/python" ]; then
    BASE_PY="$PYTHON_DIR/python"
else
    echo "[ERROR] Bundled Python not found in $PYTHON_DIR"
    exit 1
fi

VENV_PY="$VENV_DIR/bin/python"

# 2. Create venv if missing
if [ -x "$VENV_PY" ]; then
    echo "[INFO] Virtual environment already exists. Skipping creation."
else
    echo "[INFO] Creating virtual environment: $VENV_DIR"
    "$BASE_PY" -m venv "$VENV_DIR" || venv_fail

    # 2.5 Install dependencies
    if [ -f "$REQ_FILE" ]; then
        echo "[INFO] Installing dependencies from $REQ_FILE"
        "$VENV_PY" -m pip install --upgrade pip || venv_fail
        "$VENV_PY" -m pip install -r "$REQ_FILE" || venv_fail
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
