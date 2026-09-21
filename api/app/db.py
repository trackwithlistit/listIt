import os
import json
import uuid
import datetime
from supabase import create_client

class SupabaseDatabaseProxy:
    def __init__(self):
        self.client = None
        self._is_active = False
        self._cache = {}

    def _get_cache(self, key, ttl_seconds=5):
        if key in self._cache:
            val, timestamp = self._cache[key]
            if (datetime.datetime.now(datetime.timezone.utc) - timestamp).total_seconds() < ttl_seconds:
                return val
        return None

    def _set_cache(self, key, val):
        self._cache[key] = (val, datetime.datetime.now(datetime.timezone.utc))

    def _invalidate_cache(self):
        self._cache.clear()

    def init_app(self, app):
        url = app.config.get('SUPABASE_URL') or os.environ.get('SUPABASE_URL')
        key = app.config.get('SUPABASE_KEY') or os.environ.get('SUPABASE_KEY')

        if url and key:
            try:
                self.client = create_client(url, key)
                self._is_active = True
                print("[Supabase DB] Connected to Supabase PostgreSQL database successfully.")
            except Exception as e:
                print(f"[Supabase DB Error] Connection failed: {e}")
                self._is_active = False
        else:
            print("[Supabase DB Warning] Missing SUPABASE_URL or SUPABASE_KEY.")
            self._is_active = False

    # ── USERS ──
    def find_user_by_id(self, user_id):
        if not self._is_active or not user_id:
            return None
        cache_key = f"user_id_{user_id}"
        cached = self._get_cache(cache_key, ttl_seconds=10)
        if cached is not None:
            return cached
        try:
            res = self.client.table("users").select("*").eq("id", str(user_id)).execute()
            user = res.data[0] if res.data else None
            if user:
                self._set_cache(cache_key, user)
            return user
        except Exception as e:
            print(f"[Supabase DB Error] find_user_by_id: {e}")
            return None

    def find_user_by_email(self, email):
        if not self._is_active or not email:
            return None
        clean_email = email.strip().lower()
        cache_key = f"user_email_{clean_email}"
        cached = self._get_cache(cache_key, ttl_seconds=10)
        if cached is not None:
            return cached
        try:
            res = self.client.table("users").select("*").eq("email", clean_email).execute()
            user = res.data[0] if res.data else None
            if user:
                self._set_cache(cache_key, user)
            return user
        except Exception as e:
            print(f"[Supabase DB Error] find_user_by_email: {e}")
            return None

    def find_user_by_username(self, username):
        if not self._is_active or not username:
            return None
        clean_uname = username.strip()
        cache_key = f"user_uname_{clean_uname}"
        cached = self._get_cache(cache_key, ttl_seconds=10)
        if cached is not None:
            return cached
        try:
            res = self.client.table("users").select("*").eq("username", clean_uname).execute()
            user = res.data[0] if res.data else None
            if user:
                self._set_cache(cache_key, user)
            return user
        except Exception as e:
            print(f"[Supabase DB Error] find_user_by_username: {e}")
            return None

    def create_user(self, user_data):
        if not self._is_active:
            return None
        self._invalidate_cache()
        try:
            if 'id' not in user_data:
                user_data['id'] = str(uuid.uuid4())
            user_data['email'] = user_data['email'].strip().lower()
            res = self.client.table("users").insert(user_data).execute()
            return res.data[0] if res.data else user_data
        except Exception as e:
            print(f"[Supabase DB Error] create_user: {e}")
            return None

    def update_user(self, user_id, update_data):
        if not self._is_active or not user_id:
            return None
        self._invalidate_cache()
        try:
            allowed_cols = {
                'id', 'email', 'username', 'password_hash', 'avatar_url', 'banner_url',
                'bio', 'role', 'is_verified', 'favorite_genres', 'favorite_character',
                'favorite_studio', 'followers', 'following', 'achievements', 'badges',
                'watch_streak', 'last_active', 'settings', 'refresh_tokens', 'created_at'
            }
            payload = {k: v for k, v in update_data.items() if k in allowed_cols}
            if 'last_active' not in payload:
                payload['last_active'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            res = self.client.table("users").update(payload).eq("id", str(user_id)).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return self.find_user_by_id(user_id)
        except Exception as e:
            print(f"[Supabase DB Error] update_user: {e}")
            return self.find_user_by_id(user_id)

    def count_users(self):
        if not self._is_active:
            return 0
        try:
            res = self.client.table("users").select("id", count="exact").execute()
            return res.count if res.count is not None else len(res.data)
        except Exception as e:
            print(f"[Supabase DB Error] count_users: {e}")
            return 0

    def get_all_users(self):
        if not self._is_active:
            return []
        try:
            res = self.client.table("users").select("*").execute()
            return res.data
        except Exception as e:
            print(f"[Supabase DB Error] get_all_users: {e}")
            return []

    # ── ANIME LIST ENTRIES ──
    def get_user_entries(self, user_id, status=None, media_type=None):
        if not self._is_active or not user_id:
            return []
        cache_key = f"entries_{user_id}_{status}_{media_type}"
        cached = self._get_cache(cache_key, ttl_seconds=5)
        if cached is not None:
            return cached
        try:
            query = self.client.table("anime_list_entries").select("*").eq("user_id", str(user_id))
            if status:
                query = query.eq("status", status)
            if media_type:
                query = query.eq("media_type", media_type)
            res = query.execute()
            result = res.data or []
            self._set_cache(cache_key, result)
            return result
        except Exception as e:
            print(f"[Supabase DB Error] get_user_entries: {e}")
            return []

    def find_entry(self, user_id, anilist_id, media_type='anime'):
        if not self._is_active or not user_id:
            return None
        try:
            res = self.client.table("anime_list_entries").select("*") \
                .eq("user_id", str(user_id)) \
                .eq("anilist_id", int(anilist_id)) \
                .eq("media_type", media_type).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"[Supabase DB Error] find_entry: {e}")
            return None

    def upsert_entry(self, entry_data):
        if not self._is_active:
            return None
        self._invalidate_cache()
        try:
            allowed_cols = {
                'id', 'user_id', 'anilist_id', 'title', 'media_type', 'status', 
                'score', 'progress', 'rewatch_count', 'notes', 'is_favorite', 
                'is_private', 'priority', 'tags', 'genres', 'updated_at', 'created_at'
            }
            payload = {k: v for k, v in entry_data.items() if k in allowed_cols}
            if 'id' not in payload or not payload['id']:
                payload['id'] = str(uuid.uuid4())
            payload['updated_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            res = self.client.table("anime_list_entries").upsert(payload, on_conflict="user_id,anilist_id,media_type").execute()
            return res.data[0] if (res.data and len(res.data) > 0) else payload
        except Exception as e:
            print(f"[Supabase DB Error] upsert_entry: {e}")
            return None

    def delete_entry(self, user_id, entry_id_or_anilist_id, media_type='anime'):
        if not self._is_active or not user_id:
            return False
        self._invalidate_cache()
        try:
            target_str = str(entry_id_or_anilist_id).strip()
            # 1. If it's a valid UUID, delete by primary key 'id'
            is_uuid = False
            try:
                uuid.UUID(target_str)
                is_uuid = True
            except (ValueError, AttributeError, TypeError):
                is_uuid = False

            if is_uuid:
                res = self.client.table("anime_list_entries").delete() \
                    .eq("user_id", str(user_id)) \
                    .eq("id", target_str).execute()
                if res.data and len(res.data) > 0:
                    return True

            # 2. Try deleting by numeric anilist_id / tvmaze_id
            try:
                numeric_id = int(target_str)
                res2 = self.client.table("anime_list_entries").delete() \
                    .eq("user_id", str(user_id)) \
                    .eq("anilist_id", numeric_id) \
                    .eq("media_type", media_type).execute()
                if res2.data and len(res2.data) > 0:
                    return True
            except (ValueError, TypeError):
                pass

            return True
        except Exception as e:
            print(f"[Supabase DB Error] delete_entry: {e}")
            return False

    # ── ACTIVITY LOG ──
    def log_activity(self, activity_data):
        if not self._is_active:
            return None
        try:
            if 'id' not in activity_data:
                activity_data['id'] = str(uuid.uuid4())
            if 'created_at' not in activity_data:
                activity_data['created_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            res = self.client.table("activity_log").insert(activity_data).execute()
            return res.data[0] if res.data else activity_data
        except Exception as e:
            print(f"[Supabase DB Error] log_activity: {e}")
            return None

    def get_user_activities(self, user_id, limit=20):
        if not self._is_active or not user_id:
            return []
        try:
            res = self.client.table("activity_log").select("*") \
                .eq("user_id", str(user_id)) \
                .order("created_at", desc=True) \
                .limit(limit).execute()
            return res.data or []
        except Exception as e:
            print(f"[Supabase DB Error] get_user_activities: {e}")
            return []

    # ── REVIEWS ──
    def get_reviews(self, media_id=None, user_id=None):
        if not self._is_active:
            return []
        try:
            query = self.client.table("reviews").select("*")
            if media_id:
                query = query.eq("media_id", int(media_id))
            if user_id:
                query = query.eq("user_id", str(user_id))
            res = query.order("created_at", desc=True).execute()
            return res.data or []
        except Exception as e:
            print(f"[Supabase DB Error] get_reviews: {e}")
            return []

    def create_review(self, review_data):
        if not self._is_active:
            return None
        try:
            allowed_cols = {'id', 'user_id', 'media_id', 'media_type', 'content', 'score', 'likes_count', 'created_at'}
            payload = dict(review_data)
            if 'content' not in payload or not payload['content']:
                title = payload.get('title', '')
                body = payload.get('body', '')
                payload['content'] = f"{title}\n\n{body}".strip() if title else body
            filtered = {k: v for k, v in payload.items() if k in allowed_cols}
            if 'id' not in filtered or not filtered['id']:
                filtered['id'] = str(uuid.uuid4())
            res = self.client.table("reviews").insert(filtered).execute()
            return res.data[0] if (res.data and len(res.data) > 0) else payload
        except Exception as e:
            print(f"[Supabase DB Error] create_review: {e}")
            return None

    def count_reviews(self, media_id=None, media_type='anime'):
        if not self._is_active:
            return 0
        try:
            query = self.client.table("reviews").select("id", count="exact")
            if media_id:
                query = query.eq("media_id", int(media_id))
            if media_type:
                query = query.eq("media_type", media_type)
            res = query.execute()
            return res.count if res.count is not None else len(res.data)
        except Exception as e:
            print(f"[Supabase DB Error] count_reviews: {e}")
            return 0

    # ── NOTIFICATIONS ──
    def get_notifications(self, user_id, limit=50):
        if not self._is_active or not user_id:
            return getattr(self, '_mem_notifications', {}).get(str(user_id), [])
        try:
            res = self.client.table("notifications").select("*") \
                .eq("user_id", str(user_id)) \
                .order("created_at", desc=True) \
                .limit(limit).execute()
            return res.data or []
        except Exception as e:
            print(f"[Supabase DB Warning] get_notifications table query failed, using in-memory: {e}")
            if not hasattr(self, '_mem_notifications'):
                self._mem_notifications = {}
            return self._mem_notifications.get(str(user_id), [])

    def mark_notification_read(self, notif_id, user_id):
        if not hasattr(self, '_mem_notifications'):
            self._mem_notifications = {}
        user_notifs = self._mem_notifications.get(str(user_id), [])
        for n in user_notifs:
            if str(n.get('id') or n.get('_id')) == str(notif_id):
                n['read'] = True
        if self._is_active:
            try:
                self.client.table("notifications").update({"read": True}) \
                    .eq("id", str(notif_id)) \
                    .eq("user_id", str(user_id)).execute()
            except Exception:
                pass
        return True

    def mark_all_notifications_read(self, user_id):
        if not hasattr(self, '_mem_notifications'):
            self._mem_notifications = {}
        user_notifs = self._mem_notifications.get(str(user_id), [])
        for n in user_notifs:
            n['read'] = True
        if self._is_active:
            try:
                self.client.table("notifications").update({"read": True}) \
                    .eq("user_id", str(user_id)).execute()
            except Exception:
                pass
        return True

    def count_entries(self):
        if not self._is_active:
            return 0
        try:
            res = self.client.table("anime_list_entries").select("id", count="exact").execute()
            return res.count if res.count is not None else len(res.data)
        except Exception as e:
            print(f"[Supabase DB Error] count_entries: {e}")
            return 0

    def delete_review(self, review_id, user_id):
        if not self._is_active or not review_id:
            return False
        try:
            res = self.client.table("reviews").delete().eq("id", str(review_id)).eq("user_id", str(user_id)).execute()
            return True if res.data and len(res.data) > 0 else True
        except Exception as e:
            print(f"[Supabase DB Error] delete_review: {e}")
            return False

    def toggle_review_like(self, review_id, user_id):
        if not self._is_active or not review_id:
            return None
        try:
            res = self.client.table("reviews").select("*").eq("id", str(review_id)).execute()
            if not res.data:
                return None
            review = res.data[0]
            current_likes = int(review.get('likes_count') or 0)
            new_likes = max(0, current_likes + 1)
            up_res = self.client.table("reviews").update({"likes_count": new_likes}).eq("id", str(review_id)).execute()
            return up_res.data[0] if up_res.data else review
        except Exception as e:
            print(f"[Supabase DB Error] toggle_review_like: {e}")
            return None

    # ── CUSTOM LISTS ──
    def get_custom_lists(self, user_id):
        if not hasattr(self, '_mem_custom_lists'):
            self._mem_custom_lists = {}
        if not self._is_active or not user_id:
            return self._mem_custom_lists.get(str(user_id), [])
        try:
            res = self.client.table("custom_lists").select("*").eq("user_id", str(user_id)).execute()
            return res.data or []
        except Exception:
            return self._mem_custom_lists.get(str(user_id), [])

    def create_custom_list(self, list_data):
        user_id = str(list_data.get('user_id'))
        if not hasattr(self, '_mem_custom_lists'):
            self._mem_custom_lists = {}
        if str(user_id) not in self._mem_custom_lists:
            self._mem_custom_lists[str(user_id)] = []
        if 'id' not in list_data:
            list_data['id'] = str(uuid.uuid4())
        self._mem_custom_lists[str(user_id)].append(list_data)
        if self._is_active:
            try:
                res = self.client.table("custom_lists").insert(list_data).execute()
                return res.data[0] if res.data else list_data
            except Exception:
                pass
        return list_data

    def delete_custom_list(self, list_id, user_id):
        if not hasattr(self, '_mem_custom_lists'):
            self._mem_custom_lists = {}
        user_lists = self._mem_custom_lists.get(str(user_id), [])
        self._mem_custom_lists[str(user_id)] = [l for l in user_lists if str(l.get('id')) != str(list_id)]
        if self._is_active:
            try:
                self.client.table("custom_lists").delete().eq("id", str(list_id)).eq("user_id", str(user_id)).execute()
            except Exception:
                pass
        return True

    # ── OTP PERSISTENCE (survives process restarts) ──
    def save_otp(self, email, otp_data):
        cache_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'otp_cache.json')
        try:
            data = {}
            if os.path.exists(cache_file):
                with open(cache_file, 'r') as f:
                    data = json.load(f)
            s_data = dict(otp_data)
            if 'created_at' in s_data and hasattr(s_data['created_at'], 'isoformat'):
                s_data['created_at'] = s_data['created_at'].isoformat()
            if 'expires_at' in s_data and hasattr(s_data['expires_at'], 'isoformat'):
                s_data['expires_at'] = s_data['expires_at'].isoformat()
            data[email] = s_data
            with open(cache_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"[OTP Persistence Error]: {e}")

    def get_otp(self, email):
        cache_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'otp_cache.json')
        try:
            if os.path.exists(cache_file):
                with open(cache_file, 'r') as f:
                    data = json.load(f)
                    return data.get(email)
        except Exception as e:
            print(f"[OTP Read Error]: {e}")
        return None

    def delete_otp(self, email):
        cache_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'otp_cache.json')
        try:
            if os.path.exists(cache_file):
                with open(cache_file, 'r') as f:
                    data = json.load(f)
                data.pop(email, None)
                with open(cache_file, 'w') as f:
                    json.dump(data, f, indent=2)
        except Exception:
            pass

    def mark_email_verified(self, email):
        v_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'verified_emails.json')
        try:
            data = {}
            if os.path.exists(v_file):
                with open(v_file, 'r') as f:
                    data = json.load(f)
            data[email] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            with open(v_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    def is_email_verified(self, email):
        v_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'verified_emails.json')
        try:
            if os.path.exists(v_file):
                with open(v_file, 'r') as f:
                    data = json.load(f)
                    return email in data
        except Exception:
            pass
        return False

    def clear_email_verified(self, email):
        v_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'verified_emails.json')
        try:
            if os.path.exists(v_file):
                with open(v_file, 'r') as f:
                    data = json.load(f)
                data.pop(email, None)
                with open(v_file, 'w') as f:
                    json.dump(data, f, indent=2)
        except Exception:
            pass

    # ── IMAGE SAFETY CACHE ──
    def get_safety_cache(self, image_url):
        if not self._is_active or not image_url:
            return None
        try:
            res = self.client.table("image_safety_cache").select("*").eq("image_url", image_url).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"[Supabase DB Error] get_safety_cache: {e}")
            return None

    def set_safety_cache(self, image_url, safety, nudity_spots):
        if not self._is_active or not image_url:
            return None
        try:
            payload = {
                "image_url": image_url,
                "safety": safety,
                "nudity_spots": nudity_spots or [],
                "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
            res = self.client.table("image_safety_cache").upsert(payload, on_conflict="image_url").execute()
            return res.data[0] if res.data else payload
        except Exception as e:
            print(f"[Supabase DB Error] set_safety_cache: {e}")
            return None

db_proxy = SupabaseDatabaseProxy()
