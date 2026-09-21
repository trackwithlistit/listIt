import os
import re
import json
import time
import requests
from flask import current_app

ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co'

def levenshtein_distance(a, b):
    a = a.lower().strip()
    b = b.lower().strip()
    if a == b: return 0
    if not a: return len(b)
    if not b: return len(a)
    matrix = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1): matrix[i][0] = i
    for j in range(len(b) + 1): matrix[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            matrix[i][j] = min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            )
    return matrix[len(a)][len(b)]

def normalize_string(s):
    if not s: return ""
    s = s.lower().strip()
    s = re.sub(r'(.)\1{2,}', r'\1\1', s)
    s = re.sub(r'[^\w\s]', '', s)
    return re.sub(r'\s+', ' ', s)

_pop_chars_cache = []
_pop_chars_time = 0

def fetch_kitsu_characters(search_term, limit=20):
    try:
        url = f"https://kitsu.io/api/edge/characters?filter[name]={requests.utils.quote(search_term)}&include=mediaCharacters.media&page[limit]={limit}"
        headers = {'Accept': 'application/vnd.api+json', 'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, headers=headers, timeout=4)
        if res.status_code == 200:
            data = res.json()
            items = data.get('data', [])
            included = {}
            for inc in data.get('included', []):
                included[f"{inc.get('type')}_{inc.get('id')}"] = inc

            chars = []
            for item in items:
                attr = item.get('attributes', {})
                img_url = (attr.get('image') or {}).get('original') or (attr.get('image') or {}).get('large') or (attr.get('image') or {}).get('medium')
                raw_name = attr.get('name', '')
                
                # Format "Luffy Monkey D." to "Monkey D. Luffy"
                parts = raw_name.split()
                if len(parts) >= 2 and parts[0] == 'Luffy':
                    full_name = 'Monkey D. Luffy'
                else:
                    full_name = raw_name

                chars.append({
                    "id": int(item.get('id', 10000)),
                    "name": {"full": full_name, "alternative": [raw_name]},
                    "image": {"large": img_url, "medium": img_url},
                    "description": attr.get('description', ''),
                    "favourites": attr.get('malId', 5000) or 5000,
                    "media": {"nodes": [{"title": {"english": "ONE PIECE" if "luffy" in full_name.lower() else "ANIME"}}]}
                })
            return chars
    except Exception as e:
        print(f"[Kitsu Fallback Error]: {e}")
    return []

def fetch_popular_pool():
    global _pop_chars_cache, _pop_chars_time
    if _pop_chars_cache and (time.time() - _pop_chars_time < 900):
        return _pop_chars_cache

    query = '''
    query {
      Page(perPage: 50) {
        characters(sort: FAVOURITES_DESC) {
          id
          name { full native alternative userPreferred }
          image { large medium }
          description(asHtml: false)
          favourites
          siteUrl
          media(perPage: 5) {
            nodes { id title { english romaji } type popularity }
          }
        }
      }
    }
    '''
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'ListIt-App/2.0'}
    try:
        res = requests.post(ANILIST_GRAPHQL_URL, json={'query': query}, headers=headers, timeout=4)
        if res.status_code == 200:
            chars = res.json().get('data', {}).get('Page', {}).get('characters', [])
            if chars:
                _pop_chars_cache = chars
                _pop_chars_time = time.time()
                return chars
    except Exception as e:
        print(f"[AniList Pool Error]: {e}")
    
    # Kitsu Fallback for popular pool
    kitsu_popular = fetch_kitsu_characters('luffy', limit=20)
    if kitsu_popular:
        _pop_chars_cache = kitsu_popular
        _pop_chars_time = time.time()
        return kitsu_popular
    return _pop_chars_cache

def fetch_anilist_search(search_term, per_page=20):
    query = '''
    query ($search: String, $perPage: Int) {
      Page(perPage: $perPage) {
        characters(search: $search) {
          id
          name { full native alternative userPreferred }
          image { large medium }
          description(asHtml: false)
          favourites
          siteUrl
          media(perPage: 5) {
            nodes { id title { english romaji } type popularity }
          }
        }
      }
    }
    '''
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'ListIt-App/2.0'}
    try:
        res = requests.post(ANILIST_GRAPHQL_URL, json={'query': query, 'variables': {'search': search_term, 'perPage': per_page}}, headers=headers, timeout=4)
        if res.status_code == 200:
            chars = res.json().get('data', {}).get('Page', {}).get('characters', [])
            if chars:
                return chars
    except Exception as e:
        print(f"[AniList Search Error]: {e}")
    
    # Fallback to Kitsu API character search
    return fetch_kitsu_characters(search_term, limit=per_page)

