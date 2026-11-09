from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from math import log10
from pathlib import Path
from typing import Dict, List

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / 'data'

LEVEL_WEIGHT = {'beginner': 1.0, 'intermediate': 1.2, 'advanced': 1.35}


def _generate_default_video_catalog() -> pd.DataFrame:
    from resources import TOPIC_CATALOG
    rows = []
    for topic, data in TOPIC_CATALOG.items():
        videos_by_level = data.get("videos", {})
        for lvl, vlist in videos_by_level.items():
            for v in vlist:
                rows.append({
                    'topic': topic,
                    'level': lvl,
                    'quality_score': 9.0,
                    'views': 250000,
                    'published_year': 2023,
                    'title': v.get('title', 'Video Tutorial'),
                    'channel': v.get('channel', 'Educational Channel'),
                    'url': v.get('url', 'https://www.youtube.com'),
                    'duration_minutes': 40,
                })
    if not rows:
        rows.append({
            'topic': 'python',
            'level': 'beginner',
            'quality_score': 9.0,
            'views': 100000,
            'published_year': 2023,
            'title': 'Python Tutorial for Beginners',
            'channel': 'freeCodeCamp.org',
            'url': 'https://www.youtube.com/watch?v=rfscVS0vtbw',
            'duration_minutes': 60,
        })
    df = pd.DataFrame(rows)
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_DIR / 'youtube_videos_catalog.csv', index=False)
    except Exception:
        pass
    return df


def _generate_default_course_catalog() -> pd.DataFrame:
    from resources import TOPIC_CATALOG
    rows = []
    for topic, data in TOPIC_CATALOG.items():
        courses = data.get("courses", [])
        for c in courses:
            rows.append({
                'topic': topic,
                'level': 'beginner',
                'platform': c.get('provider', 'Coursera'),
                'rating': 4.8,
                'learners': 45000,
                'certificate': c.get('certificate', True),
                'verified': True,
                'title': c.get('title', 'Course'),
                'url': c.get('url', 'https://www.coursera.org'),
                'duration_hours': 15,
                'dataset_source': 'verified_catalog',
            })
    if not rows:
        rows.append({
            'topic': 'python',
            'level': 'beginner',
            'platform': 'Coursera',
            'rating': 4.8,
            'learners': 50000,
            'certificate': True,
            'verified': True,
            'title': 'Python for Everybody',
            'url': 'https://www.coursera.org/specializations/python',
            'duration_hours': 20,
            'dataset_source': 'verified_catalog',
        })
    df = pd.DataFrame(rows)
    for col in ['certificate', 'verified']:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lower().isin(['true', '1', 'yes'])
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_DIR / 'online_courses_catalog.csv', index=False)
    except Exception:
        pass
    return df


def _generate_default_kaggle_catalog() -> pd.DataFrame:
    from resources import TOPIC_CATALOG
    rows = []
    for topic in TOPIC_CATALOG.keys():
        rows.append({
            'topic': topic,
            'level': 'beginner',
            'title': f'{topic.title()} Dataset & Benchmark',
            'url': f'https://www.kaggle.com/search?q={topic.replace(" ", "+")}',
            'source': 'Kaggle',
            'description': f'Curated Kaggle dataset for practicing {topic}.',
        })
    df = pd.DataFrame(rows)
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_DIR / 'kaggle_datasets_catalog.csv', index=False)
    except Exception:
        pass
    return df


def _generate_default_project_catalog() -> pd.DataFrame:
    from resources import TOPIC_CATALOG
    rows = []
    for topic, data in TOPIC_CATALOG.items():
        proj = data.get("project", f"Build a practical project to master {topic}.")
        for lvl in ["beginner", "intermediate", "advanced"]:
            rows.append({
                'topic': topic,
                'difficulty': lvl,
                'project': f"[{lvl.title()}] {proj}",
            })
    df = pd.DataFrame(rows)
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_DIR / 'mini_projects_catalog.csv', index=False)
    except Exception:
        pass
    return df


