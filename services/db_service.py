from __future__ import annotations

import os
import uuid
import datetime
from typing import Any, Dict, List, Optional
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGODB_DB_NAME", "AIEDUCATION")

_client: Optional[MongoClient] = None
_db = None

# In-memory fallback dictionary for when MongoDB server is offline
_MEMORY_USERS: Dict[str, Dict[str, Any]] = {}


def get_client() -> Optional[MongoClient]:
    global _client
    if _client is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500, connectTimeoutMS=2500)
            # Ping to verify connection
            _client.admin.command('ping')
        except Exception as err:
            _client = None
    return _client


def get_db():
    global _db
    client = get_client()
    if client:
        try:
            _db = client[MONGO_DB_NAME]
            return _db
        except Exception:
            return None
    return None


def get_db_status() -> Dict[str, Any]:
    try:
        client = get_client()
        if not client:
            return {
                "connected": False,
                "database": MONGO_DB_NAME,
                "uri": MONGO_URI,
                "collections": [],
                "error": "Could not connect to MongoDB server"
            }
        db = client[MONGO_DB_NAME]
        collections = db.list_collection_names()
        return {
            "connected": True,
            "database": MONGO_DB_NAME,
            "uri": MONGO_URI,
            "collections": collections,
            "collections_count": len(collections),
            "error": None
        }
    except Exception as e:
        return {
            "connected": False,
            "database": MONGO_DB_NAME,
            "uri": MONGO_URI,
            "collections": [],
            "error": str(e)
        }


# ─────────────────────────────────────────────────────────────
# USER AUTHENTICATION & PROFILE METHODS (MongoDB AIEDUCATION)
# ─────────────────────────────────────────────────────────────

def register_user(name: str, email: str, password: str, goal: str = "placement") -> Dict[str, Any]:
    """
    Registers a new user in MongoDB database AIEDUCATION (collection: users).
    Hashes password using secure Werkzeug hashing.
    """
    clean_email = email.strip().lower()
    clean_name = name.strip()
    
    if not clean_email or not password:
        return {"ok": False, "error": "Email and password are required."}
    
    # Check if user already exists
    existing = find_user_by_email(clean_email)
    if existing:
        return {"ok": False, "error": "An account with this email already exists."}
    
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    pw_hash = generate_password_hash(password)
    now_iso = datetime.datetime.utcnow().isoformat()
    
    user_doc = {
        "user_id": user_id,
        "name": clean_name or clean_email.split('@')[0],
        "email": clean_email,
        "password_hash": pw_hash,
        "goal": goal or "placement",
        "created_at": now_iso,
        "last_login": now_iso,
        "role": "student"
    }
    
    # Save to MongoDB
    db = get_db()
    saved_in_mongo = False
    if db is not None:
        try:
            # Create unique index on email if not exists
            db["users"].create_index("email", unique=True)
            db["users"].insert_one(dict(user_doc))
            saved_in_mongo = True
        except Exception as e:
            # If unique constraint violation
            if "duplicate key" in str(e).lower() or "11000" in str(e):
                return {"ok": False, "error": "An account with this email already exists."}
    
    # Also save to memory fallback
    _MEMORY_USERS[clean_email] = dict(user_doc)
    
    # Return sanitized user data (never send password hash)
    safe_user = {
        "user_id": user_id,
        "name": user_doc["name"],
        "email": user_doc["email"],
        "goal": user_doc["goal"],
        "created_at": user_doc["created_at"],
        "storage": "mongodb" if saved_in_mongo else "memory"
    }
    return {"ok": True, "user": safe_user, "message": "Account created successfully!"}


