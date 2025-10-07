// WordTable.js
import { useNavigate } from "react-router-dom";
import "./WordTable.css";
import { API_URL } from "../constants"; // ✅ import


function WordTable({ words }) {
  const navigate = useNavigate();

  return (
    <table className="word-table">
      <thead>
        <tr>
          <th>단어</th>
          <th>히라가나</th>
          <th>뜻</th>
          <th>한국어 발음</th>
          <th>관련 링크</th>
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default WordTable;
