# Technical Context: ReAct Agent Backend

## Core Technologies

### Backend Framework
- **FastAPI**: Modern, high-performance web framework for building APIs with Python
  - Asynchronous request handling
  - Automatic OpenAPI documentation
  - Type hints and validation via Pydantic
  - WebSocket support
  - Server-Sent Events (SSE) capabilities

### Language Model Integration
- **Anthropic Claude API**: Primary LLM for agent capabilities
  - Requires API key for authentication
  - Used for generating agent responses
  - Handles reasoning and planning capabilities

### Runtime Environment
- **Python 3.8+**: Core programming language
  - Asyncio for asynchronous operations
  - Type hints for improved code quality
  - Modern Python features utilized throughout

### Web Server
- **Uvicorn**: ASGI server for running FastAPI applications
  - High-performance async server
  - Supports WebSocket protocol
  - Development reload capabilities

## Development Setup

### Environment Management
- **Virtual Environment**: Isolated Python environment
  - Created via `venv` or `uv venv`
  - Activated before running the application
  - Contains all dependencies

### Configuration
- **Environment Variables**: Primary configuration method
  - `ANTHROPIC_API_KEY`: Required for LLM access
  - `AUTH_USERNAME`: Basic auth username
  - `AUTH_PASSWORD`: Basic auth password
  - `ENVIRONMENT`: Development or production mode
  - `HOST`: Server host (default: 0.0.0.0)
  - `PORT`: Server port (default: 8000)

- **.env File**: Alternative to environment variables
  - Same variables as above
  - Loaded automatically by the application
  - Not committed to version control

### Development Tools
- **Convenience Scripts**:
  - `run_server.bat` (Windows)
  - `run_server.sh` (macOS/Linux)
  - Handles environment setup and server startup

## Deployment Options

### Heroku Deployment
- **Procfile**: Defines process types
  - `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Config Variables**: Set via Heroku CLI
  - Same as environment variables above
- **Deployment**: Via Git push
  - `git push heroku main`

### Vercel Deployment
- **vercel.json**: Configuration for Vercel
  - Defines build settings and routes
  - Specifies environment variables
- **Secrets Management**: Via Vercel CLI
  - `vercel secrets add anthropic-api-key your_api_key`
- **Deployment**: Via Vercel CLI
  - `vercel`

## Dependencies

### Core Dependencies
- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **pydantic**: Data validation and settings management
- **anthropic**: Anthropic API client
- **python-dotenv**: Environment variable loading
- **websockets**: WebSocket protocol support

### Utility Dependencies
- **loguru**: Enhanced logging
- **uuid**: Unique identifier generation
- **asyncio**: Asynchronous I/O, event loop, tasks
- **typing**: Type hint support

### Security Dependencies
- **secrets**: Secure token comparison
- **httpx**: HTTP client for API requests

## Project Structure

### Root Level
- **main.py**: Application entry point
- **run_flow.py**: CLI for running flows directly
- **setup.py**: Package installation configuration
- **requirements.txt**: Dependency specifications
- **Procfile**: Heroku deployment configuration
- **vercel.json**: Vercel deployment configuration
- **run_server.bat/sh**: Convenience scripts

### App Package
- **app/**: Core application code
  - **__init__.py**: Package initialization
  - **config.py**: Configuration management
  - **exceptions.py**: Custom exceptions
  - **llm.py**: Language model integration
  - **logger.py**: Logging configuration
  - **schema.py**: Data models and schemas

### Agent Implementations
- **app/agent/**: Agent implementations
  - **base.py**: Abstract base agent
  - **manus.py**: Manus agent implementation
  - **planning.py**: Planning agent
  - **react.py**: ReAct pattern agent
  - **swe.py**: Software engineering agent
  - **toolcall.py**: Tool-focused agent

### Flow System
- **app/flow/**: Flow implementations
  - **base.py**: Abstract base flow
  - **flow_factory.py**: Flow creation factory
  - **planning.py**: Planning flow implementation

### Prompt Templates
- **app/prompt/**: Prompt templates
  - **manus.py**: Manus agent prompts
  - **planning.py**: Planning prompts
  - **swe.py**: Software engineering prompts
  - **toolcall.py**: Tool-related prompts

### Tool Implementations
- **app/tool/**: Tool implementations
  - **base.py**: Abstract base tool
  - **bash.py**: Bash command execution
  - **browser_use_tool.py**: Web browser interaction
  - **create_chat_completion.py**: LLM completion
  - **file_saver.py**: File operations
  - **google_search.py**: Web search
  - **planning.py**: Planning-specific tools
  - **python_execute.py**: Python code execution
  - **run.py**: Tool execution utilities
  - **str_replace_editor.py**: String replacement
  - **terminal.py**: Terminal interaction
  - **terminate.py**: Termination control
  - **tool_collection.py**: Tool management

### Web Interface
- **web/**: Web interface components
  - **tool_manager.py**: Tool safety management

### Static Assets
- **static/**: Web interface assets
  - **index.html**: Main web interface
  - **css/**: Stylesheets
  - **js/**: JavaScript files

## Technical Constraints

### API Rate Limits
- **Anthropic API**: Subject to rate limiting
  - Implemented exponential backoff
  - Graceful degradation on failures
  - Retry logic for transient errors

### Security Limitations
- **Basic Authentication**: Simple username/password
  - Not suitable for public-facing deployments without additional security
  - Intended for internal team use

### Tool Safety
- **Environment-Based Restrictions**:
  - Development: Fewer restrictions
  - Production: Stricter safety controls
  - File access limited to safe directories
  - Network access may be restricted

### Deployment Constraints
- **Stateless Design**: No persistent storage
  - Sessions stored in memory
  - Data lost on server restart
  - Not suitable for long-term persistence

### Performance Considerations
- **Asynchronous Design**: Non-blocking operations
  - Suitable for concurrent users
  - Limited by available server resources
  - LLM API calls are the primary bottleneck

## Integration Points

### Client Integration
- **REST API**: Standard HTTP endpoints
  - JSON request/response format
  - Authentication via HTTP Basic Auth
  - Documented in OpenAPI specification

- **WebSocket**: Real-time communication
  - JSON message format
  - Session-based connections
  - Streaming responses

- **Server-Sent Events**: One-way streaming
  - JSON event format
  - Real-time logs and updates
  - Compatible with standard EventSource

### External Services
- **Anthropic API**: Primary LLM provider
  - REST API integration
  - Authentication via API key
  - Rate limit considerations

- **Optional Integrations**:
  - Google Search API (if configured)
  - Other tool-specific external services
