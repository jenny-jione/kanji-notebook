// WordTable.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./WordTable.css";
import { API_URL } from "../constants"; // ✅ import


function WordTable({ words, refreshWords }) {
  const navigate = useNavigate();
  const [editingWord, setEditingWord] = useState(null);
  const [editedData, setEditedData] = useState({});
  const autoFocusRef = useRef(null);

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

  const handleCheckCount = async (item, mode) => {
    try {
      const updatedCount =
        mode === "increase"
          ? (item.wrong_count || 0) + 1
          : Math.max((item.wrong_count || 0) - 1, 0); // 0 이하로 내려가지 않게

      const updated = {
        ...item,                       // 전체 필드 채움
        wrong_count: updatedCount,
      };

      const response = await fetch(`${API_URL}/kanji`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!response.ok) throw new Error("카운트 수정 실패");

      await refreshWords();
    } catch (error) {
      console.error(error);
    }
  };


  // 테이블에서 표시할 컬럼 옵션과 컬럼 표시 여부를 관리하는 상태 및 토글 함수
  const COLUMN_OPTIONS = [
    { key: "word", label: "단어" },
    { key: "hiragana", label: "히라가나" },
    { key: "meaning", label: "뜻" },
    { key: "korean", label: "한국어 발음" },
    { key: "category", label: "분류" },
    { key: "edit", label: "수정" }
  ];

  const [visibleColumns, setVisibleColumns] = useState(
    COLUMN_OPTIONS.map((col) => col.key) // 초기 상태: 전부 보이기
  );

  const toggleColumn = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key)
        ? prev.filter((col) => col !== key)
        : [...prev, key]
    );
  };



  useEffect(() => {
    if (editingWord && autoFocusRef.current) {
      autoFocusRef.current.focus();
    }
  }, [editingWord]);

  const formatKST = (utc) => {
  if (!utc) return "";
  return new Date(utc.replace(" ", "T")).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
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
    {/* 사용자가 표시할 컬럼을 선택할 수 있는 체크박스 UI */}
      <div className="column-selector">
        {COLUMN_OPTIONS.map((col) => (
          <label key={col.key} className="checkbox-label">
            <input
              type="checkbox"
              checked={visibleColumns.includes(col.key)}
              onChange={() => toggleColumn(col.key)}
            />
            <span>{col.label}</span>
          </label>
        ))}
      </div>

      {/* 선택된 컬럼(visibleColumns)에 따라 테이블 헤더와 데이터 행을 동적으로 렌더링 */}
      <table className="word-table">
        <thead>
          <tr>
            {visibleColumns.includes("word") && <th>단어</th>}
            {visibleColumns.includes("hiragana") && <th>히라가나</th>}
            {visibleColumns.includes("meaning") && <th>뜻</th>}
            {visibleColumns.includes("korean") && <th>한국어 발음</th>}
            {visibleColumns.includes("category") && <th>분류</th>}
            {visibleColumns.includes("edit") && <th>수정</th>}
          </tr>
        </thead>

        <tbody>
          {words.map((item) => (
            <tr key={`${item.word}-${item.hiragana}-${item.meaning}`}>

              {visibleColumns.includes("word") && (
                <td>{item.word}</td>
              )}

              {visibleColumns.includes("hiragana") && (
                <td>{item.hiragana}</td>
              )}

              {visibleColumns.includes("meaning") && (
                <td>{item.meaning}</td>
              )}

              {visibleColumns.includes("korean") && (
                <td className="korean-cell">{item.korean}</td>
              )}

              {visibleColumns.includes("kanji_list") && (
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
              )}

              {visibleColumns.includes("category") && (
                <td>
                  <div>
                    <span className="check-badge">{item.wrong_count}</span>
                    {item.category.map((c) => (
                      <button
                        key={c}
                        className="word-btn category-btn"
                        onClick={() => navigate(`/category/${c}`)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </td>
              )}

              {visibleColumns.includes("edit") && (
                <td>
                  <button
                    key={item.word}
                    className="word-btn category-btn"
                    onClick={() => handleEditClick(item)}
                  >
                    ✍🏻
                  </button>

                  <button
                    className="word-btn category-btn"
                    onClick={() => handleCheckCount(item, "increase")}
                  >
                    ✅
                  </button>

                  <button
                    className="word-btn category-btn"
                    onClick={() => handleCheckCount(item, "decrease")}
                  >
                    👏🏻
                  </button>
                </td>
              )}

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
            <h2>단어 수정</h2>
            <div className="form-row meta">
              단어 체크 횟수: {editedData.wrong_count}
              <br></br>
              {formatKST(editedData.created_at)}
              <br></br>
              {formatKST(editedData.updated_at)}
            </div>

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
            
            <div className="form-row">
              <label>분류</label>
              <input
                ref={autoFocusRef}
                value={editedData.category ? editedData.category.join(",") : ""}
                onChange={(e) =>
                  handleChange(
                    "category",
                    e.target.value.split(",").map((v) => v.trim())
                  )
                }
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
