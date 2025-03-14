from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import uuid


class ReasoningContext:
    """
    Manages context for reasoning processes, tracking related thinking steps
    and maintaining state between steps
    """
    
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now().isoformat()
        self.context_data: Dict[str, Any] = {}
        self.step_references: Dict[str, List[Dict[str, str]]] = {}
        self.step_dependencies: Dict[str, List[str]] = {}
        
    def add_context(self, key: str, value: Any) -> None:
        """Add or update context data"""
        self.context_data[key] = value
        
    def get_context(self, key: str, default: Any = None) -> Any:
        """Get context data by key"""
        return self.context_data.get(key, default)
        
    def link_steps(self, step_id: str, related_step_id: str, relation_type: str = "related_to") -> None:
        """Link two steps with a relationship"""
        if relation_type not in self.step_references:
            self.step_references[relation_type] = []
            
        self.step_references[relation_type].append({
            "from_step": step_id,
            "to_step": related_step_id
        })
        
    def add_dependency(self, step_id: str, depends_on_step_id: str) -> None:
        """Add a dependency between steps"""
        if step_id not in self.step_dependencies:
            self.step_dependencies[step_id] = []
            
        self.step_dependencies[step_id].append(depends_on_step_id)
        
    def get_dependencies(self, step_id: str) -> List[str]:
        """Get dependencies for a step"""
        return self.step_dependencies.get(step_id, [])
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "id": self.id,
            "created_at": self.created_at,
            "context_data": self.context_data,
            "step_references": self.step_references,
            "step_dependencies": self.step_dependencies
        }
        
    def __str__(self) -> str:
        """String representation"""
        return f"ReasoningContext(id={self.id}, keys={list(self.context_data.keys())})"


class ThinkingStep:
    """Represents a single step in the thinking process"""
    
    def __init__(self, category: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        self.id = str(uuid.uuid4())[:8]  # Shorter UUID for readability
        self.timestamp = datetime.now().isoformat()
        self.category = category
        self.content = content
        self.metadata = metadata or {}
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert step to dictionary for serialization"""
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "category": self.category,
            "content": self.content,
            "metadata": self.metadata
        }
        
    def __str__(self) -> str:
        """String representation for logging"""
        return f"[{self.category}] {self.content}"
