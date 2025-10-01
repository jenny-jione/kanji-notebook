import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function RandomKanji() {
  const [kanjiList, setKanjiList] = useState([]);
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:8000";

  // 1. 서버에서 한자 리스트 가져오기
  useEffect(() => {
    const fetchKanji = async () => {
      try {
        const res = await fetch(`${API_URL}/kanji`);
        const data = await res.json(); 
        setKanjiList(data); 
      } catch (err) {
        console.error("한자 데이터를 가져오는데 실패:", err);
      }
    };
    fetchKanji();
  }, []);

  // 2. 초기 랜덤 한자 선택 및 navigate
  useEffect(() => {
    if (kanjiList.length === 0) return;
    const randomKanji = kanjiList[Math.floor(Math.random() * kanjiList.length)];
    navigate(`/kanji/${randomKanji}`);
  }, [kanjiList, navigate]);

  return null;
}

export default RandomKanji;
