#!/bin/bash

# Get the directory where the script is located
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting FastAPI Server from Root..."

# 1. Navigate to the app directory
cd "$PROJECT_ROOT/app"

# 2. Run python from the sibling env folder
# Note: Mac/Linux use 'bin' instead of 'Scripts'
"../backend_env/bin/python" run_server.py