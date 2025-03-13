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
   
   Using pip:
   ```
   pip install -r requirements.txt
   ```
   
   Using uv (recommended):
   ```
   # Install uv if you don't have it
   curl -sSf https://install.ultraviolet.rs | sh
   
   # Create and activate a virtual environment
   uv venv
   # On Windows
   .venv\Scripts\activate
   # On Unix
   source .venv/bin/activate
   
   # Install dependencies
   uv pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```
   # For development
   export ANTHROPIC_API_KEY=your_anthropic_api_key
   export AUTH_USERNAME=admin
   export AUTH_PASSWORD=your_secure_password
   export ENVIRONMENT=development
   ```

### Running Locally

Run the development server:

```
uvicorn main:app --reload
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
