
from __future__ import annotations

import os
from dotenv import load_dotenv

load_dotenv()

from collections import deque
import random
import re
import time
from pathlib import Path

from flask import Flask, jsonify, request, session, send_from_directory
import os
from werkzeug.exceptions import HTTPException

from resources import QUIZ_QUESTIONS, TOPIC_CATALOG, match_topics_from_text, normalize_topic
from services.automl_service import build_learning_models, predict_level_with_models, predict_score_with_models
from services.catalog_service import (
    filter_options,
    project_for_topic,
    rank_courses,
    rank_kaggle_datasets,
    rank_live_and_dataset_videos,
    rank_catalog_videos,
)
from services.real_data_service import load_learning_dataset, load_optional_heart_dataset
from services.youtube_service import search_youtube_videos, youtube_api_available
from services.llm_tutor_service import generate_tutor_reply, load_dataset_registry
from services.interview_service import (
    GOAL_DEFINITIONS,
    PREPARATION_STAGES,
    get_goal_metadata,
    get_interview_questions,
    get_daily_challenge,
    evaluate_interview_response,
)
from services.db_service import (
    register_user,
    login_user,
    find_user_by_id,
    get_db_status,
)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_BUILD_DIR = BASE_DIR / "frontend" / "build"

app = Flask(
    __name__,
    static_folder=str(FRONTEND_BUILD_DIR / "static") if (FRONTEND_BUILD_DIR / "static").exists() else "static"
)
app.secret_key = os.environ.get("SECRET_KEY", "autolearn-fullstack-secret")

try:
    from flask_cors import CORS
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000", "http://127.0.0.1:5000"])
except Exception:
    pass

# Serve favicon.ico
@app.route('/favicon.ico')
def favicon():
    if FRONTEND_BUILD_DIR.exists() and (FRONTEND_BUILD_DIR / "favicon.ico").exists():
        return send_from_directory(str(FRONTEND_BUILD_DIR), 'favicon.ico')
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

LEARNING_DF, DATA_INFO = load_learning_dataset()
HEART_DF = load_optional_heart_dataset()
MODEL_BUNDLE = build_learning_models(LEARNING_DF)
DATASET_REGISTRY_DF = load_dataset_registry()

AI_FEATURES = [
    'LLM-ready tutor with doubt solving and local RAG fallback',
    'Embeddings-style retrieval over topic notes, datasets, and prerequisites',
    'Topic-aware adaptive quiz generation',
    'Weak-topic detection and learning score tracking',
    'Personalized path tracking with unlock logic',
    'Course, video, dataset, and mini-project recommendations',
    'AI/ML topic graph with prerequisite ordering',
]
ML_FEATURES = [
    'Performance prediction with classification and regression models',
    'Real-dataset ingestion for OULAD, UCI, and optional Kaggle score datasets',
    'Recommendation ranking for courses and videos',
    'Difficulty-aware quiz sequencing',
    'Path-based mastery scoring',
]


def level_from_score(score_pct: float) -> str:
    if score_pct < 45:
        return "beginner"
    if score_pct < 75:
        return "intermediate"
    return "advanced"


def _dedupe(items: list[str]) -> list[str]:
    return list(dict.fromkeys(items))


def parse_topics(syllabus_text: str, target_goal: str = "") -> list[str]:
    raw_tokens = []
    for token in re.split(r"[,\n;/|]+", f"{syllabus_text},{target_goal}"):
        token = token.strip()
        if token:
            raw_tokens.append(token)
    normalized = [normalize_topic(t) for t in raw_tokens]
    matched = match_topics_from_text(f"{syllabus_text}, {target_goal}")
    combined = []
    for topic in normalized + matched:
        if topic in TOPIC_CATALOG:
            combined.append(topic)
    return _dedupe(combined) or ["python"]


def find_learning_order(topics: list[str]) -> list[str]:
    known = [t for t in topics if t in TOPIC_CATALOG]
    unknown = [t for t in topics if t not in TOPIC_CATALOG]
    graph = {k: v.get("prerequisites", []) for k, v in TOPIC_CATALOG.items()}
    indegree = {t: 0 for t in known}
    dependents = {t: [] for t in known}
    for t in known:
        for pre in graph.get(t, []):
            if pre in indegree:
                indegree[t] += 1
                dependents[pre].append(t)
    queue = deque(sorted([t for t, d in indegree.items() if d == 0]))
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in dependents.get(node, []):
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return _dedupe(order + known + unknown)


def recommend_recent_algorithms(avg_score: float) -> list[dict]:
    items = [
        {"name": "Gradient Boosting", "why": "Strong on structured student data and excellent for ranking learning readiness."},
        {"name": "Extra Trees", "why": "Fast ensemble baseline that handles mixed numeric and categorical learning signals well."},
        {"name": "AutoML", "why": "Tries multiple models and selects the best one automatically for your dataset."},
        {"name": "Hybrid Recommendation", "why": "Combines live YouTube API results with curated video and course datasets."},
        {"name": "Adaptive Quiz Engine", "why": "Generates topic-aware question variants from syllabus keywords, prerequisites, and project goals."},
        {"name": "Learning Path Tracker", "why": "Detects started, in-progress, and completed topics and updates progress in real time."},
        {"name": "Topic-Aware Tutor", "why": "Answers doubts using the selected syllabus topic, its prerequisites, resources, and the learner profile."},
    ]
    if avg_score >= 70:
        items.extend([
            {"name": "XGBoost / LightGBM", "why": "Common industry boosters for tabular prediction and ranking tasks."},
            {"name": "Semantic Resource Matching", "why": "Improves topic-to-resource matching beyond plain keyword search."},
            {"name": "Transformer and LLM Paths", "why": "Adds advanced AI learning tracks after fundamentals are strong."},
        ])
    else:
        items.append({"name": "Rule Engine + Prerequisite Graph", "why": "Stops learners from skipping fundamentals and preserves the right order."})
    return items


def _default_path_progress(topics: list[str]) -> dict[str, str]:
    progress = {}
    for i, topic in enumerate(topics):
        progress[topic] = "recommended" if i == 0 else "locked"
    return progress


def _coerce_path_progress(topics: list[str], stored: dict | None) -> dict[str, str]:
    progress = _default_path_progress(topics)
    if isinstance(stored, dict):
        for topic, status in stored.items():
            if topic in progress and status in {"completed", "in-progress", "recommended", "locked"}:
                progress[topic] = status
    unlocked_seen = False
    for topic in topics:
        if progress[topic] == "completed":
            unlocked_seen = True
            continue
        if not unlocked_seen and progress[topic] == "locked":
            progress[topic] = "recommended"
            unlocked_seen = True
        elif unlocked_seen and progress[topic] == "locked":
            break
    completed_count = sum(1 for s in progress.values() if s == "completed")
    if completed_count < len(topics):
        next_idx = min(completed_count, len(topics) - 1)
        next_topic = topics[next_idx]
        if progress[next_topic] == "locked":
            progress[next_topic] = "recommended"
    return progress


