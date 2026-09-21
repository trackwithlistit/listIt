from flask import Blueprint, request, jsonify
from app.services.character_search_service import execute_character_search

search_bp = Blueprint('search', __name__)

@search_bp.get('/trending')
def trending():
    return jsonify({'message': 'Use AniList API directly from frontend'})

@search_bp.get('/recent')
def recent():
    return jsonify([])

@search_bp.route('/character', methods=['GET', 'POST'])
def search_character():
    if request.method == 'POST':
        data = request.get_json() or {}
        query_str = data.get('query', '')
    else:
        query_str = request.args.get('query', '')

    if not query_str:
        return jsonify({
            'query': '',
            'correction': None,
            'target': None,
            'nameMatches': [],
            'relatedCharacters': [],
            'similarCharacters': [],
            'meta': {'aiUsed': False, 'latencyMs': 0}
        })

    result = execute_character_search(query_str)
    return jsonify(result)

@search_bp.route('/check-image-safety', methods=['POST'])
def check_safety():
    data = request.get_json() or {}
    image_url = data.get('imageUrl', '')
    if not image_url:
        return jsonify({"safety": "safe", "nuditySpots": []})
    from app.services.image_safety_service import check_image_safety
    result = check_image_safety(image_url)
    return jsonify(result)
