#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Docker is installed
if ! command_exists docker; then
  echo "Warning: Docker is not installed. Skipping backend services."
  SKIP_BACKEND=true
else
  # Check if Docker Compose is installed
  if ! command_exists docker-compose; then
      if ! docker compose version >/dev/null 2>&1; then
          echo "Warning: Docker Compose is not installed. Skipping backend services."
          SKIP_BACKEND=true
      fi
  fi
fi

if [ "$SKIP_BACKEND" != "true" ]; then
    echo "Starting Backend Services..."
    cd backend

    # Ensure .env exists
    if [ ! -f .env ]; then
      echo "Creating backend/.env from .env.example..."
      cp .env.example .env
    fi

    # Start Docker Compose
    if command_exists docker-compose; then
        docker-compose up -d
    else
        docker compose up -d
    fi

    if [ $? -ne 0 ]; then
      echo "Warning: Failed to start backend services. Proceeding with Frontend only."
    else
      echo "Backend services started."
    fi

    cd ..
fi

echo "Starting Frontend..."
# Install dependencies if node_modules key doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies (using local cache)..."
  npm install --cache .npm-cache
fi

# Start Frontend
echo "Starting React App on PORT 3001..."
PORT=3001 npm start
