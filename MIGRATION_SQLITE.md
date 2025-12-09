# SQLite 마이그레이션 완료

## 개요
JSON 파일 기반 단일 파일 구조에서 **SQLite 데이터베이스** + **모듈식 아키텍처**로 전환되었습니다.

---

## 📁 새로운 파일 구조

```
backend/
├── main.py                 # FastAPI 앱 진입점 (리팩터링됨)
├── models.py               # ✨ Pydantic 모델 정의
├── database.py             # ✨ SQLite 초기화 및 연결
├── repository.py           # ✨ 데이터 접근 계층 (CRUD 로직)
├── utils.py                # ✨ 유틸리티 함수 (is_kanji, extract_kanji)
├── routes.py               # ✨ APIRouter (모든 엔드포인트)
├── migrate.py              # ✨ JSON → SQLite 마이그레이션 스크립트
├── kanji_vocab.db          # ✨ SQLite 데이터베이스 (자동 생성)
├── kanji_index.json        # 기존 JSON (백업용, 필요시 삭제 가능)
├── requirements.txt        # 의존성 (변경 없음)
└── venv/                   # Python 가상환경
```

---

## 🎯 주요 개선사항

### 1. **모듈 분리 (관심사의 분리)**
- `models.py`: Pydantic 스키마 정의
- `database.py`: SQLite 연결 및 스키마
- `repository.py`: 모든 DB 쿼리 로직
- `routes.py`: API 엔드포인트 (비즈니스 로직과 분리)
- `utils.py`: 순수 함수들

### 2. **데이터 무결성**
- **동시성 안전**: SQLite의 자동 잠금으로 race condition 방지
- **트랜잭션 지원**: 원자적 연산 보장
- **외래키 제약**: 데이터 일관성 유지

### 3. **성능 향상**
- **인덱싱**: `word_kanji` 테이블로 한자 검색 최적화
- **정규화된 스키마**: 중복 데이터 제거 (카테고리별 정규화)
- **쿼리 성능**: JOIN으로 효율적 데이터 검색

### 4. **확장성**
- 테스트 작성 용이 (의존성 주입 가능)
- DB 마이그레이션 간단 (SQLAlchemy 추가 가능)
- 인증/권한 추가 용이

---

## 🚀 설정 및 실행 방법

### 1단계: 가상환경 설정 (이미 완료)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2단계: 데이터베이스 초기화 및 마이그레이션
```bash
source venv/bin/activate
python3 migrate.py
```

**출력 예시:**
```
✅ 마이그레이션 완료!
  - 이동된 단어: 2061개
  - 제거된 중복: 1421개
  - 총 고유 단어: 2067개
```

### 3단계: FastAPI 앱 실행
```bash
source venv/bin/activate
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 4단계: Frontend 실행
```bash
cd ../frontend
npm start
```

---

## 📊 데이터베이스 스키마

### words 테이블
```sql
CREATE TABLE words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  hiragana TEXT NOT NULL,
  meaning TEXT NOT NULL,
  korean TEXT NOT NULL,
  wrong_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(word, hiragana)
)
```

### categories 테이블
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
)
```

### word_categories 테이블 (N:M 매핑)
```sql
CREATE TABLE word_categories (
  word_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (word_id, category_id),
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
)
```

### word_kanji 테이블 (한자 인덱스)
```sql
CREATE TABLE word_kanji (
  word_id INTEGER NOT NULL,
  kanji TEXT NOT NULL,
  PRIMARY KEY (word_id, kanji),
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
)
```

---

## 🔄 API 엔드포인트 변경 사항

### 호환 유지 (변경 없음)
```
GET  /kanji                  # 모든 한자 조회
GET  /kanji/{kanji}          # 특정 한자의 단어 조회
GET  /words_list             # 모든 단어 조회
GET  /categories             # 모든 카테고리 조회
GET  /category/{category}    # 특정 카테고리의 단어 조회
POST /kanji                  # 새 단어 추가
```

### 변경됨 (Frontend 수정 필요)
```
PUT  /kanji/{word_id}        # 단어 수정 (기존: PUT /kanji)
DELETE /kanji/{word_id}      # 단어 삭제 (새로 추가)
```

**Frontend 수정:**
- `WordTable.js`: PUT 요청 URL을 `/kanji/${word_id}`로 변경 ✅
- `NewWord.js`: 변경 없음 (POST는 그대로 작동)

---

## ✅ 마이그레이션 통계

- **총 이동 단어**: 2,061개
- **제거된 중복**: 1,421개
- **총 고유 단어**: 2,067개
- **총 한자**: 1,102개
- **총 카테고리**: 86개

---

## 🔍 테스트 및 검증

### 데이터베이스 확인
```bash
source venv/bin/activate
python3 -c "
from repository import WordRepository

words = WordRepository.get_all_words()
print(f'✅ 총 단어: {len(words)}개')
print(f'📝 샘플: {words[0]}')
"
```

### API 확인
```bash
curl http://127.0.0.1:8000/kanji
curl http://127.0.0.1:8000/words_list
curl http://127.0.0.1:8000/categories
```

---

## 📝 기존 JSON 파일

`kanji_index.json`은 여전히 존재합니다. 마이그레이션 검증 후 삭제 가능합니다:

```bash
rm kanji_index.json
```

---

## 🛠️ 향후 계획 (선택사항)

1. **ORM 도입** (SQLAlchemy): SQL 쿼리를 더 간단히
2. **마이그레이션 도구** (Alembic): DB 스키마 버전 관리
3. **테스트 추가**: pytest로 단위/통합 테스트
4. **캐싱** (Redis): 자주 조회하는 데이터 캐싱
5. **인증** (JWT): API 보안 강화

---

## ❓ 문제 해결

### 데이터베이스 초기화 오류
```bash
rm kanji_vocab.db  # 기존 DB 삭제
python3 migrate.py # 재생성
```

### FastAPI 모듈 임포트 오류
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend 실행 오류
```bash
# WordTable.js의 PUT 요청이 올바른지 확인
# /kanji/${editingWord.id} 형식 사용
```

---

**마이그레이션 완료! 🎉**
