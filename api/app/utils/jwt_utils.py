import jwt
import datetime
from flask import current_app
from functools import wraps
from flask import request, jsonify

def generate_tokens(user_id: str):
    cfg = current_app.config
    now = datetime.datetime.now(datetime.timezone.utc)

    access_payload = {
        'sub': str(user_id),
        'iat': now,
        'exp': now + cfg['JWT_ACCESS_TOKEN_EXPIRES'],
        'type': 'access',
    }
    refresh_payload = {
        'sub': str(user_id),
        'iat': now,
        'exp': now + cfg['JWT_REFRESH_TOKEN_EXPIRES'],
        'type': 'refresh',
    }

    access_token  = jwt.encode(access_payload,  cfg['JWT_SECRET'], algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, cfg['JWT_SECRET'], algorithm='HS256')
    return access_token, refresh_token


def decode_token(token: str):
    return jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'message': 'Missing token'}), 401
        token = auth.split(' ', 1)[1]
        try:
            payload = decode_token(token)
            if payload.get('type') != 'access':
                return jsonify({'message': 'Invalid token type'}), 401
            request.user_id = payload['sub']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    @jwt_required
    def decorated(*args, **kwargs):
        from app.db import db_proxy
        user = db_proxy.find_user_by_id(request.user_id)
        if not user or user.get('role') != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated
