from flask import Blueprint, request, jsonify
from app.utils.jwt_utils import generate_tokens, decode_token, jwt_required
import bcrypt
import datetime
import re
import uuid
import secrets
import hashlib

from app.db import db_proxy

auth_bp = Blueprint('auth', __name__)

def serialize_user(user):
    user_copy = dict(user)
    user_copy['_id'] = str(user_copy.get('id') or user_copy.get('_id', ''))
    user_copy.pop('password_hash', None)
    user_copy.pop('refresh_tokens', None)
    return user_copy

@auth_bp.post('/send-otp')
def send_otp():
    from app.utils.email_utils import send_otp_email

    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({'message': 'Invalid email format. Please enter a valid email address.'}), 400

    # Check if email is already registered
    if db_proxy.find_user_by_email(email):
        return jsonify({'message': 'This email address is already registered. Please log in.'}), 400

    # Check 60-second resend cooldown
    now = datetime.datetime.now(datetime.timezone.utc)
    existing = db_proxy.get_otp(email)
    if existing and 'created_at' in existing:
        try:
            created_at = datetime.datetime.fromisoformat(str(existing['created_at']).replace('Z', '+00:00'))
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=datetime.timezone.utc)
            elapsed = (now - created_at).total_seconds()
            if elapsed < 60:
                remaining = int(60 - elapsed)
                return jsonify({'message': f'Please wait {remaining} seconds before requesting a new code.'}), 429
        except Exception:
            pass

    # Generate secure 6-digit OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    otp_hash = hashlib.sha256(otp_code.encode()).hexdigest()
    expires_at = now + datetime.timedelta(minutes=5)

    db_proxy.save_otp(email, {
        'email': email,
        'otp_hash': otp_hash,
        'code_plain': otp_code,
        'created_at': now.isoformat(),
        'expires_at': expires_at.isoformat(),
        'attempts': 0,
        'max_attempts': 5
    })

    # Send OTP via Gmail SMTP
    print(f"[OTP LOG] Generated 6-digit verification code for {email}: {otp_code}")
    success, err_msg = send_otp_email(email, otp_code)
    if not success:
        return jsonify({'message': f'Failed to send verification email. {err_msg}'}), 500

    return jsonify({
        'message': f'Verification code sent to {email}',
        'email': email
    })


@auth_bp.post('/register')
def register():
    data = request.get_json() or {}
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')
    username = data.get('username', '').strip()

    # Validation
    if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({'message': 'Invalid email address'}), 400
    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400
    if not username or len(username) < 3:
        return jsonify({'message': 'Username must be at least 3 characters'}), 400
    if not re.match(r'^[a-zA-Z0-9_]{3,24}$', username):
        return jsonify({'message': 'Username can only contain letters, numbers, and underscores'}), 400

    if db_proxy.find_user_by_email(email):
        return jsonify({'message': 'Email already registered'}), 409
    if db_proxy.find_user_by_username(username):
        return jsonify({'message': 'Username already taken'}), 409

    # Verify email OTP status if checked
    if db_proxy.get_otp(email) and not db_proxy.is_email_verified(email):
        return jsonify({'message': 'Email address must be verified with OTP before creating an account.'}), 400

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_id = str(uuid.uuid4())
    user = {
        'id': user_id,
        'email': email,
        'username': username,
        'password_hash': pw_hash,
        'avatar_url': None,
        'banner_url': None,
        'bio': data.get('bio', ''),
        'favorite_genres': data.get('favorite_genres', []),
        'role': 'user',
        'is_verified': True,
        'followers': [],
        'following': [],
        'achievements': [],
        'badges': ['early_adopter'],
        'watch_streak': 0,
        'last_active': now,
        'created_at': now,
        'settings': {
            'theme': 'dark',
            'is_profile_public': True,
        },
        'refresh_tokens': [],
    }

    created_user = db_proxy.create_user(user) or user
    access_token, refresh_token = generate_tokens(created_user['id'])

    user['refresh_tokens'] = [refresh_token]
    db_proxy.update_user(created_user['id'], {'refresh_tokens': [refresh_token]})
    db_proxy.clear_email_verified(email)
    db_proxy.delete_otp(email)

    return jsonify({
        'access_token':  access_token,
        'refresh_token': refresh_token,
        'user':          serialize_user(created_user),
    }), 201


@auth_bp.post('/login')
def login():
    data     = request.get_json() or {}
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = db_proxy.find_user_by_email(email)
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401

    if not bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
        return jsonify({'message': 'Invalid credentials'}), 401

    user_id = str(user.get('id'))
    access_token, refresh_token = generate_tokens(user_id)
    
    current_tokens = user.get('refresh_tokens') or []
    if isinstance(current_tokens, list):
        current_tokens.append(refresh_token)
    else:
        current_tokens = [refresh_token]

    db_proxy.update_user(user_id, {
        'refresh_tokens': current_tokens,
        'last_active': datetime.datetime.now(datetime.timezone.utc).isoformat()
    })

    return jsonify({
        'access_token':  access_token,
        'refresh_token': refresh_token,
        'user':          serialize_user(user),
    })


