from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import uvicorn
import uuid
import asyncio
import os
import logging
import json
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
import secrets

# Import your existing components
from app.flow.flow_factory import FlowFactory
from app.flow.base import FlowType
from app.agent.manus import Manus
from app.logger import logger
from app.config import config
from web.tool_manager import ToolManager

# Create FastAPI app
app = FastAPI(title="ReAct Agent API")

# Startup event to initialize async tasks
@app.on_event("startup")
async def startup_event():
    # Start the session cleanup task
    session_manager.start_cleanup_task()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],  # Specific origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic authentication for internal team use
security = HTTPBasic()

# Environment variables for authentication (with defaults for development)
AUTH_USERNAME = os.getenv("AUTH_USERNAME", "admin")
AUTH_PASSWORD = os.getenv("AUTH_PASSWORD", "password")

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify HTTP Basic Auth credentials"""
    is_username_correct = secrets.compare_digest(credentials.username, AUTH_USERNAME)
    is_password_correct = secrets.compare_digest(credentials.password, AUTH_PASSWORD)
    
    if not (is_username_correct and is_password_correct):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Session management
# Initialize tool manager
environment = os.getenv("ENVIRONMENT", "production")
tool_manager = ToolManager(environment=environment)

class Session:
    def __init__(self, session_id: str, params: Dict[str, Any] = None):
        self.id = session_id
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.params = params or {}
        
        # Initialize agents
        self.agents = {
            "manus": Manus(),  # Your existing Manus agent
        }
        
        # Apply tool safety to agents
        for agent in self.agents.values():
            tool_manager.wrap_agent_tools(agent)
        
        # Create flow using your existing FlowFactory
        flow_type = FlowType.PLANNING
        
        self.flow = FlowFactory.create_flow(
            flow_type=flow_type,
            agents=self.agents,
            primary_agent_key="manus"
        )
        
        # Message history for the session
        self.messages = []

class SessionManager:
    def __init__(self, session_timeout_minutes: int = 30):
        self.sessions: Dict[str, Session] = {}
        self.lock = asyncio.Lock()
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
        self.cleanup_task = None
        
    def start_cleanup_task(self):
        """Start the background task for cleanup"""
        if self.cleanup_task is None:
            self.cleanup_task = asyncio.create_task(self._cleanup_inactive_sessions())
        
    async def get_or_create_session(self, session_id: Optional[str] = None, params: Dict[str, Any] = None) -> tuple[Session, str]:
        """Get an existing session or create a new one"""
        async with self.lock:
            if not session_id or session_id not in self.sessions:
                session_id = session_id or str(uuid.uuid4())
                self.sessions[session_id] = Session(session_id, params)
                logger.info(f"Created new session: {session_id}")
            
            # Update last activity time
            self.sessions[session_id].last_activity = datetime.now()
            return self.sessions[session_id], session_id
    
    async def _cleanup_inactive_sessions(self):
        """Periodically remove inactive sessions"""
        while True:
            await asyncio.sleep(300)  # Check every 5 minutes
            current_time = datetime.now()
            async with self.lock:
                expired_sessions = [
                    sid for sid, session in self.sessions.items()
                    if current_time - session.last_activity > self.session_timeout
                ]
                
                for sid in expired_sessions:
                    logger.info(f"Removing inactive session: {sid}")
                    del self.sessions[sid]

# Initialize session manager
session_manager = SessionManager()

# API models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    session_id: str

# Global dictionary to store SSE queues for each session
sse_queues = {}

# API endpoints
# Extended request model with session parameters
class ChatRequestWithParams(ChatRequest):
    params: Optional[Dict[str, Any]] = None

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequestWithParams):
    try:
        # Get or create session with parameters
        session, session_id = await session_manager.get_or_create_session(
            request.session_id, 
            request.params
        )
        
        # Log the incoming request
        logger.info(f"Received message in session {session_id}: {request.message}")
        
        # Create a queue for streaming logs and results if it doesn't exist
        if session_id not in sse_queues:
            sse_queues[session_id] = asyncio.Queue()
        
        # Add custom log handler to capture logs
        class SSELogHandler(logging.Handler):
            def __init__(self, sse_queue):
                super().__init__()
                self.sse_queue = sse_queue
                self.setFormatter(logging.Formatter('%(levelname)s - %(message)s'))
                
            def emit(self, record):
                try:
                    log_entry = self.format(record)
                    asyncio.create_task(self.sse_queue.put({
                        "type": "log",
                        "content": log_entry
                    }))
                except Exception:
                    self.handleError(record)
        
        log_handler = SSELogHandler(sse_queues[session_id])
        handler_id = logger.add(log_handler, level="INFO")
        
        # Send "thinking" status
        await sse_queues[session_id].put({
            "type": "status",
            "content": "thinking"
        })
        
        # Execute flow with user message
        logger.info(f"Processing message in session {session_id}")
        result = await session.flow.execute(request.message)
        
        # Log the result
        logger.info(f"Generated response in session {session_id}: {result[:100]}...")
        
        # Store messages in session history
        session.messages.append({"role": "user", "content": request.message})
        session.messages.append({"role": "assistant", "content": result})
        
        # Send final message to SSE queue
        await sse_queues[session_id].put({
            "type": "message",
            "content": result
        })
        
        # Create response
        response = ChatResponse(message=result, session_id=session_id)
        logger.info(f"Returning response for session {session_id}")
        
        # Remove log handler directly using the handler ID returned from logger.add()
        try:
            if handler_id is not None:
                logger.remove(handler_id)
            else:
                logger.warning("No handler ID available to remove")
        except Exception as e:
            logger.error(f"Error removing log handler: {str(e)}")
        
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

# Custom logger handler to capture logs for streaming
class WebSocketLogHandler(logging.Handler):
    def __init__(self, websocket_queue):
        super().__init__()
        self.websocket_queue = websocket_queue
        self.setFormatter(logging.Formatter('%(levelname)s - %(message)s'))
        
    def emit(self, record):
        try:
            log_entry = self.format(record)
            asyncio.create_task(self.websocket_queue.put({
                "type": "log",
                "content": log_entry
            }))
        except Exception:
            self.handleError(record)

# Server-Sent Events (SSE) endpoint for streaming logs
@app.get("/api/stream")
@app.get("/api/stream/{session_id}")
async def stream_logs(
    request: Request, 
    session_id: Optional[str] = None,
    auth: Optional[str] = None,
    t: Optional[str] = None  # Timestamp parameter (not used, just for cache busting)
):
    from fastapi.responses import StreamingResponse
    
    # Log the request
    logger.info(f"SSE connection request received. Session ID: {session_id}")
    logger.info(f"Request query params: {request.query_params}")
    
    # Check for auth in query params or headers
    authenticated = False
    
    # First check the auth query parameter
    if auth:
        try:
            # Decode Base64 auth parameter (username:password)
            import base64
            decoded_auth = base64.b64decode(auth).decode('utf-8')
            username, password = decoded_auth.split(':')
            
            # Verify credentials
            if username == AUTH_USERNAME and password == AUTH_PASSWORD:
                authenticated = True
                logger.info(f"SSE connection authenticated successfully via query param")
            else:
                logger.warning(f"Invalid SSE connection credentials via query param")
        except Exception as e:
            logger.error(f"Authentication error in SSE connection query param: {str(e)}")
    
    # If not authenticated, check Authorization header
    if not authenticated:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Basic '):
            try:
                import base64
                credentials = base64.b64decode(auth_header[6:]).decode('utf-8')
                username, password = credentials.split(':')
                
                if username == AUTH_USERNAME and password == AUTH_PASSWORD:
                    authenticated = True
                    logger.info(f"SSE connection authenticated successfully via header")
                else:
                    logger.warning(f"Invalid SSE connection credentials via header")
            except Exception as e:
                logger.error(f"Authentication error in SSE connection header: {str(e)}")
    
    # Return 401 if not authenticated
    if not authenticated:
        logger.warning("SSE connection not authenticated")
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Create params dictionary
    params = {}
    
    # Get or create session with parameters
    session, session_id = await session_manager.get_or_create_session(session_id, params)
    logger.info(f"Session created/retrieved: {session_id}")
    
    # Create a queue for streaming logs and results if it doesn't exist
    if session_id not in sse_queues:
        sse_queues[session_id] = asyncio.Queue()
        logger.info(f"Created new SSE queue for session: {session_id}")
    else:
        logger.info(f"Using existing SSE queue for session: {session_id}")
    
    # Get the queue for this session
    sse_queue = sse_queues[session_id]
    
    # Send initial connection message
    await sse_queue.put({
        "type": "connection_established",
        "session_id": session_id
    })
    logger.info(f"Sent connection_established message for session: {session_id}")
    
    # Send message history if available
    if session.messages:
        await sse_queue.put({
            "type": "history",
            "messages": session.messages
        })
        logger.info(f"Sent message history for session: {session_id}")
    
    async def event_generator():
        try:
            while True:
                # Wait for messages from the queue
                message = await sse_queue.get()
                
                # Format as SSE
                data = json.dumps(message)
                yield f"data: {data}\n\n"
                
                # Mark task as done
                sse_queue.task_done()
                
                # If this is a final message, break the loop
                if message.get("type") == "message":
                    break
                    
        except asyncio.CancelledError:
            logger.info(f"SSE stream cancelled for session {session_id}")
        except Exception as e:
            logger.error(f"Error in SSE stream: {str(e)}")
        finally:
            # Clean up
            if session_id in sse_queues:
                del sse_queues[session_id]
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# API endpoint for sending messages
@app.post("/api/stream-chat", response_model=ChatResponse)
async def stream_chat(request: ChatRequestWithParams, username: str = Depends(verify_credentials)):
    try:
        # Get or create session with parameters
        session, session_id = await session_manager.get_or_create_session(
            request.session_id,
            request.params
        )
        
        # Create a queue for streaming logs and results
        sse_queue = asyncio.Queue()
        
        # Add custom log handler to capture logs
        class SSELogHandler(logging.Handler):
            def __init__(self, sse_queue):
                super().__init__()
                self.sse_queue = sse_queue
                self.setFormatter(logging.Formatter('%(levelname)s - %(message)s'))
                
            def emit(self, record):
                try:
                    log_entry = self.format(record)
                    asyncio.create_task(self.sse_queue.put({
                        "type": "log",
                        "content": log_entry
                    }))
                except Exception:
                    self.handleError(record)
        
        # Create and add the log handler
        log_handler = SSELogHandler(sse_queue)
        handler_id = logger.add(log_handler, level="INFO")
        
        # Send "thinking" status
        await sse_queue.put({
            "type": "status",
            "content": "thinking"
        })
        
        # Update session messages
        session.messages.append({"role": "user", "content": request.message})
        
        # Execute flow with user message
        logger.info(f"Processing message in session {session_id}")
        result = await session.flow.execute(request.message)
        
        # Update session messages
        session.messages.append({"role": "assistant", "content": result})
        
        # Remove log handler - use the handler ID
        try:
            if handler_id is not None:
                logger.remove(handler_id)
            else:
                logger.warning("Could not find log handler to remove")
        except Exception as e:
            logger.error(f"Error removing log handler: {str(e)}")
        
        return ChatResponse(message=result, session_id=session_id)
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

# Create a directory for static files if it doesn't exist
os.makedirs("static", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Root endpoint to serve the chat interface
@app.get("/")
async def get_chat_interface():
    from fastapi.responses import FileResponse
    return FileResponse("static/index.html")

# Run the application
if __name__ == "__main__":
    import uvicorn
    
    # Get host/port from environment or use defaults
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    # Run FastAPI with uvicorn
    uvicorn.run(
        "main:app", 
        host=host, 
        port=port, 
        reload=os.getenv("ENVIRONMENT") == "development"
    )