def _compute_learning_score(assessment: list[dict], progress: dict[str, str], activity: dict | None = None) -> float:
    if not assessment and not progress:
        return 0.0
    activity = activity or {}
    quiz_component = sum(item.get("score_pct", 0) for item in assessment) / max(len(assessment), 1) if assessment else 0.0
    weights = {"locked": 0.0, "recommended": 0.45, "in-progress": 0.7, "completed": 1.0}
    path_component = (sum(weights.get(status, 0.0) for status in progress.values()) / max(len(progress), 1)) * 100 if progress else 0.0
    streak = min(int(activity.get("completed_actions", 0)) * 6, 18)
    recency = min(int(activity.get("quiz_attempts", 0)) * 4, 12)
    score = (quiz_component * 0.6) + (path_component * 0.3) + streak + recency
    return round(min(score, 100.0), 1)


def _normalize_step_status(status: str) -> str:
    normalized = (status or '').strip().lower()
    if normalized in {'not started', 'not_started', 'start', 'recommended'}:
        return 'recommended'
    if normalized in {'in progress', 'in-progress', 'progress'}:
        return 'in-progress'
    if normalized in {'completed', 'done'}:
        return 'completed'
    return 'locked'


def _status_label(status: str) -> str:
    return {
        'completed': 'Completed',
        'in-progress': 'In Progress',
        'recommended': 'Not Started',
        'locked': 'Locked',
    }.get(status, str(status).title())


def _topic_resource_payload(topic: str, level: str) -> dict:
    topic = normalize_topic(topic)
    if topic not in TOPIC_CATALOG:
        topic = next((t for t in TOPIC_CATALOG if topic in TOPIC_CATALOG[t].get('aliases', [])), topic)
    rec = get_recommendations(topic, level, provider='all', video_mode='hybrid')
    return {
        'topic': topic,
        'level': level,
        'videos': rec['videos'][:4],
        'courses': rec['courses'][:4],
        'datasets': rec['datasets'][:3],
        'project': rec['project'],
    }


def _resolve_topic_for_resources(requested_topic: str, profile: dict) -> str | None:
    if not profile or not profile.get('topics'):
        return None
    requested = normalize_topic(requested_topic or '')
    if requested in profile['topics']:
        return requested
    for topic in profile['topics']:
        if requested in TOPIC_CATALOG.get(topic, {}).get('aliases', []):
            return topic
        if requested in TOPIC_CATALOG.get(topic, {}).get('prerequisites', []):
            return topic
    return next((t for t, status in _coerce_path_progress(profile['topics'], profile.get('path_progress', {})).items() if status != 'locked'), profile['topics'][0])


def _activity_metrics(profile: dict, assessment: list[dict]) -> dict:
    topics = profile.get('topics', [])
    completed_topics = sum(1 for status in profile.get('path_progress', {}).values() if status == 'completed')
    topic_completion_pct = round((completed_topics / max(len(topics), 1)) * 100, 1) if topics else 0.0

    quiz_pct = round(sum(r['score_pct'] for r in assessment) / max(len(assessment), 1), 1) if assessment else 0.0

    video_values = []
    for topic, topic_data in profile.get('video_activity', {}).items():
        for rec in topic_data.values():
            if rec.get('watched_pct') is not None:
                video_values.append(rec['watched_pct'])
    video_pct = round(sum(video_values) / max(len(video_values), 1), 1) if video_values else 0.0

    course_clicks = 0
    course_completions = 0
    for topic_data in profile.get('course_activity', {}).values():
        for rec in topic_data.values():
            course_clicks += int(rec.get('clicks', 0))
            if rec.get('completed'):
                course_completions += 1
    course_pct = min(100.0, course_clicks * 10 + course_completions * 25)

    tutor_pct = min(100.0, int(profile.get('activity', {}).get('tutor_questions', 0)) * 25)

    learning_score = round(
        quiz_pct * 0.25 + topic_completion_pct * 0.4 + video_pct * 0.2 + course_pct * 0.1 + tutor_pct * 0.05,
        1,
    )
    return {
        'topic_completion_pct': topic_completion_pct,
        'quiz_pct': quiz_pct,
        'video_pct': video_pct,
        'course_pct': course_pct,
        'tutor_pct': tutor_pct,
        'learning_score': min(100.0, learning_score),
    }


def _shuffle_options(question: dict, rng: random.Random) -> dict:
    options = list(question.get("options", []))
    rng.shuffle(options)
    result = dict(question)
    result["options"] = options
    return result


def _question_variants(topic: str, idx: int, question: dict, rng: random.Random) -> list[dict]:
    stems = [
        question["q"],
        f"Topic check — {question['q']}",
        f"Choose the best answer for {topic.title()}: {question['q']}",
        f"Quick revision: {question['q']}",
        f"Selected syllabus topic: {topic.title()}. {question['q']}",
    ]
    variants = []
    for n, stem in enumerate(stems):
        item = _shuffle_options(question, rng)
        item.update({
            "topic": topic,
            "base_index": idx,
            "index": f"{idx}_{n}_{rng.randint(1000,9999)}",
            "q": stem,
            "difficulty": question.get("difficulty") or ("beginner" if idx == 0 else "intermediate"),
        })
        variants.append(item)
    return variants


def _sample_distractors(topic: str, answer: str, rng: random.Random, pool: list[str], max_count: int = 3) -> list[str]:
    candidates = [p for p in pool if p and p != answer]
    rng.shuffle(candidates)
    return candidates[:max_count]


