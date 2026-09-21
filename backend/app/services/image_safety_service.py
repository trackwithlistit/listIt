import os
import re
import json
import base64
import tempfile
import requests
from flask import current_app
from PIL import Image

from app.db import db_proxy

CACHE_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'image_safety_cache.json')

# Singleton detector instance
_nude_detector = None

def get_nude_detector():
    global _nude_detector
    if _nude_detector is None:
        try:
            from nudenet import NudeDetector
            _nude_detector = NudeDetector()
        except Exception as e:
            print(f"[NudeDetector Init Error]: {e}")
            _nude_detector = False
    return _nude_detector if _nude_detector is not False else None

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache):
    try:
        with open(CACHE_FILE, 'w') as f:
            json.dump(cache, f, indent=2)
    except Exception as e:
        print(f"[Safety Cache Error] Failed to write cache: {e}")

# Classes indicating private/nude areas requiring censorship
EXPOSED_NUDITY_CLASSES = {
    'FEMALE_GENITALIA_EXPOSED',
    'MALE_GENITALIA_EXPOSED',
    'ANUS_EXPOSED',
    'FEMALE_BREAST_EXPOSED',
    'BUTTOCKS_EXPOSED',
}

SUGGESTIVE_CLASSES = {
    'FEMALE_GENITALIA_COVERED',
    'FEMALE_BREAST_COVERED',
    'BUTTOCKS_COVERED',
    'ANUS_COVERED',
}

def detect_with_nudenet(img_bytes):
    """
    Runs local NudeNet neural network on the downloaded image.
    Calculates coordinates as normalized percentages (0 to 100) and expands
    the bounding box to guarantee full coverage of sensitive areas.
    """
    detector = get_nude_detector()
    if not detector:
        return None

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tf:
            tf.write(img_bytes)
            temp_path = tf.name

        with Image.open(temp_path) as im:
            orig_w, orig_h = im.size

        if orig_w == 0 or orig_h == 0:
            return None

        detections = detector.detect(temp_path)
        nudity_spots = []
        has_exposed = False
        has_suggestive = False

        for det in detections:
            cls_name = det.get('class', '')
            score = det.get('score', 0.0)

            # Sensitive anatomy filtering with high sensitivity (0.15 for exposed, 0.25 for covered)
            is_exposed = cls_name in EXPOSED_NUDITY_CLASSES and score >= 0.15
            is_suggestive = cls_name in SUGGESTIVE_CLASSES and score >= 0.25
            
            if is_exposed:
                has_exposed = True
            elif is_suggestive:
                has_suggestive = True
            else:
                continue

            x, y, w, h = det.get('box', [0, 0, 0, 0])

            # Convert to percentages (0 - 100)
            px = (x / orig_w) * 100.0
            py = (y / orig_h) * 100.0
            pw = (w / orig_w) * 100.0
            ph = (h / orig_h) * 100.0

            # Adaptive padding: ensure at least 15% margin around the detected sensitive zone
            expand_w = max(pw * 0.15, 3.0)
            expand_h = max(ph * 0.15, 3.0)
            exp_x = max(0.0, px - expand_w / 2.0)
            exp_y = max(0.0, py - expand_h / 2.0)
            exp_w = min(100.0 - exp_x, pw + expand_w)
            exp_h = min(100.0 - exp_y, ph + expand_h)

            nudity_spots.append({
                "x": round(exp_x, 2),
                "y": round(exp_y, 2),
                "width": round(exp_w, 2),
                "height": round(exp_h, 2),
                "label": cls_name,
                "score": round(score, 2)
            })

        safety = "nudity" if has_exposed else ("suggestive" if has_suggestive else "safe")
        return {"safety": safety, "nuditySpots": nudity_spots}

    except Exception as e:
        print(f"[NudeNet Detection Error]: {e}")
        return None
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

def check_image_safety(image_url):
    """
    Checks image safety using local NudeNet neural network with fallback to Gemini API.
    Returns normalized bounding box spots for enlarged white blur censorship.
    """
    if not image_url:
        return {"safety": "safe", "nuditySpots": []}

    # Check Supabase Cache first
    db_cached = db_proxy.get_safety_cache(image_url)
    if db_cached:
        return {
            "safety": db_cached.get("safety", "safe"),
            "nuditySpots": db_cached.get("nudity_spots") or db_cached.get("nuditySpots") or []
        }

    cache = load_cache()
    if image_url in cache:
        return cache[image_url]

    # Download image bytes
    try:
        headers_img = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        img_res = requests.get(image_url, headers=headers_img, timeout=8)
        if img_res.status_code != 200:
            return {"safety": "safe", "nuditySpots": []}
        img_data = img_res.content
    except Exception as e:
        print(f"[Safety Check Warning] Failed to fetch image {image_url}: {e}")
        return {"safety": "safe", "nuditySpots": []}

    # 1. Primary Engine: Local NudeNet Neural Network (Offline, zero API costs)
    nudenet_result = detect_with_nudenet(img_data)
    if nudenet_result is not None:
        db_proxy.set_safety_cache(image_url, nudenet_result["safety"], nudenet_result["nuditySpots"])
        cache[image_url] = nudenet_result
        save_cache(cache)
        return nudenet_result

    # 2. Secondary Fallback Engine: Google Gemini API
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY', '')
    if not api_key:
        return {"safety": "safe", "nuditySpots": []}

    base64_image = base64.b64encode(img_data).decode('utf-8')
    mime_type = img_res.headers.get('Content-Type', 'image/jpeg')
    if 'image' not in mime_type:
        mime_type = 'image/jpeg'

    prompt = """
You are an image safety censorship engine for an anime catalog.
Analyze this cover/poster image and identify ALL sensitive areas that require censorship.
This includes: exposed breasts, nipples, cleavage, groin/pubic regions, buttocks, AND any existing soft white spot blurs or glowing circular blurs on the artwork.

For EVERY sensitive or spot-blurred region, you MUST return bounding box coordinates as normalized percentages (0 to 100) relative to the top-left corner:
- "x": horizontal starting coordinate (0 to 100)
- "y": vertical starting coordinate (0 to 100)
- "width": width percentage of the region (0 to 100)
- "height": height percentage of the region (0 to 100)

Return ONLY a valid JSON object matching this exact schema:
{
  "safety": "nudity",
  "nuditySpots": [
    { "x": 10, "y": 35, "width": 80, "height": 30 }
  ]
}
"""

    models_to_try = [
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest"
    ]
    
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": base64_image
                        }
                    }
                ]
            }
        ]
    }

    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=12)
            if res.status_code == 200:
                text = res.json()['candidates'][0]['content']['parts'][0]['text']
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    result = json.loads(match.group(0))
                    safety = result.get("safety", "safe").lower()
                    if safety not in ["safe", "suggestive", "nudity", "explicit"]:
                        safety = "safe"
                    spots = result.get("nuditySpots", [])
                    
                    final_result = {"safety": safety, "nuditySpots": spots}
                    db_proxy.set_safety_cache(image_url, safety, spots)
                    cache[image_url] = final_result
                    save_cache(cache)
                    return final_result
        except Exception as e:
            print(f"[Safety Gemini Fallback Error with {model_name}] {e}")
            continue

    return {"safety": "safe", "nuditySpots": []}
