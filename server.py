from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

# 1. 환경 변수 로드
load_dotenv()

app = FastAPI()

# 2. 리액트(3000번 포트)와의 통신 허용 (CORS 설정 필수!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. DB 엔진 생성 함수
def get_db_engine():
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    database = os.getenv("DB_NAME")
    db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}?ssl_ca=true"
    return create_engine(db_url)

# 4. 리액트가 호출할 '데이터 전송' 주소(Endpoint)
@app.get("/api/smishing-stats")
def get_smishing_stats():
    try:
        engine = get_db_engine()
        
        # SQL로 필요한 데이터 가져오기 (예: 유형별 개수 세기)
        query = "SELECT smishing_type, COUNT(*) as count FROM lgaidataset_all_classified GROUP BY smishing_type"
        df = pd.read_sql(query, engine)
        
        # 리액트가 읽기 편한 리스트/딕셔너리 형태로 변환
        result = df.to_dict(orient='records')
        
        return {
            "status": "success",
            "data": result,
            "total_rows": len(df)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# 서버 실행: uvicorn server:app --reload