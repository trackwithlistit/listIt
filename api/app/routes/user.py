from flask import Blueprint, request, jsonify
from app.utils.jwt_utils import jwt_required
import datetime
import base64
import bcrypt
from app.db import db_proxy

user_bp = Blueprint('user', __name__)

def serialize_user(user):
    if not user:
        return {}
    user_copy = dict(user)
    user_copy['_id'] = str(user_copy.get('id') or user_copy.get('_id', ''))
    user_copy.pop('password_hash', None)
    user_copy.pop('refresh_tokens', None)
    user_copy['followers'] = [str(f) for f in user_copy.get('followers', [])]
    user_copy['following'] = [str(f) for f in user_copy.get('following', [])]
    return user_copy

@user_bp.get('/<username>')
def get_profile(username):
    user = db_proxy.find_user_by_username(username)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(serialize_user(user))

@user_bp.patch('/profile')
@jwt_required
def update_profile():
    data     = request.get_json() or {}
    allowed  = ['username', 'bio', 'avatar_url', 'banner_url', 'favorite_genres', 'favorite_character', 'favorite_studio', 'settings']
    update   = {k: data[k] for k in allowed if k in data}
    
    user_id = str(request.user_id)
    updated_user = db_proxy.update_user(user_id, update)
        
    return jsonify({'message': 'Profile updated', 'user': serialize_user(updated_user or {})})

@user_bp.post('/avatar')
@jwt_required
def upload_avatar():
    avatar_url = None
    # 1. Handle multipart/form-data upload
    if request.files and ('avatar' in request.files or 'file' in request.files):
        file = request.files.get('avatar') or request.files.get('file')
        if file and file.filename != '':
            mimetype = file.mimetype or 'image/png'
            file_bytes = file.read()
            b64_str = base64.b64encode(file_bytes).decode('utf-8')
            avatar_url = f"data:{mimetype};base64,{b64_str}"

    # 2. Handle JSON payload
    if not avatar_url:
        data = request.get_json(silent=True) or {}
        avatar_url = data.get('avatar_url') or data.get('avatar')

    if not avatar_url:
        return jsonify({'message': 'No avatar image provided'}), 400

    user_id = str(request.user_id)
    db_proxy.update_user(user_id, {'avatar_url': avatar_url})
    return jsonify({'message': 'Avatar updated', 'avatar_url': avatar_url})

@user_bp.post('/banner')
@jwt_required
def upload_banner():
    banner_url = None
    if request.files and ('banner' in request.files or 'file' in request.files):
        file = request.files.get('banner') or request.files.get('file')
        if file and file.filename != '':
            mimetype = file.mimetype or 'image/png'
            file_bytes = file.read()
            b64_str = base64.b64encode(file_bytes).decode('utf-8')
            banner_url = f"data:{mimetype};base64,{b64_str}"

    if not banner_url:
        data = request.get_json(silent=True) or {}
        banner_url = data.get('banner_url') or data.get('banner')

    if not banner_url:
        return jsonify({'message': 'No banner image provided'}), 400

    user_id = str(request.user_id)
    db_proxy.update_user(user_id, {'banner_url': banner_url})
    return jsonify({'message': 'Banner updated', 'banner_url': banner_url})

@user_bp.post('/change-password')
@jwt_required
def change_password():
    data = request.get_json() or {}
    current_password = data.get('current_password') or data.get('currentPassword')
    new_password = data.get('new_password') or data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({'message': 'Both current password and new password are required.'}), 400

    if len(new_password) < 8:
        return jsonify({'message': 'New password must be at least 8 characters long.'}), 400

    user_id = str(request.user_id)
    user = db_proxy.find_user_by_id(user_id)
    if not user:
        return jsonify({'message': 'User not found.'}), 404

    if not bcrypt.checkpw(current_password.encode(), user['password_hash'].encode()):
        return jsonify({'message': 'Incorrect current password.'}), 400

    pw_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    db_proxy.update_user(user_id, {'password_hash': pw_hash})
    return jsonify({'message': 'Password updated successfully!'})

@user_bp.post('/follow/<target_id>')
@jwt_required
def follow(target_id):
    me_id = str(request.user_id)
    target_id = str(target_id)
    if me_id == target_id:
        return jsonify({'message': "Can't follow yourself"}), 400
    
    me_user = db_proxy.find_user_by_id(me_id)
    target_user = db_proxy.find_user_by_id(target_id)
    
    if me_user:
        following = list(me_user.get('following') or [])
        if target_id not in following:
            following.append(target_id)
            db_proxy.update_user(me_id, {'following': following})
            
    if target_user:
        followers = list(target_user.get('followers') or [])
        if me_id not in followers:
            followers.append(me_id)
            db_proxy.update_user(target_id, {'followers': followers})
            
    return jsonify({'message': 'Following'})

@user_bp.delete('/follow/<target_id>')
@jwt_required
def unfollow(target_id):
    me_id = str(request.user_id)
    target_id = str(target_id)
    
    me_user = db_proxy.find_user_by_id(me_id)
    target_user = db_proxy.find_user_by_id(target_id)
    
    if me_user:
        following = [f for f in (me_user.get('following') or []) if str(f) != target_id]
        db_proxy.update_user(me_id, {'following': following})
            
    if target_user:
        followers = [f for f in (target_user.get('followers') or []) if str(f) != me_id]
        db_proxy.update_user(target_id, {'followers': followers})
        
    return jsonify({'message': 'Unfollowed'})

@user_bp.get('/<user_id>/followers')
def get_followers(user_id):
    user = db_proxy.find_user_by_id(user_id)
    if not user:
        return jsonify([])
    follower_ids = user.get('followers') or []
    followers = []
    for fid in follower_ids:
        fuser = db_proxy.find_user_by_id(fid)
        if fuser:
            followers.append({'_id': str(fuser.get('id')), 'username': fuser.get('username'), 'avatar_url': fuser.get('avatar_url')})
    return jsonify(followers)

@user_bp.get('/<user_id>/following')
def get_following(user_id):
    user = db_proxy.find_user_by_id(user_id)
    if not user:
        return jsonify([])
    following_ids = user.get('following') or []
    following = []
    for fid in following_ids:
        fuser = db_proxy.find_user_by_id(fid)
        if fuser:
            following.append({'_id': str(fuser.get('id')), 'username': fuser.get('username'), 'avatar_url': fuser.get('avatar_url')})
    return jsonify(following)
