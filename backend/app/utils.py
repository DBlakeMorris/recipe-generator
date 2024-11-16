from pathlib import Path

def setup_directories():
    """Create necessary directories if they don't exist"""
    COMPONENT_DIR = Path("frontend/components")
    COMPONENT_DIR.mkdir(parents=True, exist_ok=True)
    return COMPONENT_DIR

def format_recipe_content(content: str) -> str:
    """Format recipe content with special styling"""
    # Add any formatting functions here if needed
    pass