from fastapi import FastAPI, HTTPException, Body
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


def load_data():
    with open(JSON_FILE, encoding="utf-8") as f:
        return json.load(f)
    

def save_data(data):
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def make_word_dict(word: Word):
    """Word 모델을 dict로 변환하고 kanji_list 추가"""
    word_dict = word.model_dump()
    kanji_in_word = [char for char in word.word if is_kanji(char)]
    word_dict["kanji_list"] = kanji_in_word
    return word_dict, kanji_in_word

    

# 모든 한자
@app.get("/kanji")
def get_all_kanji():
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)

    return list(data.keys())


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


# ---------- update ----------
@app.put("/kanji")
def update_word(
    updated_word: Word = Body(
        example={
            "word": "記者",
            "hiragana": "きしゃ",
            "meaning": "기자",
            "korean": "키샤"
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
            data[kanji] = [updated_dict]
            found = True

    if not found:
        raise HTTPException(status_code=404, detail="해당 단어를 찾을 수 없습니다. (새 단어는 추가되지 않습니다)")

    save_data(data)
    return {"status": "success", "message": f"'{updated_word.word}' 단어 정보가 수정되었습니다."}
