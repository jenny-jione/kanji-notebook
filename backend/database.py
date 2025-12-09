import sqlite3
from datetime import datetime, timezone
from typing import List, Optional
import os

DATABASE_URL = "kanji_vocab.db"


def get_db_connection():
    """SQLite 연결 획득"""
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """데이터베이스 초기화 - 테이블 생성"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Words 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            hiragana TEXT NOT NULL,
            meaning TEXT NOT NULL,
            korean TEXT NOT NULL,
            wrong_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(word, hiragana)
        )
    """)

    # Categories 테이블 (N:M 관계)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    """)

    # Word-Category 매핑 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS word_categories (
            word_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (word_id, category_id),
            FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
    """)

    # Kanji 인덱스 테이블 (검색 최적화)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS word_kanji (
            word_id INTEGER NOT NULL,
            kanji TEXT NOT NULL,
            PRIMARY KEY (word_id, kanji),
            FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()


def db_exists() -> bool:
    """데이터베이스 파일이 존재하는지 확인"""
    return os.path.exists(DATABASE_URL)