def _generated_questions_for_topic(topic: str, rng: random.Random) -> list[dict]:
    meta = TOPIC_CATALOG.get(topic, {})
    aliases = meta.get("aliases", [])
    prereqs = meta.get("prerequisites", [])
    all_topics = list(TOPIC_CATALOG.keys())
    difficulty = "advanced" if len(prereqs) >= 3 else "intermediate" if prereqs else "beginner"
    generated = []

    if prereqs:
        answer = prereqs[0]
        options = [answer] + _sample_distractors(topic, answer, rng, all_topics)
        if len(options) >= 2:
            generated.append({
                "q": f"Which topic should usually be learned before {topic.title()}?",
                "options": options,
                "answer": answer,
                "difficulty": difficulty,
            })

    if aliases:
        answer = aliases[0]
        options = [answer] + _sample_distractors(topic, answer, rng, sum([TOPIC_CATALOG[t].get("aliases", []) for t in all_topics], []))
        if len(options) >= 2:
            generated.append({
                "q": f"Which term is most closely related to the syllabus topic {topic.title()}?",
                "options": options,
                "answer": answer,
                "difficulty": "beginner",
            })

    project = meta.get("project", "")
    if project:
        verbs = ["Build", "Predict", "Cluster", "Reduce", "Compare", "Clean", "Analyze"]
        answer = next((v for v in verbs if project.lower().startswith(v.lower())), "Build")
        options = [answer] + _sample_distractors(topic, answer, rng, verbs)
        generated.append({
            "q": f"The recommended mini-project for {topic.title()} mainly asks you to do what?",
            "options": options,
            "answer": answer,
            "difficulty": "intermediate",
        })

    level_keys = [k.title() for k in meta.get("videos", {}).keys()]
    if level_keys:
        answer = "Beginner"
        options = [answer] + _sample_distractors(topic, answer, rng, ["Intermediate", "Advanced", "Expert", "Deployment"])
        generated.append({
            "q": f"If you are starting {topic.title()} from scratch, which learning level should you begin with?",
            "options": options,
            "answer": answer,
            "difficulty": "beginner",
        })

    for item in generated:
        item["options"] = _dedupe(item["options"])
        if item["answer"] not in item["options"]:
            item["options"] = [item["answer"]] + item["options"]
        rng.shuffle(item["options"])
    return generated


def get_topic_quiz(topics: list[str], quiz_seed: int | None = None) -> list[dict]:
    seed = quiz_seed if quiz_seed is not None else time.time_ns()
    rng = random.Random(seed)
    selected_topics = [normalize_topic(t) for t in topics if normalize_topic(t) in QUIZ_QUESTIONS or normalize_topic(t) in TOPIC_CATALOG]
    if not selected_topics:
        selected_topics = ["python"]

    quiz = []
    topic_count = min(max(len(selected_topics), 1), 6)
    per_topic = 3 if topic_count <= 4 else 2
    for topic in selected_topics[:topic_count]:
        bank = list(QUIZ_QUESTIONS.get(topic, [])) + _generated_questions_for_topic(topic, rng)
        variants = []
        for idx, q in enumerate(bank):
            variants.extend(_question_variants(topic, idx, q, rng))
        rng.shuffle(variants)
        seen = set()
        picked = []
        for item in variants:
            sig = (item["q"], tuple(item["options"]))
            if sig in seen:
                continue
            seen.add(sig)
            picked.append(item)
            if len(picked) >= min(per_topic, len(bank)):
                break
        quiz.extend(picked)

    rng.shuffle(quiz)
    return quiz[: min(10, len(quiz))]


def build_topic_results(chosen_topics: list[str], answers: dict, quiz_items: list[dict]) -> list[dict]:
    grouped: dict[str, list[dict]] = {}
    for item in quiz_items:
        grouped.setdefault(normalize_topic(item["topic"]), []).append(item)

    results = []
    scored_topics = [t for t in chosen_topics if normalize_topic(t) in grouped]
    for topic in _dedupe(scored_topics):
        t = normalize_topic(topic)
        items = grouped.get(t, [])
        if not items:
            continue
        correct = 0
        for q in items:
            key = f"{q['topic']}_{q['index']}"
            if answers.get(key) == q["answer"]:
                correct += 1
        score_pct = round((correct / max(len(items), 1)) * 100, 1)
        predicted_level = predict_level_with_models(MODEL_BUNDLE, t, score_pct)
        predicted_exam_score = predict_score_with_models(MODEL_BUNDLE, t, score_pct)
        results.append({
            "topic": t,
            "score_pct": score_pct,
            "predicted_level": predicted_level,
            "predicted_exam_score": predicted_exam_score,
            "next_topics": TOPIC_CATALOG.get(t, {}).get("prerequisites", []),
        })

    if not results:
        score_pct = 0.0
        predicted_level = predict_level_with_models(MODEL_BUNDLE, "python", score_pct)
        results.append({
            "topic": "python",
            "score_pct": score_pct,
            "predicted_level": predicted_level,
            "predicted_exam_score": predict_score_with_models(MODEL_BUNDLE, "python", score_pct),
            "next_topics": TOPIC_CATALOG.get("python", {}).get("prerequisites", []),
        })
    return results


def get_recommendations(topic: str, level: str, provider: str = "all", video_mode: str = "hybrid") -> dict:
    topic = normalize_topic(topic)
    live_videos = search_youtube_videos(topic, max_results=6, level=level) if video_mode in {"hybrid", "live"} else []
    dataset_videos = rank_catalog_videos(topic, level, max_results=6) if video_mode in {"hybrid", "dataset"} else []

    if video_mode == "live":
        videos = live_videos or dataset_videos
        video_source = "live_youtube_api" if live_videos else "youtube_dataset_csv_fallback"
    elif video_mode == "dataset":
        videos = dataset_videos
        video_source = "youtube_dataset_csv"
    else:
        videos = rank_live_and_dataset_videos(topic, level, live_videos, max_results=8)
        if live_videos and dataset_videos:
            video_source = "hybrid_live_plus_dataset"
        elif live_videos:
            video_source = "live_youtube_api"
        else:
            video_source = "youtube_dataset_csv"

    courses = rank_courses(topic, level, provider=provider, max_results=6)
    kaggle_sets = rank_kaggle_datasets(topic, level, max_results=4)
    project = project_for_topic(topic, level)
    if topic in TOPIC_CATALOG:
        if not courses:
            courses = TOPIC_CATALOG[topic]["courses"]
        project = project or TOPIC_CATALOG[topic].get("project", "Practice a small project on this topic.")
    return {
        "videos": videos,
        "courses": courses,
        "project": project,
        "datasets": kaggle_sets,
        "video_source": video_source,
    }


def _build_learning_path(profile: dict, assessment: list[dict]) -> list[dict]:
    topic_levels = {r["topic"]: r["predicted_level"] for r in assessment}
    weak_topics = {r["topic"] for r in assessment if r["score_pct"] < 45}
    completed_topics = {r["topic"] for r in assessment if r["score_pct"] >= 75}
    stored_progress = _coerce_path_progress(profile.get("topics", []), profile.get("path_progress", {}))
    learning_path = []
    for idx, topic in enumerate(profile.get("topics", []), start=1):
        level = topic_levels.get(topic, "beginner")
        rec = _topic_resource_payload(topic, level)
        status = stored_progress.get(topic, "locked")
        if topic in completed_topics:
            status = "completed"
        elif topic in weak_topics and status == "locked":
            status = "recommended"
        video_activity = profile.get('video_activity', {}).get(topic, {})
        course_activity = profile.get('course_activity', {}).get(topic, {})
        video_progress = 0
        if video_activity:
            video_progress = int(max((item.get('watched_pct') or 0) for item in video_activity.values()))
        course_progress = 0
        if course_activity:
            course_completions = sum(1 for item in course_activity.values() if item.get('completed'))
            course_clicks = sum(int(item.get('clicks', 0)) for item in course_activity.values())
            course_progress = min(100, course_completions * 40 + course_clicks * 10)
        learning_path.append({
            "topic": topic,
            "level": level,
            "videos": rec["videos"],
            "courses": rec["courses"],
            "project": rec["project"],
            "datasets": rec["datasets"],
            "prerequisites": TOPIC_CATALOG.get(topic, {}).get("prerequisites", []),
            "order": idx,
            "status": status,
            "mastery": next((r["score_pct"] for r in assessment if r["topic"] == topic), 0.0),
            "video_progress": video_progress,
            "course_progress": course_progress,
            "resource_items": len(rec["videos"]) + len(rec["courses"]) + len(rec["datasets"]),
            "status_label": _status_label(status),
        })
    profile["path_progress"] = {item["topic"]: item["status"] for item in learning_path}
    session["profile"] = profile
    return learning_path


def _build_resources(profile: dict, assessment: list[dict]) -> list[dict]:
    if not profile or not profile.get('topics'):
        return []
    topic_levels = {r["topic"]: r["predicted_level"] for r in assessment} if assessment else {}
    resources = []
    for topic in profile['topics']:
        level = topic_levels.get(topic, "beginner")
        rec = _topic_resource_payload(topic, level)
        resources.append({"topic": topic, "level": level, **rec})
    return resources


def _dashboard_payload():
    profile = session.get("profile")
    assessment = session.get("assessment")
    if not profile:
        return {
            "profile": None,
            "assessment": [],
            "avgScore": 0,
            "strengths": [],
            "weakTopics": [],
            "modelScores": MODEL_BUNDLE.leaderboard,
            "modelName": MODEL_BUNDLE.best_model_name,
            "automlEngine": MODEL_BUNDLE.engine,
            "dataInfo": DATA_INFO,
            "modernFeatures": recommend_recent_algorithms(0),
            "youtubeLive": youtube_api_available(),
            "learningPath": [],
            "resources": [],
            "quizItems": session.get("quiz_items", []),
            "notifications": [],
            "availableTopics": sorted(TOPIC_CATALOG.keys()),
            "learningScore": 0,
            "pathProgress": {},
            "aiFeatures": AI_FEATURES,
            "mlFeatures": ML_FEATURES,
            "datasetRegistry": DATASET_REGISTRY_DF.to_dict(orient="records"),
            "datasetSources": DATA_INFO.get("sources", []),
            "llmMode": "openai" if os.environ.get("OPENAI_API_KEY") else "local_rag_fallback",
        }
    assessment = assessment or []
    avg_score = round(sum(r["score_pct"] for r in assessment) / max(len(assessment), 1), 1) if assessment else 0
    strengths = [r["topic"] for r in assessment if r["score_pct"] >= 75]
    weak = [r["topic"] for r in assessment if r["score_pct"] < 45]
    learning_path = _build_learning_path(profile, assessment) if profile.get("topics") else []
    resources = _build_resources(profile, assessment) if profile.get("topics") else []
    notifications = []
    if weak:
        notifications.append({"type": "warning", "title": "Focus next", "message": f"Revise {weak[0].title()} first before moving to harder topics."})
    if strengths:
        notifications.append({"type": "success", "title": "Strong area", "message": f"You are doing well in {strengths[0].title()}."})
    if profile.get("topics"):
        notifications.append({"type": "info", "title": "Plan ready", "message": f"{len(profile['topics'])} syllabus topics were mapped into your study plan."})
    activity = profile.get("activity", {})
    path_metrics = _activity_metrics(profile, assessment)
    learning_score = path_metrics["learning_score"]
    if learning_score >= 80:
        notifications.append({"type": "success", "title": "Learning score rising", "message": f"Your adaptive learning score is now {learning_score}%."})
    return {
        "profile": profile,
        "assessment": assessment,
        "avgScore": avg_score,
        "strengths": strengths,
        "weakTopics": weak,
        "modelScores": MODEL_BUNDLE.leaderboard,
        "modelName": MODEL_BUNDLE.best_model_name,
        "automlEngine": MODEL_BUNDLE.engine,
        "dataInfo": DATA_INFO,
        "modernFeatures": recommend_recent_algorithms(avg_score),
        "youtubeLive": youtube_api_available(),
        "learningPath": learning_path,
        "resources": resources,
        "quizItems": session.get("quiz_items", []),
        "notifications": notifications,
        "availableTopics": sorted(TOPIC_CATALOG.keys()),
        "learningScore": learning_score,
        "pathMetrics": path_metrics,
        "pathProgress": profile.get("path_progress", {}),
        "videoActivity": profile.get("video_activity", {}),
        "courseActivity": profile.get("course_activity", {}),
        "aiFeatures": AI_FEATURES,
        "mlFeatures": ML_FEATURES,
        "datasetRegistry": DATASET_REGISTRY_DF.to_dict(orient="records"),
        "datasetSources": DATA_INFO.get("sources", []),
        "llmMode": "openai" if os.environ.get("OPENAI_API_KEY") else "local_rag_fallback",
    }


@app.after_request
def add_no_cache_headers(resp):
    resp.headers["Cache-Control"] = "no-store"
    origin = request.headers.get("Origin", "")
    if origin in {"http://localhost:3000", "http://127.0.0.1:3000"}:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        resp.headers["Vary"] = "Origin"
    return resp


@app.errorhandler(404)
def handle_404(err):
    if request.path.startswith('/api/'):
        return jsonify({"ok": False, "error": f"API endpoint '{request.path}' not found."}), 404
    if FRONTEND_BUILD_DIR.exists():
        index_file = FRONTEND_BUILD_DIR / "index.html"
        if index_file.exists():
            return send_from_directory(str(FRONTEND_BUILD_DIR), "index.html")
    return jsonify({
        "ok": True,
        "message": "AutoLearn AI Backend API is running.",
        "frontend": "http://localhost:3000",
        "api_status": "/api/status",
        "database": "AIEDUCATION",
    })


