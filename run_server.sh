#!/bin/bash
# Script to run the ReAct Agent Backend server

# Check if virtual environment exists, if not create it
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Creating one..."
    echo
    echo "If you have uv installed (recommended):"
    echo "  uv venv"
    echo "  source .venv/bin/activate"
    echo "  uv pip install -r requirements.txt"
    echo
    echo "If you prefer pip:"
    echo "  python -m venv .venv"
    echo "  source .venv/bin/activate"
    echo "  pip install -r requirements.txt"
    echo
    echo "Then run this script again."
    exit 1
fi

# Activate virtual environment if not already activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Activating virtual environment..."
    source .venv/bin/activate
fi

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Check if Anthropic API key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Error: ANTHROPIC_API_KEY environment variable is not set."
    echo "Please set it in the .env file or export it before running this script."
    exit 1
fi

# Set default environment if not set
if [ -z "$ENVIRONMENT" ]; then
    export ENVIRONMENT="development"
    echo "Setting default ENVIRONMENT to 'development'"
fi

# Set default authentication if not set
if [ -z "$AUTH_USERNAME" ]; then
    export AUTH_USERNAME="admin"
    echo "Setting default AUTH_USERNAME to 'admin'"
fi

if [ -z "$AUTH_PASSWORD" ]; then
    export AUTH_PASSWORD="password"
    echo "Setting default AUTH_PASSWORD to 'password'"
    echo "WARNING: Using default password. Change this in production!"
fi

# Set default host and port if not set
if [ -z "$HOST" ]; then
    export HOST="0.0.0.0"
    echo "Setting default HOST to '0.0.0.0'"
fi

if [ -z "$PORT" ]; then
    export PORT="8000"
    echo "Setting default PORT to '8000'"
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Run the server
echo "Starting ReAct Agent Backend server..."
echo "Environment: $ENVIRONMENT"
echo "Host: $HOST"
echo "Port: $PORT"
echo "Press Ctrl+C to stop the server"

if [ "$ENVIRONMENT" = "development" ]; then
    # Run with reload in development mode
    uvicorn main:app --host $HOST --port $PORT --reload
else
    # Run without reload in production mode
    uvicorn main:app --host $HOST --port $PORT
fi
