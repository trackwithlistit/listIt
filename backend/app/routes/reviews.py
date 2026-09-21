from flask import Blueprint, request, jsonify
from app.utils.jwt_utils import jwt_required
import datetime
from app.db import db_proxy

reviews_bp = Blueprint('reviews', __name__)

def serialize_review(r):
    r_copy = dict(r)
    r_copy['_id'] = str(r_copy.get('id') or r_copy.get('_id', ''))
    r_copy['user_id'] = str(r_copy.get('user_id', ''))
    r_copy['created_at'] = str(r_copy.get('created_at', ''))
    r_copy['likes'] = [str(l) for l in r_copy.get('likes', [])]
    return r_copy

@reviews_bp.get('/<int:media_id>')
def get_reviews(media_id):
    media_type = request.args.get('type', 'anime')
    sp_reviews = db_proxy.get_reviews(media_id=media_id)
    filtered = [serialize_review(r) for r in sp_reviews if r.get('media_type', 'anime') == media_type]
    total = len(filtered)
    return jsonify({'reviews': filtered, 'total': total, 'page': 1, 'per_page': 10})

@reviews_bp.post('/')
@jwt_required
def create_review():
    data = request.get_json() or {}
    user_id = str(request.user_id)
    media_id = data.get('media_id')
    media_type = data.get('media_type', 'anime')

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    review = {
        'user_id':    user_id,
        'media_id':   media_id,
        'media_type': media_type,
        'title':      data.get('title', ''),
        'body':       data.get('body', ''),
        'score':      data.get('score', 0),
        'is_spoiler': data.get('is_spoiler', False),
        'likes':      [],
        'created_at': now,
    }

    created = db_proxy.create_review(review) or review
    return jsonify(serialize_review(created)), 201

@reviews_bp.delete('/<review_id>')
@jwt_required
def delete_review(review_id):
    user_id = str(request.user_id)
    success = db_proxy.delete_review(review_id, user_id)
    if not success:
        return jsonify({'message': 'Review not found or unauthorized'}), 404
    return jsonify({'message': 'Review deleted successfully'})

@reviews_bp.post('/<review_id>/like')
@jwt_required
def toggle_like(review_id):
    user_id = str(request.user_id)
    updated = db_proxy.toggle_review_like(review_id, user_id)
    if not updated:
        return jsonify({'message': 'Review not found'}), 404
    return jsonify(serialize_review(updated))

@reviews_bp.patch('/<review_id>')
@jwt_required
def update_review(review_id):
    data = request.get_json() or {}
    user_id = str(request.user_id)
    # Update review
    allowed = ['title', 'body', 'score', 'is_spoiler']
    update_data = {k: data[k] for k in allowed if k in data}
    if db_proxy._is_active:
        try:
            res = db_proxy.client.table("reviews").update(update_data).eq("id", str(review_id)).eq("user_id", user_id).execute()
            if res.data:
                return jsonify(serialize_review(res.data[0]))
        except Exception as e:
            print(f"[Supabase DB Error] update_review: {e}")
    return jsonify({'message': 'Updated'})
