from flask import Blueprint, request, jsonify
from app.utils.jwt_utils import jwt_required
import datetime
import uuid
from app.db import db_proxy

lists_bp = Blueprint('lists', __name__)

def serialize_entry(e):
    e_copy = dict(e)
    entry_id = str(e_copy.get('id') or e_copy.get('_id', ''))
    e_copy['_id'] = entry_id
    e_copy['id'] = entry_id
    e_copy['user_id'] = str(e_copy.get('user_id', ''))
    e_copy['updated_at'] = str(e_copy.get('updated_at', ''))
    return e_copy

@lists_bp.get('/<user_id>')
def get_user_lists(user_id):
    sp_entries = db_proxy.get_user_entries(user_id, media_type='anime')
    grouped = {}
    for e in sp_entries:
        if e.get('media_type', 'anime') != 'anime':
            continue
        status = e.get('status', 'plan_to_watch')
        if status not in grouped:
            grouped[status] = []
        grouped[status].append(serialize_entry(e))
    return jsonify(grouped)

@lists_bp.post('/entry')
@jwt_required
def add_entry():
    data = request.get_json() or {}
    now  = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_id = str(request.user_id)
    anilist_id = data.get('anilist_id')
    media_type = data.get('media_type', 'anime')

    entry = {
        'user_id':     user_id,
        'anilist_id':  anilist_id,
        'title':       data.get('title'),
        'media_type':  media_type,
        'status':      data.get('status', 'plan_to_watch'),
        'score':       data.get('score', 0),
        'progress':    data.get('progress', 0),
        'rewatch_count': 0,
        'notes':       data.get('notes', ''),
        'is_favorite': data.get('is_favorite', False),
        'is_private':  data.get('is_private', False),
        'priority':    data.get('priority', 'medium'),
        'tags':        data.get('tags', []),
        'genres':      data.get('genres', []),
        'updated_at':  now,
    }

    # Airing anime validation
    if entry['status'] == 'completed' and data.get('media_status') == 'RELEASING':
        return jsonify({'message': 'Airing anime cannot be set to completed'}), 400

    saved_entry = db_proxy.upsert_entry(entry) or entry

    # Log activity
    db_proxy.log_activity({
        'user_id':    user_id,
        'action':     'listed',
        'media_type': media_type,
        'media_id':   anilist_id,
        'details':    {'status': entry['status']},
        'created_at': now,
    })

    return jsonify(serialize_entry(saved_entry)), 201

