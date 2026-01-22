from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS 설정: 리액트 포트(5173 또는 3000) 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"], # 두 포트 모두 추가
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_engine():
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    database = os.getenv("DB_NAME")
    db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
    return create_engine(db_url, connect_args={"ssl": {"fake_option_to_enable_ssl": True}})

@app.get("/api/smishing-stats")
def get_smishing_stats():
    try:
        engine = get_db_engine()
        query = "SELECT smishing_type, COUNT(*) as count FROM lgaidataset_all_classified GROUP BY smishing_type"
        df = pd.read_sql(query, engine)
        result = df.to_dict(orient='records')
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
