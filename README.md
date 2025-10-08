# JLPT & Hanja Study App

## 📁 프로젝트 구조
backend/     → FastAPI 서버  
frontend/    → React 웹 클라이언트


## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React, JavaScript, React Router |
| **Backend** | FastAPI, Python |
| **Database** | JSON (로컬 데이터 파일 기반) |
| **배포(선택)** | AWS EC2, Nginx |
| **기타** | Axios, ESLint, Prettier |



## 🚀 실행 방법
### 1. 백엔드 (FastAPI)
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
- 서버 실행 후 기본 주소: http://127.0.0.1:8000

- Swagger 문서 확인: http://127.0.0.1:8000/docs


### 2. 프론트엔드 (React)
```
cd frontend
npm install
npm start
```

- 기본 실행 주소: http://localhost:3000
- API 요청은 FastAPI 서버(8000번 포트)와 연동됩니다.

## 🔗 API 연동
- Base URL: http://localhost:8000
- 주요 엔드포인트:
  - GET /kanji : 모든 한자 목록 반환
  - PUT /kanji : 단어 정보 수정
  - POST /kanji : 단어 추가


## 🔗 주요 API

| Method | Endpoint        | 설명                          |
|--------|----------------|-------------------------------|
| GET    | /kanji         | 모든 한자 목록 반환           |
| POST   | /kanji         | 새 단어 추가                  |
| PUT    | /kanji         | 기존 단어 수정                |
| GET    | /kanji/{kanji} | 특정 한자 관련 단어 조회      |


## 💡 주요 기능

- ✅ 한자 및 단어 목록 보기
- 🔍 단어 검색 및 필터링
- 🎯 랜덤 퀴즈 / 오답노트
- 📖 한자별 단어 모음 보기


## 🧠 개발 포인트

- FastAPI를 이용한 RESTful API 설계
- React Router로 페이지 전환 구현
- 한자 데이터를 JSON 구조로 관리하며 CRUD 기능 제공
- 실제 사용 경험을 바탕으로 UI/UX 개선 반복


## 🧩 앞으로의 개선 방향

- ✅ SQLite 또는 MySQL로 데이터베이스 전환
- ✅ 사용자별 학습 데이터 저장 기능 추가
- ✅ JWT 기반 로그인 기능
- ✅ 프론트엔드 UI 개선 및 반응형 디자인 적용