def login_user(email: str, password: str) -> Dict[str, Any]:
    """
    Authenticates a user against MongoDB database AIEDUCATION.
    """
    clean_email = email.strip().lower()
    if not clean_email or not password:
        return {"ok": False, "error": "Please provide both email and password."}
    
    user_doc = None
    db = get_db()
    if db is not None:
        try:
            user_doc = db["users"].find_one({"email": clean_email})
        except Exception:
            user_doc = None
    
    if not user_doc and clean_email in _MEMORY_USERS:
        user_doc = _MEMORY_USERS[clean_email]
        
    if not user_doc:
        return {"ok": False, "error": "Invalid email or password."}
        
    pw_hash = user_doc.get("password_hash")
    if not pw_hash or not check_password_hash(pw_hash, password):
        return {"ok": False, "error": "Invalid email or password."}
        
    # Update last login timestamp
    now_iso = datetime.datetime.utcnow().isoformat()
    if db is not None:
        try:
            db["users"].update_one({"email": clean_email}, {"$set": {"last_login": now_iso}})
        except Exception:
            pass
            
    if clean_email in _MEMORY_USERS:
        _MEMORY_USERS[clean_email]["last_login"] = now_iso
        
    safe_user = {
        "user_id": user_doc.get("user_id"),
        "name": user_doc.get("name"),
        "email": user_doc.get("email"),
        "goal": user_doc.get("goal", "placement"),
        "created_at": user_doc.get("created_at"),
        "last_login": now_iso
    }
    return {"ok": True, "user": safe_user, "message": "Login successful!"}


def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    clean_email = email.strip().lower()
    db = get_db()
    if db is not None:
        try:
            doc = db["users"].find_one({"email": clean_email}, {"_id": 0})
            if doc:
                return doc
        except Exception:
            pass
    return _MEMORY_USERS.get(clean_email)


def find_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    if db is not None:
        try:
            doc = db["users"].find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
            if doc:
                return doc
        except Exception:
            pass
    for u in _MEMORY_USERS.values():
        if u.get("user_id") == user_id:
            safe = dict(u)
            safe.pop("password_hash", None)
            return safe
    return None


def save_user_profile(profile: Dict[str, Any], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        doc = dict(profile)
        doc["user_id"] = user_id
        doc["updated_at"] = datetime.datetime.utcnow().isoformat()
        db["users"].update_one({"user_id": user_id}, {"$set": doc}, upsert=True)
        return True
    except Exception:
        return False


def get_user_profile(user_id: str = "default_student") -> Optional[Dict[str, Any]]:
    try:
        db = get_db()
        if db is None:
            return None
        doc = db["users"].find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        return doc
    except Exception:
        return None


def save_study_session(session_data: Dict[str, Any], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        doc = dict(session_data)
        doc["user_id"] = user_id
        doc["created_at"] = datetime.datetime.utcnow().isoformat()
        db["study_sessions"].insert_one(doc)
        return True
    except Exception:
        return False


def save_quiz_attempt(quiz_result: Dict[str, Any], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        doc = dict(quiz_result)
        doc["user_id"] = user_id
        doc["timestamp"] = datetime.datetime.utcnow().isoformat()
        db["quiz_attempts"].insert_one(doc)
        
        # Also record in results collection for analytics
        db["results"].insert_one({
            "user_id": user_id,
            "type": "quiz",
            "score": quiz_result.get("score"),
            "total": quiz_result.get("total"),
            "score_pct": quiz_result.get("score_pct"),
            "topic": quiz_result.get("topic", "general"),
            "created_at": datetime.datetime.utcnow().isoformat()
        })
        return True
    except Exception:
        return False


def save_tutor_chat(chat_data: Dict[str, Any], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        doc = dict(chat_data)
        doc["user_id"] = user_id
        doc["timestamp"] = datetime.datetime.utcnow().isoformat()
        db["chat_history"].insert_one(doc)
        return True
    except Exception:
        return False


def save_topic_mastery(assessment: List[Dict[str, Any]], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        for item in assessment:
            topic = item.get("topic")
            if not topic:
                continue
            mastery_doc = {
                "user_id": user_id,
                "topic": topic,
                "score_pct": item.get("score_pct", 0),
                "predicted_level": item.get("predicted_level", "beginner"),
                "status": item.get("status", "in_progress"),
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            db["topic_mastery"].update_one(
                {"user_id": user_id, "topic": topic},
                {"$set": mastery_doc},
                upsert=True
            )
        return True
    except Exception:
        return False


def get_chat_history(user_id: str = "default_student", limit: int = 20) -> List[Dict[str, Any]]:
    try:
        db = get_db()
        if db is None:
            return []
        cursor = db["chat_history"].find({"user_id": user_id}, {"_id": 0}).sort("timestamp", -1).limit(limit)
        return list(cursor)[::-1]
    except Exception:
        return []
