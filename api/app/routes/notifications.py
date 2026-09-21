from flask import Blueprint, jsonify, request
from app.utils.jwt_utils import jwt_required
from app.db import db_proxy

notif_bp = Blueprint('notifications', __name__)

def serialize_notif(n):
    n_copy = dict(n)
    n_copy['_id'] = str(n_copy.get('id') or n_copy.get('_id', ''))
    n_copy['user_id'] = str(n_copy.get('user_id', ''))
    n_copy['created_at'] = str(n_copy.get('created_at', ''))
    return n_copy

@notif_bp.get('/')
@jwt_required
def get_notifications():
    notifs = db_proxy.get_notifications(request.user_id, limit=50)
    return jsonify([serialize_notif(n) for n in notifs])

@notif_bp.patch('/<notif_id>/read')
@jwt_required
def mark_read(notif_id):
    db_proxy.mark_notification_read(notif_id, request.user_id)
    return jsonify({'message': 'Marked as read'})

@notif_bp.patch('/read-all')
@jwt_required
def mark_all_read():
    db_proxy.mark_all_notifications_read(request.user_id)
    return jsonify({'message': 'All marked as read'})
