import sys
import os

# Add api directory to sys.path so app package and config are loaded directly
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app import create_app

# Create Flask app instance for Vercel Python runtime
flask_app = create_app('production')

API_PREFIXES = ('/auth', '/user', '/lists', '/reviews', '/stats', '/search', '/notifications', '/admin', '/proxy', '/health')

class WSGIRoutingMiddleware:
    """
    Ensures incoming API requests to Vercel serverless functions
    are properly routed whether PATH_INFO has the /api prefix, is rewritten to index.py, or is stripped.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        
        # If Vercel rewrote /api/... to /api/index.py, recover original URI
        if 'index.py' in path or path in ('', '/'):
            forwarded = (
                environ.get('HTTP_X_FORWARDED_URI') or
                environ.get('HTTP_X_MATCHED_PATH') or
                environ.get('REQUEST_URI') or
                environ.get('RAW_URI') or
                ''
            )
            if forwarded:
                clean = forwarded.split('?')[0]
                if 'index.py' not in clean:
                    path = clean
                    environ['PATH_INFO'] = clean

        # Ensure API routes have the /api prefix Flask expects
        for prefix in API_PREFIXES:
            if path == prefix or path.startswith(prefix + '/'):
                environ['PATH_INFO'] = '/api' + path
                break

        return self.wsgi_app(environ, start_response)

app = WSGIRoutingMiddleware(flask_app)