@app.errorhandler(Exception)
def handle_api_error(err):
    if isinstance(err, HTTPException):
        code = err.code or 500
        description = err.description
        if code == 404 and not request.path.startswith('/api/'):
            if FRONTEND_BUILD_DIR.exists() and (FRONTEND_BUILD_DIR / "index.html").exists():
                return send_from_directory(str(FRONTEND_BUILD_DIR), "index.html")
    else:
        code = 500
        description = str(err) or "Internal server error"
    if request.path.startswith('/api/'):
        return jsonify({"ok": False, "error": description}), code
    if FRONTEND_BUILD_DIR.exists() and (FRONTEND_BUILD_DIR / "index.html").exists():
        return send_from_directory(str(FRONTEND_BUILD_DIR), "index.html")
    return jsonify({"ok": False, "error": description}), code




@app.route('/api/status')
def api_status():
    return jsonify({"ok": True, "real_data_used": DATA_INFO["real_data_used"], "rows": DATA_INFO["rows"], "engine": MODEL_BUNDLE.engine})


# ─────────────────────────────────────────────────────────────
# AUTHENTICATION ENDPOINTS (MongoDB AIEDUCATION)
# ─────────────────────────────────────────────────────────────

@app.route('/api/auth/signup', methods=['POST'])
def api_auth_signup():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    goal = (data.get('goal') or 'placement').strip()
    
    if not email or not password:
        return jsonify({'ok': False, 'error': 'Please provide both email and password.'}), 400
    if len(password) < 6:
        return jsonify({'ok': False, 'error': 'Password must be at least 6 characters long.'}), 400
        
    res = register_user(name=name, email=email, password=password, goal=goal)
    if not res.get('ok'):
        return jsonify(res), 400
        
    session['user'] = res['user']
    session['user_id'] = res['user']['user_id']
    return jsonify(res)


@app.route('/api/auth/login', methods=['POST'])
def api_auth_login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    
    if not email or not password:
        return jsonify({'ok': False, 'error': 'Please provide both email and password.'}), 400
        
    res = login_user(email=email, password=password)
    if not res.get('ok'):
        return jsonify(res), 401
        
    session['user'] = res['user']
    session['user_id'] = res['user']['user_id']
    return jsonify(res)


@app.route('/api/auth/me', methods=['GET'])
def api_auth_me():
    user = session.get('user')
    if not user:
        # Check if user_id in session
        user_id = session.get('user_id')
        if user_id:
            user = find_user_by_id(user_id)
            if user:
                session['user'] = user
    if not user:
        return jsonify({'ok': False, 'user': None}), 401
    return jsonify({'ok': True, 'user': user})


@app.route('/api/auth/logout', methods=['POST'])
def api_auth_logout():
    session.pop('user', None)
    session.pop('user_id', None)
    return jsonify({'ok': True, 'message': 'Logged out successfully.'})


@app.route('/api/db/status', methods=['GET'])
def api_database_status():
    return jsonify(get_db_status())


@app.route('/api/start', methods=['POST'])
def api_start():
    data = request.get_json(silent=True) or {}
    syllabus_text = (data.get('syllabus_text') or '').strip()
    target_goal = (data.get('target_goal') or '').strip()
    topics = find_learning_order(parse_topics(syllabus_text, target_goal))
    quiz_seed = int(time.time() * 1000)
    quiz_items = get_topic_quiz(topics, quiz_seed=quiz_seed)
    profile = {
        'syllabus_text': syllabus_text,
        'target_goal': target_goal,
        'topics': topics,
        'quiz_seed': quiz_seed,
        'path_progress': _default_path_progress(topics),
        'activity': {
            'quiz_attempts': 0,
            'completed_actions': 0,
            'tutor_questions': 0,
        },
        'video_activity': {},
        'course_activity': {},
    }
    session['profile'] = profile
    session['quiz_items'] = quiz_items
    session.pop('assessment', None)
    session.pop('answers', None)
    return jsonify({
        'ok': True,
        'profile': profile,
        'quizItems': quiz_items,
        'availableTopics': topics,
    })


@app.route('/api/quiz', methods=['GET', 'POST'])
def api_quiz():
    profile = session.get('profile')
    if not profile:
        return jsonify({'ok': False, 'error': 'Start your plan first.'}), 400

    if request.method == 'GET':
        force_new = request.args.get('refresh') == '1'
        if force_new or not session.get('quiz_items'):
            quiz_seed = int(time.time() * 1000)
            profile['quiz_seed'] = quiz_seed
            profile.setdefault("activity", {"quiz_attempts": 0, "completed_actions": 0})
            session['profile'] = profile
            session['quiz_items'] = get_topic_quiz(profile['topics'], quiz_seed=quiz_seed)
        return jsonify({'ok': True, 'quizItems': session.get('quiz_items', []), 'topics': profile['topics']})

    data = request.get_json(silent=True) or {}
    answers = data.get('answers') or {}
    quiz_items = session.get('quiz_items') or get_topic_quiz(profile['topics'], quiz_seed=profile.get('quiz_seed'))
    results = build_topic_results(profile['topics'], answers, quiz_items)
    profile.setdefault('activity', {'quiz_attempts': 0, 'completed_actions': 0})
    profile['activity']['quiz_attempts'] = int(profile['activity'].get('quiz_attempts', 0)) + 1
    session['profile'] = profile
    session['assessment'] = results
    session['answers'] = answers
    payload = _dashboard_payload()
    return jsonify({'ok': True, **payload})


@app.route('/api/context')
def api_context():
    return jsonify(_dashboard_payload())


@app.route('/api/reset', methods=['POST'])
def api_reset():
    session.clear()
    return jsonify({'ok': True})


@app.route('/api/search')
def api_search():
    query = (request.args.get('q') or '').strip().lower()
    payload = _dashboard_payload()
    pool = []
    for card in payload.get('resources', []):
        for course in card.get('courses', []):
            pool.append({'kind': 'course', 'topic': card['topic'], 'title': course.get('title', ''), 'url': course.get('url', ''), 'provider': course.get('provider', '')})
        for video in card.get('videos', []):
            pool.append({'kind': 'video', 'topic': card['topic'], 'title': video.get('title', ''), 'url': video.get('url', ''), 'provider': video.get('channel', '')})
        for ds in card.get('datasets', []):
            pool.append({'kind': 'dataset', 'topic': card['topic'], 'title': ds.get('title', ''), 'url': ds.get('url', ''), 'provider': ds.get('source', '')})
    if not query:
        return jsonify({'ok': True, 'results': pool[:10]})
    results = [item for item in pool if query in item['title'].lower() or query in item['topic'].lower() or query in item.get('provider', '').lower()]
    return jsonify({'ok': True, 'results': results[:12]})


@app.route('/api/notifications')
def api_notifications():
    payload = _dashboard_payload()
    return jsonify({'ok': True, 'notifications': payload.get('notifications', [])})


