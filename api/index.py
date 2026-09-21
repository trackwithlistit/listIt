import sys
import os

# Add api directory to sys.path so app package and config are loaded directly
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app import create_app

# Create Flask app instance for Vercel Python runtime
app = create_app('production')