@lists_bp.patch('/entry/<entry_id>')
@jwt_required
def update_entry(entry_id):
    data = request.get_json() or {}
    user_id = str(request.user_id)
    
    # Airing anime validation
    new_status = data.get('status')
    if new_status == 'completed' and data.get('media_status') == 'RELEASING':
        return jsonify({'message': 'Airing anime cannot be set to completed'}), 400

    anilist_id = data.get('anilist_id')
    media_type = data.get('media_type', 'anime')

    existing = None
    if anilist_id:
        existing = db_proxy.find_entry(user_id, anilist_id, media_type)
    if not existing:
        entries = db_proxy.get_user_entries(user_id)
        for e in entries:
            if str(e.get('id')) == str(entry_id):
                existing = e
                break

    merged_entry = dict(existing) if existing else {}
    merged_entry.update(data)
    merged_entry['id'] = str(entry_id)
    merged_entry['user_id'] = user_id
    merged_entry['updated_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    updated = db_proxy.upsert_entry(merged_entry)
    if not updated:
        return jsonify({'message': 'Failed to update entry'}), 400

    return jsonify(serialize_entry(updated))

@lists_bp.delete('/entry/<entry_id>')
@jwt_required
def delete_entry(entry_id):
    user_id = str(request.user_id)
    anilist_id = request.args.get('anilist_id')
    success = db_proxy.delete_entry(user_id, entry_id, media_type='anime')
    if not success:
        return jsonify({'message': 'Entry not found'}), 404
    return jsonify({'message': 'Deleted'})


# --- SERIES ENDPOINTS ---
@lists_bp.get('/series/<user_id>')
def get_user_series_lists(user_id):
    sp_entries = db_proxy.get_user_entries(user_id, media_type='series')
    grouped = {}
    for e in sp_entries:
        if e.get('media_type') != 'series':
            continue
        status = e.get('status', 'plan_to_watch')
        if status not in grouped:
            grouped[status] = []
        grouped[status].append(serialize_entry(e))
    return jsonify(grouped)

@lists_bp.post('/series/entry')
@jwt_required
def add_series_entry():
    data = request.get_json() or {}
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_id = str(request.user_id)
    tvmaze_id = data.get('tvmaze_id') or data.get('season_id') or 1
    anilist_id = int(tvmaze_id)

    entry = {
        'user_id':       user_id,
        'anilist_id':    anilist_id,
        'title':         data.get('title', 'Series Title'),
        'media_type':    'series',
        'status':        data.get('status', 'plan_to_watch'),
        'score':         float(data.get('score', 0)),
        'progress':      int(data.get('progress', 0)),
        'notes':         data.get('notes', ''),
        'is_favorite':   bool(data.get('is_favorite', False)),
        'is_private':    bool(data.get('is_private', False)),
        'genres':        data.get('genres', []),
        'updated_at':    now,
    }

    saved_entry = db_proxy.upsert_entry(entry) or entry

    # Log activity
    db_proxy.log_activity({
        'user_id':    user_id,
        'action':     'listed',
        'media_type': 'series',
        'media_id':   anilist_id,
        'details':    {'status': entry['status'], 'title': entry['title']},
        'created_at': now,
    })

    return jsonify(serialize_entry(saved_entry)), 201

@lists_bp.patch('/series/entry/<entry_id>')
@jwt_required
def update_series_entry(entry_id):
    data = request.get_json() or {}
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_id = str(request.user_id)
    
    data['updated_at'] = now
    data['user_id'] = user_id
    data['id'] = entry_id
    data['media_type'] = 'series'

    updated = db_proxy.upsert_entry(data)
    if not updated:
        return jsonify({'message': 'Failed to update series entry'}), 400

    return jsonify(serialize_entry(updated))

@lists_bp.delete('/series/entry/<entry_id>')
@jwt_required
def delete_series_entry(entry_id):
    user_id = str(request.user_id)
    success = db_proxy.delete_entry(user_id, entry_id, media_type='series')
    if not success:
        return jsonify({'message': 'Entry not found'}), 404
    return jsonify({'message': 'Deleted'})


# --- CUSTOM LISTS ENDPOINTS ---
@lists_bp.get('/custom')
@jwt_required
def get_my_custom_lists():
    user_id = str(request.user_id)
    lists = db_proxy.get_custom_lists(user_id)
    for l in lists:
        l['_id'] = str(l.get('id') or l.get('_id', ''))
    return jsonify(lists)

@lists_bp.get('/custom/<user_id>')
def get_user_custom_lists(user_id):
    lists = db_proxy.get_custom_lists(user_id)
    for l in lists:
        l['_id'] = str(l.get('id') or l.get('_id', ''))
    return jsonify(lists)

@lists_bp.post('/custom')
@jwt_required
def create_custom_list():
    data = request.get_json() or {}
    user_id = str(request.user_id)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    list_item = {
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'title': data.get('title', 'My Custom List'),
        'description': data.get('description', ''),
        'is_private': data.get('is_private', False),
        'entries': data.get('entries', []),
        'created_at': now,
        'updated_at': now,
    }
    created = db_proxy.create_custom_list(list_item)
    if created:
        created['_id'] = str(created.get('id') or created.get('_id', ''))
    return jsonify(created or list_item), 201

@lists_bp.patch('/custom/<list_id>')
@jwt_required
def update_custom_list(list_id):
    data = request.get_json() or {}
    user_id = str(request.user_id)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    data['updated_at'] = now
    if db_proxy._is_active:
        try:
            res = db_proxy.client.table("custom_lists").update(data).eq("id", str(list_id)).eq("user_id", user_id).execute()
            if res.data:
                return jsonify(res.data[0])
        except Exception:
            pass
    return jsonify({'message': 'Updated', 'id': list_id})

@lists_bp.delete('/custom/<list_id>')
@jwt_required
def delete_custom_list(list_id):
    user_id = str(request.user_id)
    success = db_proxy.delete_custom_list(list_id, user_id)
    if not success:
        return jsonify({'message': 'List not found or unauthorized'}), 404
    return jsonify({'message': 'Custom list deleted successfully'})
