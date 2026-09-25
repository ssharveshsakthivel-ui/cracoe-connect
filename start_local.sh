#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for Postgres and Redis
if ! command_exists postgres && ! command_exists psql; then
  echo "Error: Postgres is not installed or not in PATH."
  echo "Please install it via: brew install postgresql"
  exit 1
fi

if ! command_exists redis-server; then
  echo "Error: Redis is not installed or not in PATH."
  echo "Please install it via: brew install redis"
  exit 1
fi

echo "Starting Backend..."
cd backend
# Use npx to ensure we use the local nest binary
npx nest start --watch &
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
# Use npx to ensure we use the local react-scripts binary
npx react-scripts start &
FRONTEND_PID=$!

# Trap SIGINT to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

wait
