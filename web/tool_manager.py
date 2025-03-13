from typing import List, Optional
import os
from pathlib import Path

from app.tool.base import BaseTool
from app.tool import ToolCollection
from app.logger import logger


class ToolManager:
    """
    Manages tools with safety constraints for hosted environments.
    
    This class provides a layer of security for tools that might have
    dangerous capabilities in a hosted environment, such as executing
    system commands or accessing the file system.
    """
    
    def __init__(self, environment: str = "production"):
        """
        Initialize the tool manager.
        
        Args:
            environment: The environment to run in ("production", "development", "testing")
        """
        self.environment = environment.lower()
        logger.info(f"Initializing ToolManager in {self.environment} environment")
        
    def get_allowed_tools(self) -> ToolCollection:
        """
        Return tools allowed in the current environment.
        
        Returns:
            ToolCollection: A collection of tools that are safe to use in the current environment
        """
        from app.tool import (
            PlanningTool, CreateChatCompletion, Terminate,
            StrReplaceEditor, GoogleSearch
        )
        
        # Safe tools for any environment 
        safe_tools = [
            PlanningTool(),
            CreateChatCompletion(),
            GoogleSearch(),
            Terminate()
        ]
        
        # Add file editor with restricted paths
        editor = StrReplaceEditor()
        safe_tools.append(editor)
        
        # Development environments can have more powerful tools
        if self.environment == "development":
            from app.tool import Bash, Terminal
            # Only add these in development environments
            safe_tools.extend([
                Bash(),  
                Terminal(),
            ])
            
        return ToolCollection(*safe_tools)
    
    def wrap_agent_tools(self, agent) -> None:
        """
        Replace an agent's tools with safe versions.
        
        Args:
            agent: The agent instance to modify
        """
        if hasattr(agent, 'tools'):
            logger.info(f"Wrapping tools for agent: {agent.name}")
            agent.tools = self.get_allowed_tools()
            
    def is_safe_path(self, path: str) -> bool:
        """
        Check if a file path is safe to access.
        
        Args:
            path: The path to check
            
        Returns:
            bool: True if the path is safe, False otherwise
        """
        # Convert to absolute path
        abs_path = Path(path).resolve()
        
        # Define safe directories
        safe_dirs = [
            Path(os.getenv("WORKSPACE_DIR", "./workspace")).resolve(),
            Path("./static").resolve(),
            Path("./output").resolve(),
        ]
        
        # Check if path is within any safe directory
        return any(str(abs_path).startswith(str(safe_dir)) for safe_dir in safe_dirs)
