from flask import Blueprint, jsonify, request
from app.utils.jwt_utils import admin_required
from app.db import db_proxy

admin_bp = Blueprint('admin', __name__)

@admin_bp.get('/stats')
@admin_required
def admin_stats():
    users_count = db_proxy.count_users()
    reviews_count = db_proxy.count_reviews()
    entries_count = db_proxy.count_entries()
    return jsonify({'users': users_count, 'entries': entries_count, 'reviews': reviews_count})

@admin_bp.get('/users')
@admin_required
def get_users():
    users = db_proxy.get_all_users()
    for u in users:
        u['_id'] = str(u.get('id') or u.get('_id', ''))
        u.pop('password_hash', None)
        u.pop('refresh_tokens', None)
    return jsonify({'users': users, 'total': len(users)})

@admin_bp.patch('/users/<user_id>')
@admin_required
def update_user(user_id):
    data    = request.get_json() or {}
    allowed = ['role', 'is_verified', 'is_banned']
    update  = {k: data[k] for k in allowed if k in data}
    db_proxy.update_user(user_id, update)
    return jsonify({'message': 'Updated'})
