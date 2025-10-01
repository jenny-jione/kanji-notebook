import { useState, useEffect } from "react";
import WordTable from "./WordTable";
import "../App.css";


function Home() {
  const [words, setWords] = useState([]);
  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchAllWords = async () => {
      const res = await fetch(`${API_URL}/words_list`);
      const data = await res.json();
      setWords(data);
    };
    fetchAllWords();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
        <h1 className="section-title">전체 단어 목록</h1>
        <WordTable words={words}></WordTable>

    </div>
  );
}

export default Home;
