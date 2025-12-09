from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import db_exists, init_db

# 라우터 임포트
from routes import router

app = FastAPI(title="JLPT 어휘 Web API", version="2.0.0")

# CORS 설정 (React가 다른 포트에서 실행될 때 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(router)


@app.on_event("startup")
def startup_event():
    """애플리케이션 시작 시 데이터베이스 초기화"""
    if not db_exists():
        print("📊 데이터베이스 생성 중...")
        init_db()
        print("✅ 데이터베이스 생성 완료!")
        print("\n마이그레이션을 실행하세요:")
        print("  python migrate.py")
    else:
        print("✅ 데이터베이스 준비 완료!")
