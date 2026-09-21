from flask import Flask
from flask_cors import CORS
from config import config
import os
import json
import uuid

from app.db import db_proxy

class DummyMongoProxy:
    """Fallback dummy mongo object for any legacy import references."""
    class DummyDB:
        def __getattr__(self, name):
            class DummyCollection:
                def __getattr__(self, subname):
                    return lambda *args, **kwargs: None
                def find(self, *args, **kwargs):
                    return []
                def find_one(self, *args, **kwargs):
                    return None
                def count_documents(self, *args, **kwargs):
                    return 0
                def update_one(self, *args, **kwargs):
                    return None
                def update_many(self, *args, **kwargs):
                    return None
                def insert_one(self, *args, **kwargs):
                    class DummyResult:
                        inserted_id = "000000000000000000000000"
                    return DummyResult()
                def delete_one(self, *args, **kwargs):
                    return None
                def delete_many(self, *args, **kwargs):
                    return None
            return DummyCollection()

    def __init__(self):
        self.db = self.DummyDB()

    def init_app(self, app):
        pass

mongo = DummyMongoProxy()

def auto_seed_db(app):
    try:
        # Seed Supabase DB if empty
        if db_proxy._is_active:
            users_count = db_proxy.count_users()
            if users_count == 0:
                print("[Auto-Seed Supabase] Seeding default demo data into Supabase...")
                db_path = os.path.join(app.config.get('UPLOAD_FOLDER', 'uploads'), 'database.json')
                if os.path.exists(db_path):
                    with open(db_path, 'r') as f:
                        data = json.load(f)
                    
                    demo_user = data.get('users', [])[0] if data.get('users') else None
                    if demo_user:
                        user_id = "6a6a6526-134b-6193-9979-062500000000"
                        user_payload = {
                            "id": user_id,
                            "email": demo_user.get("email", "demo@listit.com"),
                            "username": demo_user.get("username", "demo_user"),
                            "password_hash": demo_user.get("password_hash"),
                            "avatar_url": demo_user.get("avatar_url"),
                            "banner_url": demo_user.get("banner_url"),
                            "bio": demo_user.get("bio", ""),
                            "role": demo_user.get("role", "user"),
                            "favorite_genres": demo_user.get("favorite_genres", []),
                            "badges": demo_user.get("badges", ["early_adopter"]),
                            "settings": demo_user.get("settings", {"theme": "dark", "is_profile_public": True})
                        }
                        db_proxy.create_user(user_payload)
                        print("[Auto-Seed Supabase] Created demo user account in Supabase.")
                        
                        entries = data.get('anime_list_entries', [])
                        for entry in entries:
                            entry_payload = {
                                "id": str(uuid.uuid4()),
                                "user_id": user_id,
                                "anilist_id": entry.get("anilist_id"),
                                "title": entry.get("title"),
                                "media_type": entry.get("media_type", "anime"),
                                "status": entry.get("status", "completed"),
                                "score": entry.get("score", 0),
                                "progress": entry.get("progress", 0),
                                "rewatch_count": entry.get("rewatch_count", 0),
                                "notes": entry.get("notes", ""),
                                "is_favorite": entry.get("is_favorite", False),
                                "genres": entry.get("genres", [])
                            }
                            db_proxy.upsert_entry(entry_payload)
                        print(f"[Auto-Seed Supabase] Seeded {len(entries)} watchlist entries into Supabase.")
    except Exception as e:
        print(f"[Auto-Seed] Warning: Could not auto-seed database: {e}")

def create_app(config_name=None):
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Init extensions
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}},
         supports_credentials=True)
    mongo.init_app(app)
    db_proxy.init_app(app)
    auto_seed_db(app)

    # Create upload folder
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)

    # Register blueprints
    from app.routes.auth          import auth_bp
    from app.routes.user          import user_bp
    from app.routes.lists         import lists_bp
    from app.routes.reviews       import reviews_bp
    from app.routes.stats         import stats_bp
    from app.routes.search        import search_bp
    from app.routes.notifications import notif_bp
    from app.routes.admin         import admin_bp
    from app.routes.proxy         import proxy_bp

    app.register_blueprint(auth_bp,    url_prefix='/api/auth')
    app.register_blueprint(user_bp,    url_prefix='/api/user')
    app.register_blueprint(lists_bp,   url_prefix='/api/lists')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(stats_bp,   url_prefix='/api/stats')
    app.register_blueprint(search_bp,  url_prefix='/api/search')
    app.register_blueprint(notif_bp,   url_prefix='/api/notifications')
    app.register_blueprint(admin_bp,   url_prefix='/api/admin')
    app.register_blueprint(proxy_bp,   url_prefix='/api/proxy')

    @app.route('/api')
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'service': 'ListIt API', 'version': '1.0.0'}

    # Locate frontend static dist folder
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    frontend_dist = os.path.join(root_dir, 'frontend', 'dist')
    if not os.path.exists(frontend_dist):
        frontend_dist = os.path.join(root_dir, 'dist')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend_spa(path):
        if path.startswith('api/') or path == 'api':
            return {'error': 'API endpoint not found', 'path': path}, 404
        file_path = os.path.join(frontend_dist, path)
        if path and os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(frontend_dist, path)
        index_file = os.path.join(frontend_dist, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(frontend_dist, 'index.html')
        return {'status': 'ok', 'service': 'ListIt API', 'version': '1.0.0'}

    return app
