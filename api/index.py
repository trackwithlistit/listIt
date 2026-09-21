import sys
import os
import traceback

# Add all possible backend paths
candidate_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')),
    os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')),
    os.path.abspath(os.path.join(os.getcwd(), 'backend')),
    os.path.abspath(os.getcwd()),
]

for p in candidate_paths:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

try:
    from app import create_app
    app = create_app('production')
except Exception as e:
    from flask import Flask, jsonify
    app = Flask(__name__)
    err_title = str(e)
    err_trace = traceback.format_exc()

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def error_handler(path):
        return jsonify({
            "error": "Backend Serverless Boot Error",
            "message": err_title,
            "traceback": err_trace,
            "sys_path": sys.path,
            "cwd": os.getcwd()
        }), 500
