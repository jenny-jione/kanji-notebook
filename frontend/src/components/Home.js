import { useState, useEffect } from "react";
import WordTable from "./WordTable";
import "../App.css";
import { API_URL } from "../constants";


function Home() {
  const [words, setWords] = useState([]);

  const fetchAllWords = async () => {
    const res = await fetch(`${API_URL}/words_list`);
    const data = await res.json();
    setWords(data);
  };

  useEffect(() => {
    fetchAllWords();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div class="section-header">
        <h1 className="section-title">전체 단어 목록</h1>
        <div className="detail">(total: {words.length})</div>
      </div>
      {/* ✅ 갱신 함수도 props로 전달 */}
      <WordTable words={words} refreshWords={fetchAllWords} />
    </div>
  );
}

export default Home;