@lru_cache(maxsize=1)
def load_video_catalog() -> pd.DataFrame:
    filepath = DATA_DIR / 'youtube_videos_catalog.csv'
    if not filepath.exists():
        return _generate_default_video_catalog()
    try:
        return pd.read_csv(filepath)
    except Exception:
        return _generate_default_video_catalog()


@lru_cache(maxsize=1)
def load_course_catalog() -> pd.DataFrame:
    filepath = DATA_DIR / 'online_courses_catalog.csv'
    if not filepath.exists():
        return _generate_default_course_catalog()
    try:
        df = pd.read_csv(filepath)
    except Exception:
        df = _generate_default_course_catalog()
    for col in ['certificate', 'verified']:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lower().isin(['true', '1', 'yes'])
    return df


@lru_cache(maxsize=1)
def load_kaggle_catalog() -> pd.DataFrame:
    filepath = DATA_DIR / 'kaggle_datasets_catalog.csv'
    if not filepath.exists():
        return _generate_default_kaggle_catalog()
    try:
        return pd.read_csv(filepath)
    except Exception:
        return _generate_default_kaggle_catalog()


@lru_cache(maxsize=1)
def load_project_catalog() -> pd.DataFrame:
    filepath = DATA_DIR / 'mini_projects_catalog.csv'
    if not filepath.exists():
        return _generate_default_project_catalog()
    try:
        return pd.read_csv(filepath)
    except Exception:
        return _generate_default_project_catalog()


def _topic_similarity(candidate_topic: str, requested_topic: str) -> float:
    a = set(str(candidate_topic).lower().split())
    b = set(str(requested_topic).lower().split())
    if str(candidate_topic).lower() == str(requested_topic).lower():
        return 1.0
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def rank_catalog_videos(topic: str, level: str, max_results: int = 6) -> List[Dict]:
    try:
        df = load_video_catalog().copy()
        if df.empty:
            return []
        df['topic_similarity'] = df['topic'].apply(lambda x: _topic_similarity(x, topic))
        df['level_match'] = (df['level'].astype(str).str.lower() == level.lower()).astype(float)
        df['score'] = (
            df['quality_score'].astype(float) * 0.42
            + df['topic_similarity'] * 3.2
            + df['level_match'] * 1.8
            + df['views'].apply(lambda x: min(log10(max(float(x), 1.0)), 8.0)) * 0.35
            + (df['published_year'].astype(float) - 2018).clip(lower=0) * 0.08
        )
        df = df.sort_values(['score', 'views', 'quality_score'], ascending=False)
        rows = df.head(max_results).to_dict(orient='records')
        return [
            {
                'title': r['title'],
                'channel': r['channel'],
                'url': r['url'],
                'viewCount': int(r['views']),
                'duration': f"{int(r['duration_minutes'])} min",
                'published_at': f"{int(r['published_year'])}-01-01T00:00:00Z",
                'source': 'youtube_dataset_csv',
                'rank_score': round(float(r['score']), 3),
            }
            for r in rows
        ]
    except Exception:
        return []


def rank_live_and_dataset_videos(topic: str, level: str, live_videos: List[Dict], max_results: int = 8) -> List[Dict]:
    dataset_videos = rank_catalog_videos(topic, level, max_results=max_results)
    combined = []
    seen = set()

    def score_live(video: Dict) -> float:
        title = str(video.get('title', ''))
        channel = str(video.get('channel', ''))
        views = float(video.get('viewCount') or 0)
        recency_bonus = 0.6 if str(video.get('published_at', ''))[:4] in {'2025', '2026', '2024'} else 0.25
        level_bonus = 0.8 if level.lower() in title.lower() else 0.2
        topic_bonus = 1.8 if topic.lower() in title.lower() else 0.9
        return topic_bonus + level_bonus + recency_bonus + min(log10(max(views, 1.0)), 8.0) * 0.3 + (0.2 if 'tutorial' in title.lower() else 0)

    for item in live_videos:
        key = item.get('url')
        if key and key not in seen:
            item = dict(item)
            item['rank_score'] = round(score_live(item), 3)
            combined.append(item)
            seen.add(key)
    for item in dataset_videos:
        key = item.get('url')
        if key and key not in seen:
            combined.append(item)
            seen.add(key)

    combined.sort(key=lambda x: float(x.get('rank_score', 0)), reverse=True)
    return combined[:max_results]


