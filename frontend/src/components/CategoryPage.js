// 특정 한자 페이지 - 그 한자를 가지고 있는 모든 단어들이 표시된다.

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WordTable from "./WordTable";
import '../App.css';
import { API_URL } from "../constants";

function CategoryPage() {
  const { category } = useParams();
  const [words, setWords] = useState([]);

  // 🔹 데이터를 새로 불러오는 함수
  const fetchWords = async () => {
    if (!category) return;
    const res = await fetch(`${API_URL}/category/${category}`);
    const data = await res.json();
    setWords(data);
  };

  useEffect(() => {
    fetchWords();
  }, [category]);

  return (
    <div style={{ padding: "20px" }}>
      <div class="section-header">
        <h2 className="section-title">{category}</h2>
        {/* 🔹 WordTable에 refreshWords 전달 */}
        <div className="detail">(total: {words.length})</div>
      </div>
      <WordTable words={words} refreshWords={fetchWords} />
    </div>
  );
}

export default CategoryPage;
