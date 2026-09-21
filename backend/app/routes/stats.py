from flask import Blueprint, jsonify
from app.utils.jwt_utils import jwt_required
from app.db import db_proxy
from datetime import datetime, timedelta

stats_bp = Blueprint('stats', __name__)

@stats_bp.get('/<user_id>')
def get_stats(user_id):
    entries = db_proxy.get_user_entries(user_id)

    anime_count = len(entries)
    total_episodes = sum(e.get('progress', 0) for e in entries)
    total_hours = round(total_episodes * 0.38, 1)
    scores = [e.get('score', 0) for e in entries if e.get('score', 0) > 0]
    mean_score = round(sum(scores) / len(scores), 1) if scores else 0

    status_dist = {}
    genre_counts = {}
    for entry in entries:
        st = entry.get('status', 'plan_to_watch')
        status_dist[st] = status_dist.get(st, 0) + 1
        for g in (entry.get('genres') or []):
            genre_counts[g] = genre_counts.get(g, 0) + 1

    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    genres_data = [{'name': name, 'value': count} for name, count in sorted_genres]

    days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    weekly_activity = {day: 0 for day in days_of_week}
    series_weekly_activity = {day: 0 for day in days_of_week}

    activities = db_proxy.get_user_activities(user_id, limit=50)
    for log in activities:
        dt_raw = log.get('created_at')
        if not dt_raw:
            continue
        try:
            dt = datetime.fromisoformat(str(dt_raw).replace('Z', '+00:00'))
            day_name = dt.strftime('%a')
            media_type = log.get('media_type', 'anime')
            episodes = (log.get('details') or {}).get('episodes_watched', 1)
            if media_type == 'series' and day_name in series_weekly_activity:
                series_weekly_activity[day_name] += episodes
            elif day_name in weekly_activity:
                weekly_activity[day_name] += episodes
        except Exception:
            continue

    weekly_data = [{'day': day, 'episodes': weekly_activity[day]} for day in days_of_week]
    series_weekly_data = [{'day': day, 'episodes': series_weekly_activity[day]} for day in days_of_week]

    return jsonify({
        'anime_count': anime_count,
        'total_episodes': total_episodes,
        'total_hours': total_hours,
        'mean_score': mean_score,
        'status_distribution': status_dist,
        'genres': genres_data,
        'weekly': weekly_data,
        'series_weekly': series_weekly_data
    })


@stats_bp.get('/<user_id>/history')
@jwt_required
def get_history(user_id):
    activities = db_proxy.get_user_activities(user_id, limit=50)
    for a in activities:
        a['_id'] = str(a.get('id') or a.get('_id', ''))
    return jsonify(activities)

@stats_bp.get('/<user_id>/heatmap')
def get_heatmap(user_id):
    activities = db_proxy.get_user_activities(user_id, limit=365)
    heatmap_data = {}
    for log in activities:
        dt_raw = log.get('created_at')
        if not dt_raw:
            continue
        try:
            date_str = str(dt_raw).split('T')[0]
            heatmap_data[date_str] = heatmap_data.get(date_str, 0) + 1
        except Exception:
            continue
    formatted = [{'date': k, 'count': v} for k, v in heatmap_data.items()]
    return jsonify({'heatmap': formatted})

@stats_bp.get('/<user_id>/genres')
def get_genres(user_id):
    entries = db_proxy.get_user_entries(user_id)
    genre_counts = {}
    for entry in entries:
        for g in (entry.get('genres') or []):
            genre_counts[g] = genre_counts.get(g, 0) + 1
    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    genres_data = [{'name': name, 'value': count} for name, count in sorted_genres]
    return jsonify({'genres': genres_data})
