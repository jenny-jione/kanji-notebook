// WordTable.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WordTable.css";
import { API_URL } from "../constants"; // ✅ import


function WordTable({ words, refreshWords }) {
  const navigate = useNavigate();
  const [editingWord, setEditingWord] = useState(null);
  const [editedData, setEditedData] = useState({});


  const handleEditClick = (item) => {
    setEditingWord(item);
    setEditedData({ ...item });
  };

  const handleChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/kanji`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error("수정 실패");
      console.log("수정 성공!");
      setEditingWord(null); // 모달 닫기
      await refreshWords(); // ✅ 부모에서 다시 데이터 fetch
    } catch (error) {
      console.error(error);
    }
  };



  // ✅ ESC 키 누르면 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setEditingWord(null);
      }
    };
    if (editingWord) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingWord]);

  return (
    <>
      <table className="word-table">
        <thead>
          <tr>
            <th>단어</th>
            <th>히라가나</th>
            <th>뜻</th>
            <th>한국어 발음</th>
            <th>관련 링크</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          {words.map((item) => (
            <tr key={item.word}>
              <td>{item.word}</td>
              <td>{item.hiragana}</td>
              <td>{item.meaning}</td>
              <td>{item.korean}</td>
              <td>
                <div>
                  {item.kanji_list.map((kanji) => (
                    <button
                      key={kanji}
                      className="word-btn"
                      onClick={() => navigate(`/kanji/${kanji}`)}
                    >
                      {kanji}
                    </button>
                  ))}
                </div>
              </td>
              <td>
                <button
                  key={item.word}
                  className="word-btn"
                  onClick={() => handleEditClick(item)}
                >
                  ✍🏻
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ 모달창 */}
      {editingWord && (
        <div className="modal-overlay" onClick={() => setEditingWord(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // 배경 클릭 시 닫힘 방지
          >
            <h3>단어 수정</h3>
            <div className="form-row">
              <label>단어</label>
              <input
                value={editedData.word}
                onChange={(e) => handleChange("word", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>히라가나</label>
              <input
                value={editedData.hiragana}
                onChange={(e) => handleChange("hiragana", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>뜻</label>
              <input
                value={editedData.meaning}
                onChange={(e) => handleChange("meaning", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>한국어 발음</label>
              <input
                value={editedData.korean}
                onChange={(e) => handleChange("korean", e.target.value)}
              />
            </div>

            <button className="add-btn" onClick={handleSave}>
              저장
            </button>
            <button
              className="add-btn"
              style={{ backgroundColor: "#ccc", marginTop: "10px" }}
              onClick={() => setEditingWord(null)}
            >
              취소
            </button>
          </div>
        </div>
      )}


    </>
  );
}

export default WordTable;