def rank_courses(topic: str, level: str, provider: str = 'all', max_results: int = 6) -> List[Dict]:
    try:
        df = load_course_catalog().copy()
        if df.empty:
            return []
        if provider != 'all' and 'platform' in df.columns:
            df = df[df['platform'].astype(str).str.lower() == provider.lower()]
        df['topic_similarity'] = df['topic'].apply(lambda x: _topic_similarity(x, topic))
        df['level_match'] = (df['level'].astype(str).str.lower() == level.lower()).astype(float)
        df['score'] = (
            df['topic_similarity'] * 3.0
            + df['level_match'] * 1.8
            + df['rating'].astype(float) * 0.85
            + df['learners'].apply(lambda x: min(log10(max(float(x), 1.0)), 7.0)) * 0.45
            + df['certificate'].astype(int) * 0.5
            + df['verified'].astype(int) * 0.45
        )
        df = df.sort_values(['score', 'rating', 'learners'], ascending=False)
        rows = df.head(max_results).to_dict(orient='records')
        results = []
        for r in rows:
            results.append(
                {
                    'title': r['title'],
                    'provider': r['platform'],
                    'url': r['url'],
                    'certificate': bool(r['certificate']),
                    'verified': bool(r['verified']),
                    'rating': float(r['rating']),
                    'learners': int(r['learners']),
                    'duration_hours': int(r['duration_hours']),
                    'level': r['level'],
                    'source': r.get('dataset_source', 'verified_catalog'),
                    'rank_score': round(float(r['score']), 3),
                }
            )
        return results
    except Exception:
        return []


def rank_kaggle_datasets(topic: str, level: str = 'beginner', max_results: int = 4) -> List[Dict]:
    try:
        df = load_kaggle_catalog().copy()
        if df.empty:
            return []
        df['topic_similarity'] = df['topic'].apply(lambda x: _topic_similarity(x, topic))
        df['level_match'] = (df['level'].astype(str).str.lower() == level.lower()).astype(float)
        df['score'] = df['topic_similarity'] * 3 + df['level_match'] * 1.4
        df = df.sort_values(['score', 'title'], ascending=[False, True])
        return df.head(max_results).to_dict(orient='records')
    except Exception:
        return []


def project_for_topic(topic: str, level: str) -> str:
    try:
        df = load_project_catalog().copy()
        if df.empty:
            return f"Build a practical project to master {topic}."
        df['topic_similarity'] = df['topic'].apply(lambda x: _topic_similarity(x, topic))
        df['difficulty_weight'] = df['difficulty'].astype(str).str.lower().map(LEVEL_WEIGHT).fillna(1.0)
        target_weight = LEVEL_WEIGHT.get(level.lower(), 1.0)
        df['difficulty_gap'] = (df['difficulty_weight'] - target_weight).abs()
        df['score'] = df['topic_similarity'] * 3 - df['difficulty_gap']
        sorted_df = df.sort_values(['score'], ascending=False)
        if not sorted_df.empty:
            return str(sorted_df.iloc[0]['project'])
    except Exception:
        pass
    return f"Build a practical project to master {topic}."


def filter_options() -> Dict[str, List[str]]:
    try:
        courses = load_course_catalog()
        providers = ['all'] + sorted(courses['platform'].dropna().unique().tolist()) if 'platform' in courses.columns else ['all']
    except Exception:
        providers = ['all']
    return {
        'providers': providers,
        'levels': ['all', 'beginner', 'intermediate', 'advanced'],
        'video_modes': ['hybrid', 'live', 'dataset'],
    }

