import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./components/Home";
import KanjiPage from "./components/KanjiPage";
import Categories from "./components/Categories";
import CategoryPage from "./components/CategoryPage";
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
  const bookmark = "북마크"

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "1":
          navigate("/");          // 1 → 전체목록
          break;
        case "0":
          navigate("/add");       // 0 → 단어 추가
          break;
        case "7":
          navigate("/kanji");    // 7 → 랜덤한자
          break;
        case "8":
          navigate("/categories");    // 8 → 카테고리
          break;
        case "9":
          navigate(`/category/${bookmark}`);       // 9 → 북마크 페이지
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
        <button onClick={() => navigate("/categories")}>카테고리</button>
        <button onClick={() => navigate(`/category/${bookmark}`)}>북마크</button>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kanji/:kanji" element={<KanjiPage />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/kanji" element={<RandomKanji />} />
        <Route path="/add" element={<NewWord />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
