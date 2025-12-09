def is_kanji(char: str) -> bool:
    """문자가 한자인지 확인"""
    return '\u4e00' <= char <= '\u9fff'


def extract_kanji_from_word(word: str) -> list[str]:
    """단어에서 한자만 추출 (없으면 전각 언더바로 대체)"""
    kanji_list = [char for char in word if is_kanji(char)]
    if not kanji_list:
        kanji_list = ['＿']
    return kanji_list
