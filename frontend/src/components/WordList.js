// 특정 한자 페이지 - 그 한자를 가지고 있는 모든 단어들이 표시된다.

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WordTable from "./WordTable";
import '../App.css';


function WordList() {
  const { kanji } = useParams();
  const [words, setWords] = useState([]);
  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    if (!kanji) return;
    const fetchWords = async () => {
      const res = await fetch(`${API_URL}/kanji/${kanji}`);
      const data = await res.json();
      setWords(data);
    };
    fetchWords();
  }, [kanji]);


  return (
    <div style={{ padding: "20px" }}>
      <h2 className="section-title">{kanji}를 포함한 단어</h2>
      <WordTable words={words}></WordTable>
    </div>
  );
}

export default WordList;