@app.route('/api/path/update', methods=['POST'])
def api_path_update():
    profile = session.get('profile')
    if not profile:
        return jsonify({'ok': False, 'error': 'Start your plan first.'}), 400
    data = request.get_json(silent=True) or {}
    topic = normalize_topic(data.get('topic') or '')
    status = (data.get('status') or '').strip().lower()
    if topic not in profile.get('topics', []):
        return jsonify({'ok': False, 'error': 'Unknown topic for this plan.'}), 400
    if status not in {'recommended', 'in-progress', 'completed', 'locked'}:
        return jsonify({'ok': False, 'error': 'Invalid path status.'}), 400
    progress = _coerce_path_progress(profile.get('topics', []), profile.get('path_progress', {}))
    progress[topic] = status
    topics = profile.get('topics', [])
    if status == 'completed':
        idx = topics.index(topic)
        if idx + 1 < len(topics) and progress[topics[idx + 1]] == 'locked':
            progress[topics[idx + 1]] = 'recommended'
    elif status == 'in-progress':
        for prereq in TOPIC_CATALOG.get(topic, {}).get('prerequisites', []):
            if prereq in topics and progress.get(prereq) == 'locked':
                progress[prereq] = 'recommended'
    profile['path_progress'] = progress
    profile.setdefault("activity", {"quiz_attempts": 0, "completed_actions": 0, "tutor_questions": 0})
    if status in {'completed', 'in-progress'}:
        profile['activity']['completed_actions'] = int(profile['activity'].get('completed_actions', 0)) + 1
    session['profile'] = profile
    return jsonify({'ok': True, **_dashboard_payload()})


@app.route('/api/path/step/update', methods=['POST'])
def api_path_step_update():
    profile = session.get('profile')
    if not profile:
        return jsonify({'ok': False, 'error': 'Start your plan first.'}), 400
    data = request.get_json(silent=True) or {}
    topic = normalize_topic(data.get('topic') or '')
    status = _normalize_step_status(data.get('status') or '')
    if topic not in profile.get('topics', []):
        return jsonify({'ok': False, 'error': 'Unknown topic for this plan.'}), 400
    progress = _coerce_path_progress(profile.get('topics', []), profile.get('path_progress', {}))
    progress[topic] = status
    topics = profile.get('topics', [])
    if status == 'completed':
        idx = topics.index(topic)
        if idx + 1 < len(topics) and progress[topics[idx + 1]] == 'locked':
            progress[topics[idx + 1]] = 'recommended'
    elif status == 'in-progress':
        for prereq in TOPIC_CATALOG.get(topic, {}).get('prerequisites', []):
            if prereq in topics and progress.get(prereq) == 'locked':
                progress[prereq] = 'recommended'
    profile['path_progress'] = progress
    profile.setdefault('activity', {'quiz_attempts': 0, 'completed_actions': 0, 'tutor_questions': 0})
    profile['activity']['completed_actions'] = int(profile['activity'].get('completed_actions', 0)) + 1
    session['profile'] = profile
    return jsonify({'ok': True, **_dashboard_payload()})


@app.route('/api/path/resources')
def api_path_resources():
    profile = session.get('profile')
    if not profile or not profile.get('topics'):
        return jsonify({'ok': False, 'error': 'No learning plan exists yet.'}), 400
    topic_query = request.args.get('topic', '')
    topic = _resolve_topic_for_resources(topic_query, profile)
    if not topic:
        return jsonify({'ok': False, 'error': 'Topic not found in your current syllabus.'}), 400
    assessment = session.get('assessment') or []
    level = next((r['predicted_level'] for r in assessment if r['topic'] == topic), 'beginner')
    resources = _topic_resource_payload(topic, level)
    return jsonify({'ok': True, 'topic': topic, 'resources': resources})


@app.route('/api/path/video/track', methods=['POST'])
def api_path_video_track():
    profile = session.get('profile')
    if not profile or not profile.get('topics'):
        return jsonify({'ok': False, 'error': 'Start your plan first.'}), 400
    data = request.get_json(silent=True) or {}
    topic = _resolve_topic_for_resources(data.get('topic', ''), profile)
    if not topic:
        return jsonify({'ok': False, 'error': 'Invalid topic.'}), 400
    url = (data.get('url') or '').strip()
    watched_seconds = int(data.get('watched_seconds') or 0)
    watched_pct = float(data.get('watched_pct') or 0)
    event = (data.get('event') or '').strip().lower()
    video_activity = profile.setdefault('video_activity', {}).setdefault(topic, {})
    entry = video_activity.setdefault(url, {'clicks': 0, 'watched_seconds': 0, 'watched_pct': 0.0, 'events': []})
    if event == 'start':
        entry['events'].append({'event': 'start', 'at': time.time()})
    if watched_seconds:
        entry['watched_seconds'] = max(entry['watched_seconds'], watched_seconds)
    if watched_pct:
        entry['watched_pct'] = max(entry['watched_pct'], watched_pct)
    if event == 'click':
        entry['clicks'] = int(entry.get('clicks', 0)) + 1
    if watched_pct >= 40 and profile.get('path_progress', {}).get(topic) not in {'in-progress', 'completed'}:
        profile['path_progress'] = _coerce_path_progress(profile.get('topics', []), profile.get('path_progress', {}))
        profile['path_progress'][topic] = 'in-progress'
    if watched_pct >= 80:
        profile.setdefault('activity', {'quiz_attempts': 0, 'completed_actions': 0, 'tutor_questions': 0})
        profile['activity']['completed_actions'] = int(profile['activity'].get('completed_actions', 0)) + 1
    session['profile'] = profile
    return jsonify({'ok': True, **_dashboard_payload()})


@app.route('/api/path/course/track', methods=['POST'])
def api_path_course_track():
    profile = session.get('profile')
    if not profile or not profile.get('topics'):
        return jsonify({'ok': False, 'error': 'Start your plan first.'}), 400
    data = request.get_json(silent=True) or {}
    topic = _resolve_topic_for_resources(data.get('topic', ''), profile)
    if not topic:
        return jsonify({'ok': False, 'error': 'Invalid topic.'}), 400
    url = (data.get('url') or '').strip()
    action = (data.get('action') or '').strip().lower()
    if not url or action not in {'click', 'completed'}:
        return jsonify({'ok': False, 'error': 'Invalid course track payload.'}), 400
    course_activity = profile.setdefault('course_activity', {}).setdefault(topic, {})
    entry = course_activity.setdefault(url, {'clicks': 0, 'revisits': 0, 'completed': False, 'last_action': None})
    if action == 'click':
        entry['clicks'] = int(entry.get('clicks', 0)) + 1
        entry['revisits'] = int(entry.get('revisits', 0)) + 1
        entry['last_action'] = 'click'
    elif action == 'completed':
        entry['completed'] = True
        entry['last_action'] = 'completed'
    profile.setdefault('activity', {'quiz_attempts': 0, 'completed_actions': 0, 'tutor_questions': 0})
    profile['activity']['completed_actions'] = int(profile['activity'].get('completed_actions', 0)) + 1
    if action == 'completed' and profile.get('path_progress', {}).get(topic) == 'locked':
        profile['path_progress'] = _coerce_path_progress(profile.get('topics', []), profile.get('path_progress', {}))
        profile['path_progress'][topic] = 'recommended'
    session['profile'] = profile
    return jsonify({'ok': True, **_dashboard_payload()})


