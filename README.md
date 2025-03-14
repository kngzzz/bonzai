# ReAct Agent Backend

This repository contains a backend implementation for hosting the ReAct Agent as a web service. It provides both REST API and WebSocket interfaces for interacting with the agent.

## Features

- FastAPI backend with WebSocket support
- Session management for multiple concurrent users
- Tool safety layer for hosted environments
- Simple web-based chat interface
- Authentication for internal team use
- Deployment configurations for Heroku and Vercel

## Setup

### Prerequisites

- Python 3.8+
- Anthropic API key (Claude)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   
   #### Using pip:
   
   **Windows:**
   ```
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
   
   **macOS/Linux:**
   ```
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
   
   #### Using uv (recommended):
   
   **Windows:**
   ```
   # Install uv if you don't have it
   # See https://github.com/astral-sh/uv for Windows installation
   
   # Create and activate a virtual environment
   uv venv
   .venv\Scripts\activate
   
   # Install dependencies
   uv pip install -r requirements.txt
   ```
   
   **macOS/Linux:**
   ```
   # Install uv if you don't have it
   curl -sSf https://install.ultraviolet.rs | sh
   
   # Create and activate a virtual environment
   uv venv
   source .venv/bin/activate
   
   # Install dependencies
   uv pip install -r requirements.txt
   ```

3. Set up environment variables:

   You can either set environment variables directly or create a `.env` file in the project root.
   
   **Windows (Command Prompt):**
   ```
   set ANTHROPIC_API_KEY=your_anthropic_api_key
   set AUTH_USERNAME=admin
   set AUTH_PASSWORD=your_secure_password
   set ENVIRONMENT=development
   ```
   
   **Windows (PowerShell):**
   ```
   $env:ANTHROPIC_API_KEY="your_anthropic_api_key"
   $env:AUTH_USERNAME="admin"
   $env:AUTH_PASSWORD="your_secure_password"
   $env:ENVIRONMENT="development"
   ```
   
   **macOS/Linux:**
   ```
   export ANTHROPIC_API_KEY=your_anthropic_api_key
   export AUTH_USERNAME=admin
   export AUTH_PASSWORD=your_secure_password
   export ENVIRONMENT=development
   ```
   
   **Using .env file (all platforms):**
   
   Create a `.env` file in the project root with the following content:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key
   AUTH_USERNAME=admin
   AUTH_PASSWORD=your_secure_password
   ENVIRONMENT=development
   ```

### Running Locally

#### Using convenience scripts (recommended):

**Windows:**
```
run_server.bat
```

**macOS/Linux:**
```
chmod +x run_server.sh  # Make the script executable (first time only)
./run_server.sh
```

These scripts will:
- Check if a virtual environment exists and create one if needed
- Activate the virtual environment
- Load environment variables from .env file if it exists
- Check for required environment variables
- Set default values for optional environment variables
- Create the logs directory if it doesn't exist
- Start the server with the appropriate settings

#### Manual start:

**Windows:**
```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**macOS/Linux:**
```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at http://localhost:8000.

## Deployment

### Heroku Deployment

1. Create a Heroku app:
   ```
   heroku create your-app-name
   ```

2. Set environment variables:
   ```
   heroku config:set ANTHROPIC_API_KEY=your_anthropic_api_key
   heroku config:set AUTH_USERNAME=admin
   heroku config:set AUTH_PASSWORD=your_secure_password
   heroku config:set ENVIRONMENT=production
   ```

3. Deploy to Heroku:
   ```
   git push heroku main
   ```

### Vercel Deployment

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Set up secrets:
   ```
   vercel secrets add anthropic-api-key your_anthropic_api_key
   vercel secrets add auth-username admin
   vercel secrets add auth-password your_secure_password
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```

## API Usage

### REST API

#### Chat Endpoint

```
POST /api/chat
```

Request body:
```json
{
  "message": "Your message to the agent",
  "session_id": "optional-session-id"
}
```

Response:
```json
{
  "message": "Agent's response",
  "session_id": "session-id"
}
```

### WebSocket API

Connect to the WebSocket endpoint:

```
ws://your-domain/ws/chat/{session_id}
```

Send messages as JSON:
```json
{
  "message": "Your message to the agent",
  "session_id": "optional-session-id"
}
```

Receive responses as JSON:
```json
{
  "type": "message",
  "content": "Agent's response",
  "session_id": "session-id"
}
```

## Architecture

The backend is built on FastAPI and uses the existing ReAct Agent implementation. Key components include:

- **Session Manager**: Handles user sessions and agent instances
- **Tool Manager**: Provides safety constraints for tools in hosted environments
- **Flow Factory**: Creates and manages agent flows
- **WebSocket Handler**: Enables real-time communication

## Security Considerations

- Basic authentication is implemented for API endpoints
- Tool safety layer restricts dangerous operations in production
- File access is limited to safe directories
- Environment variables are used for sensitive configuration

## License

[Include your license information here]
