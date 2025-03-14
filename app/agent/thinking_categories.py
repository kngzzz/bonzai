from enum import Enum
from typing import Dict, Any, Optional, List


class ThinkingCategory(str, Enum):
    """Standard categories for thinking steps"""
    
    THINKING = "Thinking"
    PLANNING = "Planning"
    SEARCH = "Search"
    DECISION = "Decision"
    TOOL_USE = "Tool Use"
    TOOL_RESULT = "Tool Result"
    ERROR = "Error"
    
    @classmethod
    def get_all_categories(cls) -> List[str]:
        """Get a list of all category values"""
        return [category.value for category in cls]
    
    @classmethod
    def get_category_metadata(cls, category: str) -> Dict[str, Any]:
        """Get metadata for a specific category"""
        category_metadata = {
            cls.THINKING.value: {
                "icon": "✨",
                "description": "Initial analysis and reasoning",
                "color": "purple",
                "style": {
                    "bg": "#f5f3ff",
                    "border": "#ddd6fe",
                    "icon": "#8b5cf6"
                }
            },
            cls.PLANNING.value: {
                "icon": "🛠️",
                "description": "Determining approach and needed steps",
                "color": "amber",
                "style": {
                    "bg": "#fff7ed",
                    "border": "#fed7aa",
                    "icon": "#f59e0b"
                }
            },
            cls.SEARCH.value: {
                "icon": "🔍",
                "description": "Seeking relevant information",
                "color": "blue",
                "style": {
                    "bg": "#eff6ff",
                    "border": "#bfdbfe",
                    "icon": "#3b82f6"
                }
            },
            cls.DECISION.value: {
                "icon": "⚖️",
                "description": "Evaluating options and making choices",
                "color": "purple",
                "style": {
                    "bg": "#f5f3ff",
                    "border": "#e9d5ff",
                    "icon": "#8b5cf6"
                }
            },
            cls.TOOL_USE.value: {
                "icon": "🧰",
                "description": "Using tools to accomplish tasks",
                "color": "green",
                "style": {
                    "bg": "#ecfdf5",
                    "border": "#a7f3d0",
                    "icon": "#10b981"
                }
            },
            cls.TOOL_RESULT.value: {
                "icon": "🎯",
                "description": "Results from tool execution",
                "color": "green",
                "style": {
                    "bg": "#ecfdf5",
                    "border": "#a7f3d0",
                    "icon": "#10b981"
                }
            },
            cls.ERROR.value: {
                "icon": "❌",
                "description": "Errors and failure handling",
                "color": "red",
                "style": {
                    "bg": "#fef2f2",
                    "border": "#fecaca",
                    "icon": "#ef4444"
                }
            }
        }
        
        return category_metadata.get(category, {})
    
    @classmethod
    def format_content(cls, category: str, content: str) -> str:
        """Format content with appropriate prefix for a category"""
        metadata = cls.get_category_metadata(category)
        prefix = metadata.get("icon", "💡")
        return f"{prefix} {content}"


# Helper functions
def get_thinking_category_style(category: str) -> Dict[str, str]:
    """Get frontend styling information for a category"""
    metadata = ThinkingCategory.get_category_metadata(category)
    return metadata.get("style", {})

def get_category_icon(category: str) -> str:
    """Get the icon for a category"""
    metadata = ThinkingCategory.get_category_metadata(category)
    return metadata.get("icon", "💡")
