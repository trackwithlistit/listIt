import sys
import os

# Add api directory to sys.path so app package and config are loaded directly
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app import create_app

# Create Flask app instance for Vercel Python runtime
flask_app = create_app('production')

class WSGIRoutingMiddleware:
    """
    Ensures incoming requests to Vercel serverless functions
    are properly routed whether PATH_INFO has the /api prefix or not.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        # If PATH_INFO is stripped by Vercel (e.g. /health or /auth/login),
        # prepend /api so Flask blueprints registered with /api/* match cleanly.
        if not path.startswith('/api'):
            environ['PATH_INFO'] = '/api' + ('' if path == '/' or not path else path)
        return self.wsgi_app(environ, start_response)

app = WSGIRoutingMiddleware(flask_app)
