// WordTable.js
import { Link, useNavigate } from "react-router-dom";

function WordTable({ words }) {
  const navigate = useNavigate();

  return (
    <table border="1" cellPadding="5" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
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
                    style={{ margin: "5px", fontSize: "15px" }}
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
