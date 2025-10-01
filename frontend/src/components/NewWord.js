import { useState } from "react";
import { useParams } from "react-router-dom";


function NewWord() {
  const [newWord, setNewWord] = useState({ word: "", hiragana: "", meaning: "", korean: "" });
  const API_URL = "http://127.0.0.1:8000";


  const handleAddWord = async () => {
    await fetch(`${API_URL}/kanji`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWord),
    });
    setNewWord({ word: "", hiragana: "", meaning: "", korean: "" });
    const res = await fetch(`${API_URL}/kanji/${kanji}`);
    const data = await res.json();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>새 단어 추가</h3>
      <input placeholder="단어" value={newWord.word} onChange={(e) => setNewWord({ ...newWord, word: e.target.value })} />
      <input placeholder="히라가나" value={newWord.hiragana} onChange={(e) => setNewWord({ ...newWord, hiragana: e.target.value })} />
      <input placeholder="뜻" value={newWord.meaning} onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })} />
      <input placeholder="한국어 발음" value={newWord.korean} onChange={(e) => setNewWord({ ...newWord, korean: e.target.value })} />
      <button onClick={handleAddWord}>추가</button>
    </div>
  );
}

export default NewWord;
