// 모든 카테고리들이 표시된다

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css';
import { API_URL } from "../constants";

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // 🔹 데이터를 새로 불러오는 함수
  const fetchWords = async () => {
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
        <div className="word-btn-container">
          {categories.map((item, index) => (
            <button
              key={index}
              className="word-btn"
              onClick={() => navigate(`/category/${item}`)}
            >
              {item}
            </button>
          ))}
        </div>
    </div>
  );
}

export default Categories;