@app.route('/api/path/progress')
def api_path_progress():
    profile = session.get('profile')
    if not profile:
        return jsonify({'ok': False, 'error': 'Start your plan first.'}), 400
    assessment = session.get('assessment') or []
    metrics = _activity_metrics(profile, assessment)
    return jsonify({
        'ok': True,
        'pathProgress': profile.get('path_progress', {}),
        'learningScore': metrics['learning_score'],
        'pathMetrics': metrics,
        'videoActivity': profile.get('video_activity', {}),
        'courseActivity': profile.get('course_activity', {}),
    })


@app.route('/api/tutor', methods=['POST'])
def api_tutor():
    data = request.get_json(silent=True) or {}
    raw_question = (data.get('question') or '').strip()
    history = data.get('history') or []
    api_key = (data.get('apiKey') or session.get('gemini_api_key') or os.getenv('GEMINI_API_KEY') or '').strip()
    profile = session.get('profile') or {}
    assessment = session.get('assessment') or []
    if not raw_question:
        return jsonify({'ok': False, 'error': 'Ask a question first.'}), 400
    if not profile.get('topics'):
        profile['topics'] = sorted(TOPIC_CATALOG.keys())
    profile.setdefault('activity', {'quiz_attempts': 0, 'completed_actions': 0, 'tutor_questions': 0})
    profile['activity']['tutor_questions'] = int(profile['activity'].get('tutor_questions', 0)) + 1
    session['profile'] = profile
    reply = generate_tutor_reply(raw_question, profile, assessment, history=history, api_key=api_key)
    return jsonify({
        'ok': True,
        'answer': reply.answer,
        'topic': reply.detected_topic,
        'mode': reply.mode,
        'retrieved': reply.retrieved_chunks,
        'related_resources': reply.related_resources,
    })


@app.route('/api/tutor/key', methods=['GET', 'POST', 'DELETE'])
def api_tutor_key():
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        key = (data.get('apiKey') or '').strip()
        if key:
            session['gemini_api_key'] = key
            return jsonify({'ok': True, 'hasKey': True, 'message': 'API Key saved for current session.'})
        return jsonify({'ok': False, 'error': 'API key cannot be empty.'}), 400
    elif request.method == 'DELETE':
        session.pop('gemini_api_key', None)
        return jsonify({'ok': True, 'hasKey': False, 'message': 'API Key cleared.'})
    else:
        has_key = bool(session.get('gemini_api_key') or os.getenv('GEMINI_API_KEY'))
        return jsonify({'ok': True, 'hasKey': has_key})


@app.route('/api/features')
def api_features():
    return jsonify({
        'ok': True,
        'aiFeatures': AI_FEATURES,
        'mlFeatures': ML_FEATURES,
        'datasets': DATASET_REGISTRY_DF.to_dict(orient='records'),
        'dataInfo': DATA_INFO,
        'llmMode': 'gemini_ai' if (os.environ.get('GEMINI_API_KEY') or os.environ.get('OPENAI_API_KEY')) else 'ai_tutor_engine',
    })


@app.route('/api/dsa/problems', methods=['GET'])
def api_dsa_problems():
    return jsonify({
        'ok': True,
        'topics_count': 19,
        'total_problems': 200,
        'categories': [
            'Programming Basics', 'Time and Space Complexity', 'Arrays', 'Strings',
            'Sorting', 'Binary Search', 'Linked Lists', 'Stack and Queue', 'Hashing',
            'Recursion', 'Backtracking', 'Trees', 'Binary Search Trees',
            'Heap / Priority Queue', 'Greedy Algorithms', 'Graphs',
            'Dynamic Programming', 'Trie', 'Advanced Algorithms'
        ],
        'patterns': [
            'Two Pointers', 'Sliding Window', 'Fast & Slow Pointers',
            'Binary Search on Answer', 'Prefix Sum', 'Monotonic Stack',
            'Tree DFS/BFS', 'Top K Elements', '0/1 Knapsack', 'Interval Merging'
        ]
    })


@app.route('/api/dsa/submit', methods=['POST'])
def api_dsa_submit():
    data = request.get_json(silent=True) or {}
    problem_id = data.get('problemId', 'two-sum')
    passed = bool(data.get('passed', False))
    difficulty = data.get('difficulty', 'Easy')
    topic = data.get('topic', 'arrays')
    
    profile = session.get('profile') or {}
    profile.setdefault('dsa_activity', {'solved_ids': [], 'total_solved': 0, 'submissions': 0})
    profile['dsa_activity']['submissions'] += 1
    
    if passed and problem_id not in profile['dsa_activity']['solved_ids']:
        profile['dsa_activity']['solved_ids'].append(problem_id)
        profile['dsa_activity']['total_solved'] += 1
        
    session['profile'] = profile
    return jsonify({
        'ok': True,
        'message': 'Submission recorded successfully',
        'solved_count': profile['dsa_activity']['total_solved'],
        'xp_awarded': 50 if difficulty == 'Easy' else 100 if difficulty == 'Medium' else 200
    })


@app.route('/api/syllabus/parse', methods=['POST'])
def api_syllabus_parse():
    data = request.get_json(silent=True) or {}
    syllabus_text = data.get('syllabus_text', '')
    parsed_topics = parse_topics(syllabus_text)
    learning_order = find_learning_order(parsed_topics)
    return jsonify({
        'ok': True,
        'extracted_topics': parsed_topics,
        'recommended_order': learning_order
    })