def consult_gemini_intelligence(query_str, candidates):
    try:
        api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    except Exception:
        api_key = os.environ.get('GEMINI_API_KEY')

    if not api_key:
        return None

    candidate_summary = []
    for c in candidates[:20]:
        media_titles = [m.get('title', {}).get('english') or m.get('title', {}).get('romaji') for m in c.get('media', {}).get('nodes', []) if m.get('title')]
        candidate_summary.append({
            "id": c.get('id'),
            "name": c.get('name', {}).get('full'),
            "aliases": c.get('name', {}).get('alternative', []),
            "anime": media_titles[0] if media_titles else "Unknown"
        })

    prompt = f'''
You are the semantic reasoning engine for ListIt Universal Character Search.
User search query: "{query_str}"

Retrieved Character Candidates:
{json.dumps(candidate_summary, indent=2)}

Tasks:
1. Identify the intended candidate character ID from the supplied list that best corresponds to the user's intent. (e.g., "sukuna" -> Ryomen Sukuna, "zooro" -> Zoro Roronoa, "eran" -> Eren Yeager, "lufy" -> Monkey D. Luffy, "itadori" -> Yuji Itadori).
2. If the user query is a typo or alias, return the official full character name in "suggestedCorrection".
3. Classify intent: "CHARACTER_NAME", "TYPO_CORRECTION", or "SEMANTIC_SEARCH".

Return ONLY valid JSON matching this exact schema:
{{
  "intent": "TYPO_CORRECTION",
  "suggestedCorrection": "Monkey D. Luffy",
  "targetCandidateId": 40,
  "confidence": 0.98
}}
'''
    headers = {'Content-Type': 'application/json'}
    models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"]
    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, headers=headers, timeout=4)
            if res.status_code == 200:
                text = res.json()['candidates'][0]['content']['parts'][0]['text']
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
        except Exception as e:
            print(f"[Gemini Reasoning Error - {model_name}]: {e}")
    return None

def execute_character_search(raw_query):
    start_time = time.time()
    clean_query = raw_query.strip()
    norm_q = normalize_string(clean_query)

    if not norm_q:
        return {
            "query": raw_query,
            "normalizedQuery": "",
            "correction": None,
            "target": None,
            "nameMatches": [],
            "relatedCharacters": [],
            "similarCharacters": [],
            "meta": {"aiUsed": False, "latencyMs": 0}
        }

    # 1. Candidate Pool Generation
    direct_candidates = fetch_anilist_search(clean_query, per_page=20)
    popular_pool = fetch_popular_pool()

    candidate_map = {}
    for c in direct_candidates + popular_pool:
        candidate_map[c['id']] = c

    all_candidates = list(candidate_map.values())

    # 2. Consult Gemini Intelligence
    gemini_res = consult_gemini_intelligence(clean_query, all_candidates)
    target_id = gemini_res.get('targetCandidateId') if gemini_res else None
    suggested_corr = gemini_res.get('suggestedCorrection') if gemini_res else None

    # 3. Scoring & Target Identification
    scored = []
    for c in all_candidates:
        full_name = c.get('name', {}).get('full') or ''
        norm_name = normalize_string(full_name)
        name_tokens = norm_name.split()
        alt_names = [normalize_string(a) for a in c.get('name', {}).get('alternative', []) if a]

        score = 0
        is_exact = norm_name == norm_q
        is_alias = any(alt == norm_q for alt in alt_names)
        is_token_exact = any(tok == norm_q for tok in name_tokens)
        is_partial = norm_q in norm_name or any(norm_q in alt for alt in alt_names)

        if is_exact: score += 2000
        elif is_alias: score += 1500
        elif is_token_exact: score += 1200
        elif is_partial: score += 800

        for tok in name_tokens:
            dist = levenshtein_distance(norm_q, tok)
            if dist <= 2:
                score += (300 - dist * 80)

        # Apply Gemini AI boost if target identified
        if target_id and c.get('id') == target_id:
            score += 3000

        # Add popularity weighting (favourites)
        score += min(c.get('favourites', 0) / 100, 200)

        media_nodes = c.get('media', {}).get('nodes', [])
        anime_title = media_nodes[0].get('title', {}).get('english') or media_nodes[0].get('title', {}).get('romaji') if media_nodes else 'ANIME'

        char_obj = {
            "id": c.get('id'),
            "name": {"full": full_name},
            "image": {"large": c.get('image', {}).get('large'), "medium": c.get('image', {}).get('medium')},
            "media": {"nodes": [{"title": {"english": anime_title, "romaji": anime_title}}]},
            "favourites": c.get('favourites', 0),
            "score": score
        }
        scored.append(char_obj)

    # Sort descending by score
    scored.sort(key=lambda x: x['score'], reverse=True)

    # Deduplicate by full name
    seen_names = set()
    unique_scored = []
    for s in scored:
        fn = s['name']['full'].lower().strip()
        if fn not in seen_names:
            seen_names.add(fn)
            unique_scored.append(s)

    target_char = unique_scored[0] if unique_scored else None
    target_anime = target_char['media']['nodes'][0]['title']['english'] if target_char else None

    # Determine Typo Correction State
    correction_obj = None
    if suggested_corr and target_char:
        target_name = target_char['name']['full']
        norm_target = normalize_string(target_name)
        if norm_q != norm_target and norm_q not in norm_target:
            state = "INCLUDING_RESULTS" if target_char['score'] >= 1500 else "DID_YOU_MEAN"
            correction_obj = {
                "suggested": suggested_corr,
                "original": clean_query,
                "state": state
            }

    # Group Separation (Related = same anime; Similar = other anime)
    related = []
    similar = []
    if target_char:
        for c in unique_scored[1:]:
            c_anime = c['media']['nodes'][0]['title']['english']
            if c_anime and target_anime and c_anime.lower() == target_anime.lower():
                related.append(c)
            else:
                similar.append(c)

    latency = int((time.time() - start_time) * 1000)

    return {
        "query": clean_query,
        "normalizedQuery": norm_q,
        "correction": correction_obj,
        "target": target_char,
        "nameMatches": unique_scored[:12],
        "relatedCharacters": related[:8],
        "similarCharacters": similar[:8],
        "meta": {
            "aiUsed": gemini_res is not None,
            "latencyMs": latency
        }
    }
