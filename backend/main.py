from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

# Pydantic 모델 (POST 요청 검증용)
class Word(BaseModel):
    word: str
    hiragana: str
    meaning: str
    korean: str

def is_kanji(char: str) -> bool:
    """문자가 한자인지 확인"""
    return '\u4e00' <= char <= '\u9fff'

# 모든 한자
@app.get("/kanji")
def get_all_words():
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)

    # 각 한자별 단어 개수를 딕셔너리로 생성
    result = {kanji: len(words) for kanji, words in data.items()}

    return result


# 모든 단어 리스트
@app.get("/words_list")
def get_all_words():
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)
    # 모든 단어를 한 리스트로 합치기
    all_words = []
    for words in data.values():
        all_words.extend(words)
    return all_words


@app.get("/kanji/{kanji}")
def get_words(kanji: str):
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)
    return data.get(kanji, [])


@app.post("/kanji")
def add_word(input_word: Word):
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)
    
    # Word 모델 기본 필드를 dict로 변환
    word_dict = input_word.model_dump()

    # 단어에 포함된 모든 한자 추출
    kanji_in_word = [char for char in input_word.word if is_kanji(char)]

    # 추가 필드 삽입
    word_dict["kanji_list"] = kanji_in_word

    for kanji in kanji_in_word:
        if kanji in data:
            # 이미 같은 단어가 없으면 추가
            if not any(w['word'] == input_word.word for w in data[kanji]):
                data[kanji].append(word_dict)
        else:
            data[kanji] = [word_dict]

    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return {"status": "success"}