@app.route('/api/interview/context', methods=['GET'])
def api_interview_context():
    goal_param = request.args.get('goal', '').strip()
    profile = session.get('profile') or {}
    selected_goal = goal_param or session.get('selected_goal') or profile.get('target_goal') or 'placement'
    
    meta = get_goal_metadata(selected_goal)
    interview_act = profile.get('interview_activity', {}).get(selected_goal, {})
    custom_mastery = interview_act.get('topicMastery', meta.get('defaultMastery', {}))
    
    questions_attempted = interview_act.get('questionsAttempted', 0)
    correct_count = interview_act.get('correctCount', 0)
    accuracy = round((correct_count / max(1, questions_attempted)) * 100) if questions_attempted > 0 else 0
    
    readiness_topics = []
    for topic_name, score in custom_mastery.items():
        readiness_topics.append({'name': topic_name, 'mastery': score})
        
    overall_readiness = round(sum(t['mastery'] for t in readiness_topics) / max(1, len(readiness_topics))) if readiness_topics else 70
    
    weak_topics = [t['name'] for t in readiness_topics if t['mastery'] < 65]
    strengths = [t['name'] for t in readiness_topics if t['mastery'] >= 75]
    
    # Calculate unlocked preparation stages
    unlocked_stages = []
    for idx, stage in enumerate(PREPARATION_STAGES):
        # Stage is unlocked if previous stages met or base requirements
        is_unlocked = idx == 0 or (questions_attempted >= stage['targetCount'] * 0.4 and (accuracy >= 50 or questions_attempted >= 5))
        unlocked_stages.append({
            **stage,
            'isUnlocked': is_unlocked,
            'isCurrent': is_unlocked and (idx == len(PREPARATION_STAGES) - 1 or questions_attempted < stage['targetCount'])
        })
        
    daily_challenge = get_daily_challenge(selected_goal, weak_topics[0] if weak_topics else None)
    
    return jsonify({
        'ok': True,
        'selectedGoal': selected_goal,
        'goalMetadata': meta,
        'readinessTopics': readiness_topics,
        'overallReadiness': overall_readiness,
        'weakTopics': weak_topics,
        'strengths': strengths,
        'questionsAttempted': questions_attempted,
        'accuracy': accuracy,
        'preparationStages': unlocked_stages,
        'dailyChallenge': daily_challenge,
        'availableGoals': list(GOAL_DEFINITIONS.keys()),
        'disclaimer': 'Topic readiness percentages are estimates derived from learner activity and interview performance rather than guaranteed measures of real-world interview readiness.'
    })


@app.route('/api/interview/goal', methods=['POST'])
def api_interview_goal():
    data = request.get_json(silent=True) or {}
    goal = data.get('goal', 'placement')
    if goal not in GOAL_DEFINITIONS:
        goal = 'placement'
        
    session['selected_goal'] = goal
    profile = session.get('profile') or {}
    profile['target_goal'] = goal
    session['profile'] = profile
    
    meta = get_goal_metadata(goal)
    return jsonify({
        'ok': True,
        'goal': goal,
        'goalMetadata': meta
    })


@app.route('/api/interview/evaluate', methods=['POST'])
def api_interview_evaluate():
    data = request.get_json(silent=True) or {}
    question = data.get('question') or {}
    user_answer = data.get('userAnswer', '')
    
    if not question:
        return jsonify({'ok': False, 'error': 'Question payload is required.'}), 400
        
    evaluation = evaluate_interview_response(question, user_answer)
    return jsonify({
        'ok': True,
        'evaluation': evaluation
    })


@app.route('/api/interview/finish', methods=['POST'])
def api_interview_finish():
    data = request.get_json(silent=True) or {}
    goal = data.get('goal', 'placement')
    score = data.get('score', 0)
    questions = data.get('questions', [])
    mode = data.get('mode', 'technical')
    
    profile = session.get('profile') or {}
    profile.setdefault('activity', {'quiz_attempts': 0, 'completed_actions': 0, 'tutor_questions': 0})
    profile['activity']['completed_actions'] = int(profile['activity'].get('completed_actions', 0)) + 1
    
    all_act = profile.setdefault('interview_activity', {})
    goal_act = all_act.setdefault(goal, {
        'questionsAttempted': 0,
        'correctCount': 0,
        'partialCount': 0,
        'incorrectCount': 0,
        'sessionsCount': 0,
        'topicMastery': dict(get_goal_metadata(goal).get('defaultMastery', {}))
    })
    
    goal_act['sessionsCount'] = int(goal_act.get('sessionsCount', 0)) + 1
    
    # Process question results and adjust mastery
    for item in questions:
        q_score = item.get('score', 0)
        topic = item.get('topic')
        goal_act['questionsAttempted'] += 1
        if q_score >= 75:
            goal_act['correctCount'] += 1
            if topic and topic in goal_act['topicMastery']:
                goal_act['topicMastery'][topic] = min(98, goal_act['topicMastery'][topic] + 3)
        elif q_score >= 50:
            goal_act['partialCount'] += 1
            if topic and topic in goal_act['topicMastery']:
                goal_act['topicMastery'][topic] = min(95, goal_act['topicMastery'][topic] + 1)
        else:
            goal_act['incorrectCount'] += 1
            if topic and topic in goal_act['topicMastery']:
                goal_act['topicMastery'][topic] = max(35, goal_act['topicMastery'][topic] - 4)
                
    session['profile'] = profile
    
    return jsonify({
        'ok': True,
        'message': 'Interview session saved and learning profile updated.',
        'updatedActivity': goal_act
    })


@app.route('/api/interview/questions', methods=['GET'])
def api_interview_questions():
    goal = request.args.get('goal', 'placement')
    difficulty = request.args.get('difficulty', 'all')
    q_type = request.args.get('type', 'all')
    questions = get_interview_questions(goal, difficulty, q_type)
    return jsonify({
        'ok': True,
        'goal': goal,
        'count': len(questions),
        'questions': questions
    })


@app.route('/api/interview/daily-challenge', methods=['GET'])
def api_interview_daily_challenge():
    goal = request.args.get('goal', 'placement')
    weak_topic = request.args.get('weakTopic', '')
    challenge = get_daily_challenge(goal, weak_topic if weak_topic else None)
    return jsonify({
        'ok': True,
        'goal': goal,
        'challenge': challenge
    })


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    # If path starts with api/ and got here, it means the API route does not exist
    if path.startswith('api/'):
        return jsonify({"ok": False, "error": f"API route '/{path}' not found."}), 404
        
    if FRONTEND_BUILD_DIR.exists():
        target_file = FRONTEND_BUILD_DIR / path
        if path and target_file.exists() and target_file.is_file():
            return send_from_directory(str(FRONTEND_BUILD_DIR), path)
        index_file = FRONTEND_BUILD_DIR / "index.html"
        if index_file.exists():
            return send_from_directory(str(FRONTEND_BUILD_DIR), "index.html")
            
    return jsonify({
        "ok": True,
        "message": "AutoLearn AI Backend API is running.",
        "frontend": "http://localhost:3000",
        "api_status": "/api/status",
        "database": "AIEDUCATION",
    })


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)


