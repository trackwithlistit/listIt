import os
import json
import uuid
import datetime
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://beotztkcsrmfhzeshnrg.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_4r7Ia6ucZ5BmCQmwOAY-Qw_74GcXZP6")

def format_datetime(val):
    if isinstance(val, datetime.datetime):
        return val.isoformat()
    if isinstance(val, str):
        return val
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def migrate():
    print("[Migration] Connecting to Supabase...")
    sb_client = create_client(SUPABASE_URL, SUPABASE_KEY)

    db_path = os.path.join('uploads', 'database.json')
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found!")
        return

    with open(db_path, 'r') as f:
        data = json.load(f)

    # 1. MIGRATE USERS
    print("\n--- Migrating Users ---")
    users = data.get('users', [])
    print(f"Found {len(users)} users in database.json.")
    
    for u in users:
        sb_uuid = u.get('id') or "6a6a6526-134b-6193-9979-062500000000"
        email = u.get('email', "demo@listit.com").strip().lower()
        username = u.get('username', "demo_user").strip()
        
        payload = {
            "id": sb_uuid,
            "email": email,
            "username": username,
            "password_hash": u.get('password_hash'),
            "avatar_url": u.get('avatar_url'),
            "banner_url": u.get('banner_url'),
            "bio": u.get('bio', ''),
            "role": u.get('role', 'user'),
            "is_verified": u.get('is_verified', True),
            "favorite_genres": u.get('favorite_genres', []),
            "followers": u.get('followers', []),
            "following": u.get('following', []),
            "achievements": u.get('achievements', []),
            "badges": u.get('badges', ["early_adopter"]),
            "watch_streak": u.get('watch_streak', 0),
            "last_active": format_datetime(u.get('last_active')),
            "settings": u.get('settings', {"theme": "dark", "is_profile_public": True}),
            "created_at": format_datetime(u.get('created_at'))
        }
        
        try:
            sb_client.table("users").upsert(payload, on_conflict="email").execute()
            print(f"  [Users] Migrated: {username} ({email}) -> {sb_uuid}")
        except Exception as e:
            print(f"  [Users Error] Failed for {username}: {e}")

    # 2. MIGRATE ANIME LIST ENTRIES
    print("\n--- Migrating Anime List Entries ---")
    anime_entries = data.get('anime_list_entries', [])
    print(f"Found {len(anime_entries)} anime entries.")
    
    for e in anime_entries:
        sb_uid = "6a6a6526-134b-6193-9979-062500000000"
        anilist_id = e.get('anilist_id') or e.get('media_id') or 1
        payload = {
            "id": str(uuid.uuid4()),
            "user_id": sb_uid,
            "anilist_id": int(anilist_id),
            "title": e.get('title', 'Unknown Title'),
            "media_type": e.get('media_type', 'anime'),
            "status": e.get('status', 'plan_to_watch'),
            "score": float(e.get('score', 0)),
            "progress": int(e.get('progress', 0)),
            "rewatch_count": int(e.get('rewatch_count', 0)),
            "notes": e.get('notes', ''),
            "is_favorite": bool(e.get('is_favorite', False)),
            "is_private": bool(e.get('is_private', False)),
            "priority": e.get('priority', 'medium'),
            "tags": e.get('tags', []),
            "genres": e.get('genres', []),
            "updated_at": format_datetime(e.get('updated_at')),
            "created_at": format_datetime(e.get('created_at'))
        }
        try:
            sb_client.table("anime_list_entries").upsert(payload, on_conflict="user_id,anilist_id,media_type").execute()
            print(f"  [Anime Entry] Migrated: '{payload['title']}' for user {sb_uid}")
        except Exception as err:
            print(f"  [Anime Entry Error] '{e.get('title')}': {err}")

    print("\n==========================================")
    print("MIGRATION COMPLETE! All data is stored in Supabase PostgreSQL!")
    print("==========================================")

if __name__ == "__main__":
    migrate()
