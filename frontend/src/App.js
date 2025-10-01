import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./components/Home";
import KanjiPage from "./components/KanjiPage";
import NewWord from "./components/NewWord";
import RandomKanji from "./components/RandomKanji";
import "./App.css";  // CSS 파일 import


function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "1":
          navigate("/");          // 1 → 전체목록
          break;
        case "2":
          navigate("/kanji");    // 2 → 랜덤한자
          break;
        case "3":
          navigate("/quiz");    // 3 → 단어 퀴즈
          break;
        case "4":
          navigate("/add");       // 4 → 단어 추가
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // cleanup
    };
  }, [navigate]);


  return (
    <>
      {/* 상단 네비게이션바 */}
      <nav className="navbar">
        <button onClick={() => navigate("/")}>전체목록</button>
        <button onClick={() => navigate("/kanji")}>랜덤한자</button>
        <button onClick={() => navigate("/search")}>검색</button>
        <button onClick={() => navigate("/add")}>단어 추가</button>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kanji/:kanji" element={<KanjiPage />} />
        <Route path="/kanji" element={<RandomKanji />} />
        <Route path="/add" element={<NewWord />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
