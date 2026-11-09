#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$DIR/.tools/node-v20.18.0-darwin-arm64/bin:$DIR/.venv/bin:$PATH"

free_port() {
  local port=$1
  local pid=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "Freeing port $port (killing PID $pid)..."
    kill -9 $pid 2>/dev/null || true
    sleep 1
  fi
}

case "$1" in
  stop)
    echo "Stopping any running servers on ports 5000 and 3000..."
    free_port 5000
    free_port 3000
    echo "All servers stopped."
    ;;
  backend)
    free_port 5000
    echo "Starting Flask Backend on http://localhost:5000..."
    python "$DIR/app.py"
    ;;
  frontend)
    free_port 3000
    echo "Starting React Frontend on http://localhost:3000..."
    cd "$DIR/frontend" && npm start
    ;;
  dev)
    free_port 5000
    free_port 3000
    echo "Starting Backend (port 5000) and React Dev Server (port 3000)..."
    trap 'kill $(jobs -p) 2>/dev/null || true' EXIT SIGINT SIGTERM
    python "$DIR/app.py" &
    (cd "$DIR/frontend" && npm start) &
    wait
    ;;
  build)
    echo "Building React Frontend..."
    cd "$DIR/frontend" && npm run build
    ;;
  *)
    free_port 5000
    echo "Starting SmartLearn AI Fullstack Application on http://localhost:5000..."
    python "$DIR/app.py"
    ;;
esac
