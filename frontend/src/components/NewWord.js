import { useState, useRef, useEffect } from "react";
import "./NewWord.css";  // CSS import

function NewWord() {
  const [newWord, setNewWord] = useState({ word: "", hiragana: "", meaning: "", korean: "", category: [] });
  const [categoryText, setCategoryText] = useState(""); // 입력창에 보이는 문자열
  const API_URL = "http://127.0.0.1:8000";

  // ref 선언
  const meaningInputRef = useRef(null);

  // 🔹 컴포넌트가 처음 렌더링될 때 커서 이동
  useEffect(() => {
    if (meaningInputRef.current) {
      meaningInputRef.current.focus();
    }
  }, []);

  const handleAddWord = async () => {
    const categoryArray = categoryText
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");

    const payload = {
      ...newWord,
      category: categoryArray,
    };

    await fetch(`${API_URL}/kanji`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
      
    // 초기화
    setNewWord({
      word: "",
      hiragana: "",
      meaning: "",
      korean: "",
      category: [],
    });
    setCategoryText("");

    // 커서 이동
    if (meaningInputRef.current) {
      meaningInputRef.current.focus();
    }
  };

  return (
    <div className="word-form">
      <h3>새 단어 추가</h3>

      <div className="form-row">
        <label>뜻</label>
        <input
          ref={meaningInputRef}  // ref 연결
          placeholder="뜻"
          value={newWord.meaning}
          onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label>한국어 발음</label>
        <input
          placeholder="한국어 발음"
          value={newWord.korean}
          onChange={(e) => setNewWord({ ...newWord, korean: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label>단어</label>
        <input
          placeholder="단어"
          value={newWord.word}
          onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label>히라가나</label>
        <input
          placeholder="히라가나"
          value={newWord.hiragana}
          onChange={(e) => setNewWord({ ...newWord, hiragana: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label>카테고리</label>
        <input
          placeholder="예: 직업"
          value={categoryText}
          onChange={(e) => setCategoryText(e.target.value)}
        />
      </div>


      <button className="add-btn" onClick={handleAddWord}>추가</button>
    </div>
  );
}

export default NewWord;
