from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, ClassVar
import json

from pydantic import Field

from app.agent.base import BaseAgent
from app.llm import LLM
from app.schema import AgentState, Memory
from app.logger import logger
from app.agent.context_tracker import ReasoningContext, ThinkingStep
from app.agent.thinking_categories import ThinkingCategory


class ReActAgent(BaseAgent, ABC):
    name: str
    description: Optional[str] = None

    system_prompt: Optional[str] = None
    next_step_prompt: Optional[str] = None

    llm: Optional[LLM] = Field(default_factory=LLM)
    memory: Memory = Field(default_factory=Memory)
    state: AgentState = AgentState.IDLE

    max_steps: int = 10
    current_step: int = 0
    
    # New fields for enhanced thinking
    thinking_steps: List[ThinkingStep] = Field(default_factory=list)
    reasoning_context: ReasoningContext = Field(default_factory=ReasoningContext)
    
    # Category prefixes for consistent logging
    category_prefixes: ClassVar[Dict[str, str]] = {
        ThinkingCategory.THINKING.value: "✨ Thinking:",
        ThinkingCategory.PLANNING.value: "🛠️ Planning:",
        ThinkingCategory.SEARCH.value: "🔍 Search:",
        ThinkingCategory.DECISION.value: "⚖️ Decision:",
        ThinkingCategory.TOOL_USE.value: "🧰 Tool:",
        ThinkingCategory.TOOL_RESULT.value: "🎯 Result:",
        ThinkingCategory.ERROR.value: "❌ Error:"
    }
    
    def log_thinking(self, category: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> ThinkingStep:
        """
        Log a thinking step with proper formatting
        
        Args:
            category: The type of thinking (Thinking, Planning, Search, Decision, Tool Use, etc.)
            content: The content of the thinking step
            metadata: Optional metadata for the step
            
        Returns:
            ThinkingStep: The created thinking step object
        """
        # Create a thinking step
        step = ThinkingStep(category, content, metadata)
        
        # Add to our steps list
        self.thinking_steps.append(step)
        
        # Get the prefix for this category
        prefix = self.category_prefixes.get(category, "💡")
        
        # Create a structured log entry with metadata
        log_entry = {
            "type": "thinking_step",
            "step_id": step.id,
            "category": category,
            "content": content,
            "timestamp": step.timestamp,
            "metadata": step.metadata
        }
        
        # Log with the appropriate prefix and structured data
        # The frontend will parse this format
        logger.info(f"{prefix} {json.dumps(log_entry)}")
        
        # Return the step for reference
        return step
    
    def get_previous_step(self, step_back: int = 1) -> Optional[ThinkingStep]:
        """Get a previous thinking step"""
        if len(self.thinking_steps) >= step_back:
            return self.thinking_steps[-step_back]
        return None
    
    @abstractmethod
    async def think(self) -> bool:
        """
        Process current state and decide next action.
        
        To be implemented by subclasses using the log_thinking method
        to document thinking steps.
        
        Returns:
            bool: True if action is needed, False otherwise
        """
        pass

    @abstractmethod
    async def act(self) -> str:
        """
        Execute decided actions.
        
        To be implemented by subclasses, documenting action and results
        using the log_thinking method.
        
        Returns:
            str: Result of the action
        """
        pass

    async def step(self) -> str:
        """Execute a single step: think and act."""
        
        # Reset step-specific context
        self.reasoning_context = ReasoningContext()
        
        # Log step beginning
        step_metadata = {
            "step_number": self.current_step + 1,
            "max_steps": self.max_steps,
            "agent_name": self.name
        }
        
        self.log_thinking(
            ThinkingCategory.PLANNING.value, 
            f"Starting step {self.current_step + 1}/{self.max_steps}",
            step_metadata
        )
        
        # Execute thinking
        should_act = await self.think()
        
        # Log decision
        if should_act:
            self.log_thinking(
                ThinkingCategory.DECISION.value,
                "Decided to take action based on thinking",
                {"action_required": True}
            )
            # Execute action
            result = await self.act()
            
            # Log result summary
            self.log_thinking(
                ThinkingCategory.TOOL_RESULT.value,
                f"Action completed with result: {result[:100]}{'...' if len(result) > 100 else ''}",
                {"result_length": len(result)}
            )
            
            return result
        else:
            self.log_thinking(
                ThinkingCategory.DECISION.value,
                "Thinking complete - no action needed",
                {"action_required": False}
            )
            return "Thinking complete - no action needed"