@auth_bp.post('/refresh')
def refresh():
    data  = request.get_json() or {}
    token = data.get('refresh_token')
    if not token:
        return jsonify({'message': 'Missing refresh token'}), 400
    try:
        payload = decode_token(token)
        if payload.get('type') != 'refresh':
            raise ValueError('Wrong type')
        user_id = payload['sub']
        user = db_proxy.find_user_by_id(user_id)
        if not user or token not in (user.get('refresh_tokens') or []):
            return jsonify({'message': 'Invalid refresh token'}), 401
        new_access, new_refresh = generate_tokens(user_id)
        tokens = [t for t in (user.get('refresh_tokens') or []) if t != token]
        tokens.append(new_refresh)
        db_proxy.update_user(user_id, {'refresh_tokens': tokens})
        return jsonify({'access_token': new_access, 'refresh_token': new_refresh})
    except Exception:
        return jsonify({'message': 'Invalid or expired token'}), 401


@auth_bp.post('/logout')
@jwt_required
def logout():
    data  = request.get_json() or {}
    token = data.get('refresh_token')
    if token:
        user_id = str(request.user_id)
        user = db_proxy.find_user_by_id(user_id)
        if user:
            tokens = [t for t in (user.get('refresh_tokens') or []) if t != token]
            db_proxy.update_user(user_id, {'refresh_tokens': tokens})
    return jsonify({'message': 'Logged out'})


@auth_bp.get('/me')
@jwt_required
def me():
    user_id = str(request.user_id)
    user = db_proxy.find_user_by_id(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(serialize_user(user))


@auth_bp.post('/forgot-password')
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email or '@' not in email:
        return jsonify({'message': 'Please enter a valid email address'}), 400

    user = db_proxy.find_user_by_email(email)

    # VULN-02 FIX: Do NOT create phantom user if email does not exist
    if not user:
        return jsonify({
            'message': f'If an account exists with {email}, a verification code has been sent.',
            'email': email
        }), 200

    # Generate secure 6-digit OTP code
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    otp_hash = hashlib.sha256(otp_code.encode()).hexdigest()
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(minutes=15)

    # VULN-03 FIX: Persist OTP to disk
    db_proxy.save_otp(email, {
        'email': email,
        'otp_hash': otp_hash,
        'code_plain': otp_code,
        'created_at': now.isoformat(),
        'expires_at': expires_at.isoformat(),
        'attempts': 0,
        'max_attempts': 5
    })

    from app.utils.email_utils import send_otp_email
    send_otp_email(email, otp_code)

    # VULN-01 FIX: Do NOT leak otp_code in JSON response
    return jsonify({
        'message': f'Verification OTP sent to {email}',
        'email': email
    })


@auth_bp.post('/verify-otp')
def verify_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    otp = str(data.get('otp', '')).strip()

    if not email or not otp:
        return jsonify({'message': 'Email and OTP code are required.'}), 400

    record = db_proxy.get_otp(email)
    if not record:
        return jsonify({'message': 'No active verification request found for this email. Please request a new code.'}), 400

    now = datetime.datetime.now(datetime.timezone.utc)
    try:
        expires_at = datetime.datetime.fromisoformat(str(record['expires_at']).replace('Z', '+00:00'))
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
        if now > expires_at:
            db_proxy.delete_otp(email)
            return jsonify({'message': 'Verification code has expired. Please request a new code.'}), 400
    except Exception:
        pass

    attempts = int(record.get('attempts', 0))
    if attempts >= 5:
        db_proxy.delete_otp(email)
        return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    submitted_hash = hashlib.sha256(otp.encode()).hexdigest()
    is_valid = (submitted_hash == record.get('otp_hash')) or (otp == record.get('code_plain'))
    if not is_valid:
        record['attempts'] = attempts + 1
        db_proxy.save_otp(email, record)
        if record['attempts'] >= 5:
            db_proxy.delete_otp(email)
            return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400
        remaining = 5 - record['attempts']
        return jsonify({'message': f'Incorrect verification code. {remaining} attempt(s) remaining.'}), 400

    # Success
    db_proxy.mark_email_verified(email)
    return jsonify({'valid': True, 'success': True, 'message': 'Email verified successfully!'})


@auth_bp.post('/reset-password')
def reset_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    otp = str(data.get('otp') or data.get('code', '')).strip()
    password = data.get('password', '')

    if not email or not otp or not password:
        return jsonify({'message': 'Email, verification OTP, and new password are required'}), 400

    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters long'}), 400

    user = db_proxy.find_user_by_email(email)
    if not user:
        return jsonify({'message': 'No account found with this email address'}), 404

    record = db_proxy.get_otp(email)
    stored_code = record.get('code_plain') if record else None

    if not stored_code or stored_code != otp:
        return jsonify({'message': 'Invalid verification OTP code. Please check and try again.'}), 400

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    db_proxy.update_user(user['id'], {'password_hash': pw_hash})
    db_proxy.delete_otp(email)
    db_proxy.clear_email_verified(email)

    return jsonify({'message': 'Password changed successfully! You can now sign in.'})
