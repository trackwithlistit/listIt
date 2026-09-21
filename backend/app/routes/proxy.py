from flask import Blueprint, request, jsonify
import requests

proxy_bp = Blueprint('proxy', __name__)

@proxy_bp.post('/anilist')
def proxy_anilist():
    try:
        data = request.get_json()
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        for attempt in range(2):
            try:
                response = requests.post(
                    'https://graphql.anilist.co',
                    json=data,
                    headers=headers,
                    timeout=8
                )
                return jsonify(response.json()), response.status_code
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
                if attempt == 1:
                    raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
