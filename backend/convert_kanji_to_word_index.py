# kanji_index.json -> word_index.json

import json

# 기존 kanji_index.json 불러오기
with open("kanji_index.json", "r", encoding="utf-8") as f:
    kanji_index: dict = json.load(f)

word_index = {}

for kanji, words in kanji_index.items():
    for entry in words:
        word = entry["word"]
        data = {
            "hiragana": entry["hiragana"],
            "meaning": entry["meaning"],
            "korean": entry["korean"],
            "kanji_list": entry["kanji_list"]
        }

        if word not in word_index:
            word_index[word] = [data]  # 항상 리스트로 감싸서 저장
        else:
            # 중복 검사
            if data not in word_index[word]:
                word_index[word].append(data)

# word_index.json으로 저장
with open("word_index.json", "w", encoding="utf-8") as f:
    json.dump(word_index, f, ensure_ascii=False, indent=2)

print(f"word_index.json ✅  |  단어 {len(word_index):,}개  |  중복 제거 완료")
