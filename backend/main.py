from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Path, Body
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import json

app = FastAPI()

# CORS 설정 (React가 다른 포트에서 실행될 때 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

JSON_FILE = "kanji_index.json"


class WordBase(BaseModel):
    category: Optional[List[str]] = Field(default_factory=list)

    @field_validator("category", mode="before")
    @classmethod
    def clean_category(cls, v):
        if not v:
            return []

        if isinstance(v, str):
            v = [v]

        cleaned = []
        for item in v:
            if isinstance(item, str):
                stripped = item.strip()
                if stripped and stripped not in cleaned:
                    cleaned.append(stripped)
        return cleaned
    

class Word(WordBase):
    word: str
    hiragana: str
    meaning: str
    korean: str
    category: Optional[List[str]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WordUpdate(WordBase):
    word: str
    hiragana: str
    meaning: str
    korean: str
    category: Optional[List[str]] = Field(default_factory=list)
    updated_at: datetime | None = None

def is_kanji(char: str) -> bool:
    """문자가 한자인지 확인"""
    return '\u4e00' <= char <= '\u9fff'


def load_data():
    with open(JSON_FILE, encoding="utf-8") as f:
        return json.load(f)
    

def save_data(data):
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)


def make_word_dict(word: BaseModel):
    """Word 모델을 dict로 변환하고 kanji_list 추가"""
    word_dict = word.model_dump()

    # 단어에서 한자만 추출 (없으면 전각 언더바로 대체)
    kanji_in_word = [char for char in word.word if is_kanji(char)]
    if not kanji_in_word:
        kanji_in_word = ['＿']

    word_dict["kanji_list"] = kanji_in_word
    return word_dict, kanji_in_word

    

# 모든 한자
@app.get("/kanji")
def get_all_kanji():
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)

    return list(data.keys())


# 모든 단어 리스트 조회
@app.get("/words_list")
def get_all_words():
    with open(JSON_FILE, encoding="utf-8") as f:
        data: dict = json.load(f)
    # 모든 단어를 한 리스트로 합치기
    all_words = []
    for words in data.values():
        all_words.extend(words)

    # 중복 단어 제거
    # 예: '行動'은 '行'과 '動' 두 한자 하위에 모두 존재하므로 중복 제거 필요
    seen = set()
    unique_words = []
    for w in all_words:
        key = json.dumps(w, sort_keys=True, ensure_ascii=False)
        if key not in seen:
            seen.add(key)
            unique_words.append(w)
    
    # 가장 최근에 추가된 단어가 위에 오도록 역순으로 반환
    result = sorted(unique_words, key=lambda x: x.get("updated_at", ""), reverse=True)
    return result


@app.get("/kanji/{kanji}")
def get_words(
        kanji: str = Path(
        ..., 
        description="검색할 한자 (예: 日, 月, 水 등)", 
        example="行"
    )
):
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)
        result = sorted(data.get(kanji, []), key=lambda x: (x.get("word", "").find(kanji), x.get("hiragana", "")))
    return result


@app.get("/categories")
def get_all_categories():
    data: dict = load_data()
    result = {
        category
        for word_list in data.values()
        for word in word_list
        for category in word["category"]
    }
    return sorted(result)


@app.get("/category/{category}")
def get_words_by_category(
    category: str = Path(
        ...,
        description="카테고리 (예: 자연물, 방향, 시간 등)",
        example="방향"
    )
):
    with open(JSON_FILE, encoding="utf-8") as f:
        data: dict = json.load(f)
        result = []
        for kanji, word_list in data.items():
            for word in word_list:
                if category in word["category"] and word not in result:
                    result.append(word)
    return sorted(result, key=lambda x: x["word"])


@app.post("/kanji")
def add_word(
    input_word: Word = Body(
        description="추가할 단어의 정보를 입력합니다.",
        example={
            "word": "先生",
            "hiragana": "せんせい",
            "meaning": "선생님",
            "korean": "센세이"
        }
    )
):
    """
    새로운 단어를 추가합니다.
    이미 존재하는 단어는 중복 추가되지 않습니다.
    """
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)
    
    word_dict, kanji_in_word = make_word_dict(input_word)

    for kanji in kanji_in_word:
        if kanji in data:
            # 이미 같은 단어가 없으면 추가
            if not any(w['word'] == input_word.word and w['hiragana'] == input_word.hiragana for w in data[kanji]):
                data[kanji].append(word_dict)
        else:
            data[kanji] = [word_dict]

    save_data(data)
    return {"status": "success"}


# ---------- update ----------
@app.put("/kanji")
def update_word(
    updated_word: WordUpdate = Body(
        example={
            "word": "記者",
            "hiragana": "きしゃ",
            "meaning": "기자",
            "korean": "키샤",
            "category": ["직업", "언론"]
        }
    )
):
    """
    이미 존재하는 단어 정보를 수정합니다.
    새 단어를 추가하지 않습니다.
    """

    data = load_data()
    found = False  # 수정된 항목이 있는지 확인용

    updated_dict, kanji_in_word = make_word_dict(updated_word)

    for kanji in kanji_in_word:
        if kanji in data:
            for i, item in enumerate(data[kanji]):
                if item["word"] == updated_word.word and item["hiragana"] == updated_word.hiragana:
                    updated_dict["created_at"] = item["created_at"]
                    updated_dict["updated_at"] = datetime.now(timezone.utc)
                    data[kanji][i] = updated_dict
                    found = True
                    break

    if not found:
        raise HTTPException(status_code=404, detail="해당 단어를 찾을 수 없습니다. (새 단어는 추가되지 않습니다)")

    save_data(data)
    return {"status": "success", "message": f"'{updated_word.word}' 단어 정보가 수정되었습니다."}
