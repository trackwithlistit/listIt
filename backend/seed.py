import os
import json
import uuid
import datetime
from dotenv import dotenv_values
from supabase import create_client

def seed():
    env = dotenv_values('.env')
    url = env.get('SUPABASE_URL') or os.environ.get('SUPABASE_URL', "https://beotztkcsrmfhzeshnrg.supabase.co")
    key = env.get('SUPABASE_KEY') or os.environ.get('SUPABASE_KEY', "sb_publishable_4r7Ia6ucZ5BmCQmwOAY-Qw_74GcXZP6")

    print(f"[Seed Supabase] Connecting to Supabase at {url}...")
    sb_client = create_client(url, key)

    db_file = os.path.join(os.path.dirname(__file__), 'uploads', 'database.json')
    if not os.path.exists(db_file):
        db_file = os.path.join('uploads', 'database.json')
    if not os.path.exists(db_file):
        print(f"Error: {db_file} not found!")
        return

    with open(db_file, 'r') as f:
        data = json.load(f)

    # 1. Seed Users
    users = data.get('users', [])
    print(f"\n[Seed Supabase] Seeding {len(users)} users...")
    demo_user_id = "6a6a6526-134b-6193-9979-062500000000"
    import bcrypt
    demo_pw_hash = bcrypt.hashpw(b"demo", bcrypt.gensalt()).decode()
    for u in users:
        payload = {
            "id": demo_user_id,
            "email": u.get("email", "demo@listit.com").strip().lower(),
            "username": u.get("username", "demo_user").strip(),
            "password_hash": demo_pw_hash,
            "avatar_url": u.get("avatar_url"),
            "banner_url": u.get("banner_url"),
            "bio": u.get("bio", ""),
            "role": u.get("role", "user"),
            "is_verified": u.get("is_verified", True),
            "favorite_genres": u.get("favorite_genres", []),
            "badges": u.get("badges", ["early_adopter"]),
            "settings": u.get("settings", {"theme": "dark", "is_profile_public": True})
        }
        try:
            sb_client.table("users").upsert(payload, on_conflict="email").execute()
            print(f"  Successfully seeded user: {payload['username']} ({payload['email']})")
        except Exception as e:
            print(f"  User Seed Warning: {e}")

    # 2. Seed Anime & Series List Entries
    entries = data.get('anime_list_entries', [])
    print(f"\n[Seed Supabase] Seeding {len(entries)} watchlist entries...")
    for entry in entries:
        payload = {
            "id": str(uuid.uuid4()),
            "user_id": demo_user_id,
            "anilist_id": int(entry.get("anilist_id", 1)),
            "title": entry.get("title", "Unknown Title"),
            "media_type": entry.get("media_type", "anime"),
            "status": entry.get("status", "completed"),
            "score": float(entry.get("score", 0)),
            "progress": int(entry.get("progress", 0)),
            "rewatch_count": int(entry.get("rewatch_count", 0)),
            "notes": entry.get("notes", ""),
            "is_favorite": bool(entry.get("is_favorite", False)),
            "genres": entry.get("genres", [])
        }
        try:
            sb_client.table("anime_list_entries").upsert(payload, on_conflict="user_id,anilist_id,media_type").execute()
            print(f"  Successfully seeded entry: '{payload['title']}' ({payload['media_type']})")
        except Exception as e:
            print(f"  Entry Seed Warning: {e}")

    print("\n[Seed Supabase] Supabase PostgreSQL database seeding completed successfully!")

if __name__ == '__main__':
    seed()
