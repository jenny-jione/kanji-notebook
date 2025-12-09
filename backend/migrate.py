"""
JSON 데이터를 SQLite 데이터베이스로 마이그레이션하는 스크립트
"""

import json
from datetime import datetime
from database import init_db, get_db_connection
from utils import extract_kanji_from_word

JSON_FILE = "kanji_index.json"


def migrate_json_to_db():
    """JSON 파일의 모든 데이터를 SQLite로 마이그레이션"""

    # 데이터베이스 초기화
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # JSON 파일 읽기
    with open(JSON_FILE, encoding="utf-8") as f:
        json_data = json.load(f)

    # 전체 단어 수 추적 (중복 제거)
    migrated_count = 0
    duplicate_count = 0
    total_words = []

    # JSON 구조: { kanji: [word_objects] }
    for kanji, words_list in json_data.items():
        for word_obj in words_list:
            # 단어 정보 추출
            word = word_obj.get("word", "")
            hiragana = word_obj.get("hiragana", "")
            meaning = word_obj.get("meaning", "")
            korean = word_obj.get("korean", "")
            categories = word_obj.get("category", [])
            wrong_count = word_obj.get("wrong_count", 0)

            # created_at, updated_at 파싱
            created_at_str = word_obj.get("created_at", "")
            updated_at_str = word_obj.get("updated_at", "")

            # 이미 처리한 단어인지 확인 (중복 방지)
            is_duplicate = False
            for existing_word in total_words:
                if existing_word["word"] == word and existing_word["hiragana"] == hiragana:
                    is_duplicate = True
                    duplicate_count += 1
                    break

            if is_duplicate:
                continue

            total_words.append(
                {
                    "word": word,
                    "hiragana": hiragana,
                    "meaning": meaning,
                    "korean": korean,
                }
            )

            try:
                # 단어 삽입
                cursor.execute(
                    """
                    INSERT INTO words (word, hiragana, meaning, korean, wrong_count, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (word, hiragana, meaning, korean, wrong_count, created_at_str, updated_at_str),
                )
                word_id = cursor.lastrowid

                # 카테고리 추가
                if categories:
                    for category in categories:
                        # 카테고리 존재 여부 확인
                        cursor.execute("SELECT id FROM categories WHERE name = ?", (category,))
                        cat_row = cursor.fetchone()

                        if cat_row:
                            category_id = cat_row["id"]
                        else:
                            cursor.execute("INSERT INTO categories (name) VALUES (?)", (category,))
                            category_id = cursor.lastrowid

                        # 매핑 추가
                        cursor.execute(
                            "INSERT OR IGNORE INTO word_categories (word_id, category_id) VALUES (?, ?)",
                            (word_id, category_id),
                        )

                # 한자 인덱스 추가 (중복 제거)
                kanji_list = extract_kanji_from_word(word)
                kanji_set = set(kanji_list)  # 중복된 한자 제거
                for k in kanji_set:
                    cursor.execute(
                        "INSERT OR IGNORE INTO word_kanji (word_id, kanji) VALUES (?, ?)",
                        (word_id, k),
                    )

                migrated_count += 1

            except Exception as e:
                print(f"Error migrating word '{word}': {e}")
                continue

    conn.commit()
    conn.close()

    print(f"✅ 마이그레이션 완료!")
    print(f"  - 이동된 단어: {migrated_count}개")
    print(f"  - 제거된 중복: {duplicate_count}개")
    print(f"  - 총 고유 단어: {len(total_words)}개")


if __name__ == "__main__":
    migrate_json_to_db()
