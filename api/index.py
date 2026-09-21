import sys
import os

# Add api directory to sys.path so app package and config are loaded directly
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app import create_app

# Create Flask app instance - this is the Vercel serverless WSGI handler
# Vercel routes /api/* here with correct PATH_INFO preserved (/api/auth/login, etc.)
app = create_app('production')
